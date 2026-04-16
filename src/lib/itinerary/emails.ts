"use server";

/* ──────────────────────────────────────────────
   Itinerary email server actions (Phase 4)
   Manually triggerable — scheduling is separate.
   ────────────────────────────────────────────── */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, TEMPLATES } from "@/lib/brevo";
import { generateSignedUrl } from "@/lib/itinerary/signed-url";
import { buildItinerary } from "@/lib/itinerary/builder";
import type { Guest, Event, Rsvp } from "@/types/database";

/* ── 1. Itinerary Ready — for guests who RSVP'd before Phase 4 ── */

export async function sendItineraryReadyEmail(
  guestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .single();

  if (!guest?.email) {
    return { success: false, error: "Guest not found or no email." };
  }

  const itinerary = await buildItinerary(guestId);
  if (!itinerary) {
    return { success: false, error: "No accepted events." };
  }

  const itineraryUrl = await generateSignedUrl(guestId);
  const eventNames = itinerary.days
    .flatMap((d) => d.events.map((e) => e.event.name))
    .join(", ");

  const messageId = await sendTransactionalEmail({
    to: { email: guest.email, name: guest.name },
    templateId: TEMPLATES.ITINERARY_READY,
    params: {
      guestName: guest.name.split(" ")[0],
      itineraryUrl,
      acceptedEventNames: eventNames,
    },
  });

  if (messageId) {
    await supabase.from("email_log").insert({
      guest_id: guestId,
      template: "ITINERARY_READY",
      brevo_message_id: messageId,
      sent_at: new Date().toISOString(),
      status: "sent",
    });
  }

  return { success: true };
}

/* ── 2. Reminder emails (2-week and 3-day) ── */

export async function sendReminderEmail(
  guestId: string,
  type: "2week" | "3day"
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .single();

  if (!guest?.email) {
    return { success: false, error: "Guest not found or no email." };
  }

  const itinerary = await buildItinerary(guestId);
  if (!itinerary) {
    return { success: false, error: "No accepted events." };
  }

  const itineraryUrl = await generateSignedUrl(guestId);
  const eventSummaries = itinerary.days.flatMap((d) =>
    d.events.map((e) => ({
      name: e.event.name,
      date: d.label,
      time: e.event.time,
      venue: e.event.venue,
    }))
  );

  const templateId =
    type === "2week" ? TEMPLATES.REMINDER_2_WEEKS : TEMPLATES.REMINDER_3_DAYS;
  const templateName = type === "2week" ? "REMINDER_2_WEEKS" : "REMINDER_3_DAYS";

  const params: Record<string, unknown> = {
    guestName: guest.name.split(" ")[0],
    itineraryUrl,
    eventSummaries,
  };

  // 3-day reminder includes weather placeholder and day-of contact
  if (type === "3day") {
    params.weatherNote =
      "[Weather info will be updated closer to the date]";
    params.contactInfo =
      "Day-of questions? Text or call [PLACEHOLDER — Tim to provide day-of contact].";
  }

  const messageId = await sendTransactionalEmail({
    to: { email: guest.email, name: guest.name },
    templateId,
    params,
  });

  if (messageId) {
    await supabase.from("email_log").insert({
      guest_id: guestId,
      template: templateName,
      brevo_message_id: messageId,
      sent_at: new Date().toISOString(),
      status: "sent",
    });
  }

  return { success: true };
}

/* ── 3. Event Update — notify all affected guests ── */

export async function sendEventUpdateEmail(
  eventId: string
): Promise<{ success: boolean; sent: number; error?: string }> {
  const supabase = createAdminClient();

  // Get the updated event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return { success: false, sent: 0, error: "Event not found." };
  }

  // Find all guests who accepted this event
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("guest_id")
    .eq("event_id", eventId)
    .eq("status", "accepted");

  if (!rsvps || rsvps.length === 0) {
    return { success: true, sent: 0 };
  }

  const guestIds = rsvps.map((r: { guest_id: string }) => r.guest_id);

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .in("id", guestIds);

  if (!guests) {
    return { success: false, sent: 0, error: "Failed to fetch guests." };
  }

  let sent = 0;
  for (const guest of guests as Guest[]) {
    if (!guest.email) continue;

    const itineraryUrl = await generateSignedUrl(guest.id);

    const messageId = await sendTransactionalEmail({
      to: { email: guest.email, name: guest.name },
      templateId: TEMPLATES.EVENT_UPDATE,
      params: {
        guestName: guest.name.split(" ")[0],
        eventName: (event as Event).name,
        updatedDetails: {
          date: (event as Event).date,
          time: (event as Event).time,
          venue: (event as Event).venue,
          address: (event as Event).address,
          dressCode: (event as Event).dress_code,
        },
        itineraryUrl,
      },
    });

    if (messageId) {
      await supabase.from("email_log").insert({
        guest_id: guest.id,
        template: "EVENT_UPDATE",
        brevo_message_id: messageId,
        sent_at: new Date().toISOString(),
        status: "sent",
      });
      sent++;
    }
  }

  return { success: true, sent };
}
