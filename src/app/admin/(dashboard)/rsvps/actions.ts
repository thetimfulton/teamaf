"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { generateCsvString } from "@/lib/csv";
import type { Event, Cohort } from "@/types/database";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface RsvpOverview {
  totalGuests: number;
  totalRsvps: number;
  pendingGuests: number;
  acceptRate: number;
}

export interface EventBreakdown {
  eventId: string;
  eventName: string;
  eventDate: string;
  attending: number;
  declined: number;
  pending: number;
  plusOnes: number;
  kids: number;
  totalHeadcount: number;
}

export async function getRsvpOverview(): Promise<ActionResult<RsvpOverview>> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { count: totalGuests } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true });

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("guest_id, status");

  const guestsWithRsvp = new Set(
    ((rsvps ?? []) as { guest_id: string }[]).map((r) => r.guest_id)
  );
  const acceptedRsvps = ((rsvps ?? []) as { status: string }[]).filter(
    (r) => r.status === "accepted"
  ).length;
  const totalRsvpResponses = (rsvps ?? []).length;

  return {
    success: true,
    data: {
      totalGuests: totalGuests ?? 0,
      totalRsvps: guestsWithRsvp.size,
      pendingGuests: (totalGuests ?? 0) - guestsWithRsvp.size,
      acceptRate:
        totalRsvpResponses > 0
          ? Math.round((acceptedRsvps / totalRsvpResponses) * 100)
          : 0,
    },
  };
}

export async function getEventBreakdown(
  cohortFilter?: Cohort
): Promise<ActionResult<EventBreakdown[]>> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date")
    .order("sort_order");

  let rsvpQuery = supabase
    .from("rsvps")
    .select("event_id, status, plus_one_attending, kids_attending, guest_id");

  if (cohortFilter) {
    // Get guest IDs for the cohort first
    const { data: guestsInCohort } = await supabase
      .from("guests")
      .select("id")
      .eq("cohort", cohortFilter);
    const ids = ((guestsInCohort ?? []) as { id: string }[]).map((g) => g.id);
    if (ids.length > 0) {
      rsvpQuery = rsvpQuery.in("guest_id", ids);
    } else {
      // No guests in this cohort
      return {
        success: true,
        data: ((events ?? []) as Event[]).map((e) => ({
          eventId: e.id,
          eventName: e.name,
          eventDate: e.date,
          attending: 0,
          declined: 0,
          pending: 0,
          plusOnes: 0,
          kids: 0,
          totalHeadcount: 0,
        })),
      };
    }
  }

  const { data: rsvps } = await rsvpQuery;

  const breakdown = new Map<
    string,
    {
      attending: number;
      declined: number;
      pending: number;
      plusOnes: number;
      kids: number;
    }
  >();

  for (const r of (rsvps ?? []) as {
    event_id: string;
    status: string;
    plus_one_attending: boolean;
    kids_attending: number;
  }[]) {
    const b = breakdown.get(r.event_id) ?? {
      attending: 0,
      declined: 0,
      pending: 0,
      plusOnes: 0,
      kids: 0,
    };
    if (r.status === "accepted") {
      b.attending++;
      if (r.plus_one_attending) b.plusOnes++;
      b.kids += r.kids_attending ?? 0;
    } else if (r.status === "declined") {
      b.declined++;
    } else {
      b.pending++;
    }
    breakdown.set(r.event_id, b);
  }

  const result: EventBreakdown[] = ((events ?? []) as Event[]).map((e) => {
    const b = breakdown.get(e.id) ?? {
      attending: 0,
      declined: 0,
      pending: 0,
      plusOnes: 0,
      kids: 0,
    };
    return {
      eventId: e.id,
      eventName: e.name,
      eventDate: e.date,
      ...b,
      totalHeadcount: b.attending + b.plusOnes + b.kids,
    };
  });

  return { success: true, data: result };
}

export async function exportRsvpsCsv(
  cohortFilter?: Cohort
): Promise<ActionResult<string>> {
  await requireAdmin();
  const supabase = createAdminClient();

  let guestQuery = supabase.from("guests").select("*").order("name");
  if (cohortFilter) guestQuery = guestQuery.eq("cohort", cohortFilter);

  const { data: guests } = await guestQuery;
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*, events!inner(name)");
  const { data: events } = await supabase
    .from("events")
    .select("id, name")
    .order("sort_order");

  // Build a flat row per guest with event columns
  const eventNames = ((events ?? []) as { id: string; name: string }[]).map(
    (e) => e.name
  );
  const headers = ["name", "email", "cohort", ...eventNames];

  const rsvpMap = new Map<string, Map<string, string>>();
  for (const r of (rsvps ?? []) as {
    guest_id: string;
    event_id: string;
    status: string;
  }[]) {
    const guestRsvps = rsvpMap.get(r.guest_id) ?? new Map();
    guestRsvps.set(r.event_id, r.status);
    rsvpMap.set(r.guest_id, guestRsvps);
  }

  const rows = ((guests ?? []) as { id: string; name: string; email: string | null; cohort: string }[]).map(
    (g) => {
      const row: Record<string, unknown> = {
        name: g.name,
        email: g.email ?? "",
        cohort: g.cohort,
      };
      for (const e of (events ?? []) as { id: string; name: string }[]) {
        row[e.name] = rsvpMap.get(g.id)?.get(e.id) ?? "no_rsvp";
      }
      return row;
    }
  );

  return { success: true, data: generateCsvString(rows, headers) };
}
