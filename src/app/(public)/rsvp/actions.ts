"use server";

/* ──────────────────────────────────────────────
   RSVP Server Actions (Phase 3)
   All database writes go through here.
   ────────────────────────────────────────────── */

import { createAdminClient } from "@/lib/supabase/admin";
import { setGuestCookie, getGuestFromCookie } from "@/lib/session";
import {
  lookupSchema,
  selectCandidateSchema,
  rsvpSubmissionSchema,
  type RsvpSubmission,
} from "@/lib/validations/rsvp";
import { sendTransactionalEmail, TEMPLATES } from "@/lib/brevo";
import type {
  Guest,
  Event,
  Rsvp,
  GuestLookupResult,
  GuestRsvpData,
  RsvpEventData,
} from "@/types/database";

/* ── Types for action responses ── */

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

type LookupResult =
  | { found: "single"; guest: { id: string; name: string } }
  | { found: "multiple"; candidates: { id: string; name: string }[] }
  | { found: "none" };

/* ── 1. Guest Lookup ── */

export async function lookupGuest(
  searchText: string
): Promise<ActionResult<LookupResult>> {
  const parsed = lookupSchema.safeParse({ searchText });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("lookup_guest", {
    search_text: parsed.data.searchText,
  });

  if (error) {
    console.error("[RSVP] Lookup error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  const results = (data ?? []) as GuestLookupResult[];

  if (results.length === 0) {
    return {
      success: true,
      data: { found: "none" },
    };
  }

  if (results.length === 1) {
    await setGuestCookie(results[0].id);
    return {
      success: true,
      data: {
        found: "single",
        guest: { id: results[0].id, name: results[0].name },
      },
    };
  }

  // Multiple matches — guest must disambiguate
  return {
    success: true,
    data: {
      found: "multiple",
      candidates: results.map((r) => ({ id: r.id, name: r.name })),
    },
  };
}

/* ── 2. Select Candidate (disambiguation) ── */

export async function selectCandidate(
  guestId: string
): Promise<ActionResult<{ id: string; name: string }>> {
  const parsed = selectCandidateSchema.safeParse({ guestId });
  if (!parsed.success) {
    return { success: false, error: "Invalid selection." };
  }

  const supabase = createAdminClient();
  const { data: guest, error } = await supabase
    .from("guests")
    .select("id, name")
    .eq("id", parsed.data.guestId)
    .single();

  if (error || !guest) {
    return { success: false, error: "Guest not found." };
  }

  await setGuestCookie(guest.id);
  return { success: true, data: { id: guest.id, name: guest.name } };
}

/* ── 3. Get Guest RSVP Data (for the form) ── */

export async function getGuestRsvpData(): Promise<
  ActionResult<GuestRsvpData>
> {
  const guestId = await getGuestFromCookie();
  if (!guestId) {
    return { success: false, error: "session_expired" };
  }

  const supabase = createAdminClient();

  // Fetch guest
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .single();

  if (guestError || !guest) {
    return { success: false, error: "Guest not found." };
  }

  // Fetch events this guest's cohort is invited to
  const { data: eventCohorts, error: ecError } = await supabase
    .from("event_cohorts")
    .select("event_id")
    .eq("cohort", guest.cohort);

  if (ecError) {
    console.error("[RSVP] Event cohorts error:", ecError);
    return { success: false, error: "Something went wrong." };
  }

  const eventIds = (eventCohorts ?? []).map(
    (ec: { event_id: string }) => ec.event_id
  );

  if (eventIds.length === 0) {
    return {
      success: true,
      data: { guest: guest as Guest, events: [] },
    };
  }

  // Fetch event details
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .order("sort_order", { ascending: true });

  if (eventsError) {
    console.error("[RSVP] Events error:", eventsError);
    return { success: false, error: "Something went wrong." };
  }

  // Fetch existing RSVPs
  const { data: existingRsvps, error: rsvpError } = await supabase
    .from("rsvps")
    .select("*")
    .eq("guest_id", guestId)
    .in("event_id", eventIds);

  if (rsvpError) {
    console.error("[RSVP] Existing RSVPs error:", rsvpError);
    // Non-fatal — continue with empty RSVPs
  }

  const rsvpMap = new Map(
    ((existingRsvps ?? []) as Rsvp[]).map((r) => [r.event_id, r])
  );

  // Refresh the session cookie (rolling expiry)
  await setGuestCookie(guestId);

  const eventData: RsvpEventData[] = ((events ?? []) as Event[]).map(
    (event) => ({
      event,
      existingRsvp: rsvpMap.get(event.id) ?? null,
    })
  );

  return {
    success: true,
    data: { guest: guest as Guest, events: eventData },
  };
}

/* ── 4. Submit RSVP ── */

export async function submitRsvp(
  input: RsvpSubmission
): Promise<ActionResult<{ guestName: string }>> {
  const guestId = await getGuestFromCookie();
  if (!guestId) {
    return { success: false, error: "session_expired" };
  }

  const parsed = rsvpSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0].message,
    };
  }

  // Check RSVP cutoff
  const cutoff = process.env.RSVP_CUTOFF_DATE;
  if (cutoff && new Date() > new Date(cutoff)) {
    return {
      success: false,
      error:
        "The RSVP deadline has passed. Please contact us directly to make changes.",
    };
  }

  const supabase = createAdminClient();

  // Fetch guest for email
  const { data: guest } = await supabase
    .from("guests")
    .select("id, name, email")
    .eq("id", guestId)
    .single();

  if (!guest) {
    return { success: false, error: "Guest not found." };
  }

  const { responses, songRequest, globalDietaryNotes } = parsed.data;

  // Upsert all RSVP responses
  const upsertRows = responses.map((r) => ({
    guest_id: guestId,
    event_id: r.eventId,
    status: r.status,
    plus_one_attending: r.plusOneAttending,
    kids_attending: r.kidsAttending,
    dietary_notes: r.dietaryNotes || globalDietaryNotes || null,
    song_request: songRequest || null,
    response_date: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase.from("rsvps").upsert(
    upsertRows,
    { onConflict: "guest_id,event_id" }
  );

  if (upsertError) {
    console.error("[RSVP] Upsert error:", upsertError);
    return { success: false, error: "Failed to save your RSVP. Please try again." };
  }

  // Send confirmation email (best-effort, don't block on failure)
  if (guest.email) {
    const accepted = responses
      .filter((r) => r.status === "accepted")
      .map((r) => r.eventId);

    sendTransactionalEmail({
      to: { email: guest.email, name: guest.name },
      templateId: TEMPLATES.RSVP_CONFIRMATION,
      params: {
        guestName: guest.name,
        acceptedCount: accepted.length,
        totalEvents: responses.length,
      },
    }).then(async (messageId) => {
      if (messageId) {
        await supabase.from("email_log").insert({
          guest_id: guestId,
          template: "RSVP_CONFIRMATION",
          brevo_message_id: messageId,
          status: "sent",
        });
      }
    }).catch((err) => {
      console.error("[RSVP] Email send error:", err);
    });
  }

  return { success: true, data: { guestName: guest.name } };
}
