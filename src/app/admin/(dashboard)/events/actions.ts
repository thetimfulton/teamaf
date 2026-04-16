"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { logActivity } from "@/lib/activity";
import { eventUpdateSchema, type EventUpdateInput } from "@/lib/validations/admin";
import { sendEventUpdateEmail } from "@/lib/itinerary/emails";
import type { Event, EventCohort, Cohort } from "@/types/database";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface EventWithCohorts extends Event {
  cohorts: Cohort[];
}

export async function getEvents(): Promise<ActionResult<EventWithCohorts[]>> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("date")
    .order("sort_order");

  if (error) return { success: false, error: error.message };

  const { data: cohorts } = await supabase.from("event_cohorts").select("*");

  const cohortMap = new Map<string, Cohort[]>();
  for (const ec of (cohorts ?? []) as EventCohort[]) {
    const list = cohortMap.get(ec.event_id) ?? [];
    list.push(ec.cohort);
    cohortMap.set(ec.event_id, list);
  }

  const result: EventWithCohorts[] = ((events ?? []) as Event[]).map((e) => ({
    ...e,
    cohorts: cohortMap.get(e.id) ?? [],
  }));

  return { success: true, data: result };
}

export async function updateEvent(
  id: string,
  input: EventUpdateInput
): Promise<ActionResult<undefined>> {
  const admin = await requireAdmin();
  const parsed = eventUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("events")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logActivity({
    type: "event_updated",
    actor: `admin:${admin.email}`,
    subjectType: "event",
    subjectId: id,
    details: { name: parsed.data.name },
  });

  return { success: true, data: undefined };
}

export async function updateEventCohorts(
  eventId: string,
  cohorts: Cohort[]
): Promise<ActionResult<undefined>> {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  // Delete existing and re-insert
  await supabase.from("event_cohorts").delete().eq("event_id", eventId);

  if (cohorts.length > 0) {
    const rows = cohorts.map((c) => ({ event_id: eventId, cohort: c }));
    const { error } = await supabase.from("event_cohorts").insert(rows);
    if (error) return { success: false, error: error.message };
  }

  await logActivity({
    type: "event_updated",
    actor: `admin:${admin.email}`,
    subjectType: "event",
    subjectId: eventId,
    details: { cohorts, action: "cohorts_updated" },
  });

  return { success: true, data: undefined };
}

export async function getAffectedGuestCount(
  eventId: string
): Promise<ActionResult<number>> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "accepted");

  if (error) return { success: false, error: error.message };
  return { success: true, data: count ?? 0 };
}

export async function notifyAffectedGuests(
  eventId: string
): Promise<ActionResult<undefined>> {
  await requireAdmin();
  await sendEventUpdateEmail(eventId);
  return { success: true, data: undefined };
}
