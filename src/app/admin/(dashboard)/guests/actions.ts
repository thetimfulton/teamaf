"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { logActivity } from "@/lib/activity";
import {
  guestSchema,
  guestFilterSchema,
  rsvpOverrideSchema,
  type GuestInput,
  type GuestFilter,
  type RsvpOverrideInput,
} from "@/lib/validations/admin";
import { generateCsvString, GUEST_CSV_HEADERS } from "@/lib/csv";
import type { Guest, Rsvp } from "@/types/database";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ── Guests list with filters ── */

export interface GuestWithRsvpSummary extends Guest {
  rsvp_summary: {
    accepted: number;
    declined: number;
    pending: number;
    total: number;
  };
}

export async function getGuests(
  raw: Partial<GuestFilter>
): Promise<ActionResult<{ guests: GuestWithRsvpSummary[]; total: number }>> {
  await requireAdmin();
  const filters = guestFilterSchema.parse(raw);
  const supabase = createAdminClient();

  let query = supabase
    .from("guests")
    .select("*", { count: "exact" });

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.cohort) {
    query = query.eq("cohort", filters.cohort);
  }

  query = query.order(filters.sortField, { ascending: filters.sortDir === "asc" });

  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;
  query = query.range(from, to);

  const { data: guests, error, count } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  // Fetch RSVP summaries
  const guestIds = (guests ?? []).map((g: Guest) => g.id);
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("guest_id, status")
    .in("guest_id", guestIds.length > 0 ? guestIds : ["__none__"]);

  const summaryMap = new Map<
    string,
    { accepted: number; declined: number; pending: number; total: number }
  >();
  for (const r of (rsvps ?? []) as { guest_id: string; status: string }[]) {
    const s = summaryMap.get(r.guest_id) ?? {
      accepted: 0,
      declined: 0,
      pending: 0,
      total: 0,
    };
    if (r.status === "accepted") s.accepted++;
    else if (r.status === "declined") s.declined++;
    else s.pending++;
    s.total++;
    summaryMap.set(r.guest_id, s);
  }

  // Filter by RSVP status if requested
  let filtered = (guests ?? []) as Guest[];
  if (filters.rsvpStatus && filters.rsvpStatus !== "all") {
    filtered = filtered.filter((g) => {
      const s = summaryMap.get(g.id);
      switch (filters.rsvpStatus) {
        case "has_accepted":
          return s && s.accepted > 0;
        case "has_declined":
          return s && s.declined > 0;
        case "pending":
          return s && s.pending > 0;
        case "no_rsvp":
          return !s || s.total === 0;
        default:
          return true;
      }
    });
  }

  const result: GuestWithRsvpSummary[] = filtered.map((g) => ({
    ...g,
    rsvp_summary: summaryMap.get(g.id) ?? {
      accepted: 0,
      declined: 0,
      pending: 0,
      total: 0,
    },
  }));

  return { success: true, data: { guests: result, total: count ?? 0 } };
}

/* ── Single guest with RSVPs ── */

export async function getGuest(
  id: string
): Promise<ActionResult<{ guest: Guest; rsvps: Rsvp[] }>> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: guest, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !guest) {
    return { success: false, error: "Guest not found" };
  }

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .eq("guest_id", id);

  return {
    success: true,
    data: { guest: guest as Guest, rsvps: (rsvps ?? []) as Rsvp[] },
  };
}

/* ── Create guest ── */

export async function createGuest(
  input: GuestInput
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const parsed = guestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("guests")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A guest with that email already exists" };
    }
    return { success: false, error: error.message };
  }

  await logActivity({
    type: "guest_created",
    actor: `admin:${admin.email}`,
    subjectType: "guest",
    subjectId: data.id,
    details: { name: parsed.data.name },
  });

  return { success: true, data: { id: data.id } };
}

/* ── Update guest ── */

export async function updateGuest(
  id: string,
  input: GuestInput
): Promise<ActionResult<undefined>> {
  const admin = await requireAdmin();
  const parsed = guestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("guests")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity({
    type: "guest_updated",
    actor: `admin:${admin.email}`,
    subjectType: "guest",
    subjectId: id,
    details: { name: parsed.data.name },
  });

  return { success: true, data: undefined };
}

/* ── Delete guest ── */

export async function deleteGuest(
  id: string
): Promise<ActionResult<undefined>> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  // Get name for logging
  const { data: guest } = await supabase
    .from("guests")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("guests").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity({
    type: "guest_deleted",
    actor: `admin:${admin.email}`,
    subjectType: "guest",
    subjectId: id,
    details: { name: guest?.name ?? "Unknown" },
  });

  return { success: true, data: undefined };
}

/* ── Override RSVP ── */

export async function overrideRsvp(
  guestId: string,
  eventId: string,
  input: RsvpOverrideInput
): Promise<ActionResult<undefined>> {
  const admin = await requireAdmin();
  const parsed = rsvpOverrideSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("rsvps").upsert(
    {
      guest_id: guestId,
      event_id: eventId,
      ...parsed.data,
      response_date: new Date().toISOString(),
    },
    { onConflict: "guest_id,event_id" }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await logActivity({
    type: "rsvp_updated",
    actor: `admin:${admin.email}`,
    subjectType: "guest",
    subjectId: guestId,
    details: { eventId, status: parsed.data.status, adminOverride: true },
  });

  return { success: true, data: undefined };
}

/* ── Import guests from CSV ── */

export async function importGuests(
  rows: GuestInput[]
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const parsed = guestSchema.safeParse(row);
    if (!parsed.success) {
      skipped++;
      continue;
    }

    // Check for duplicate email
    if (parsed.data.email) {
      const { data: existing } = await supabase
        .from("guests")
        .select("id")
        .eq("email", parsed.data.email)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }
    }

    const { error } = await supabase.from("guests").insert(parsed.data);
    if (error) {
      skipped++;
    } else {
      imported++;
    }
  }

  await logActivity({
    type: "guest_imported",
    actor: `admin:${admin.email}`,
    details: { imported, skipped, totalRows: rows.length },
  });

  return { success: true, data: { imported, skipped } };
}

/* ── Export guests to CSV ── */

export async function exportGuestsCsv(): Promise<ActionResult<string>> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: guests, error } = await supabase
    .from("guests")
    .select("*")
    .order("name");

  if (error) {
    return { success: false, error: error.message };
  }

  const csvString = generateCsvString(
    (guests ?? []).map((g: Guest) => ({
      ...g,
      plus_one_allowed: g.plus_one_allowed ? "true" : "false",
    })),
    GUEST_CSV_HEADERS
  );

  return { success: true, data: csvString };
}
