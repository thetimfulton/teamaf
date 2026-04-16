/* ──────────────────────────────────────────────
   Itinerary builder (Phase 4)
   Queries accepted events for a guest and groups
   them into a day-by-day timeline.
   ────────────────────────────────────────────── */

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Guest,
  Event,
  Rsvp,
  Itinerary,
  ItineraryDay,
  ItineraryEvent,
} from "@/types/database";

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Build a personalized itinerary for a guest.
 * Returns null if the guest doesn't exist or has no accepted events.
 */
export async function buildItinerary(
  guestId: string
): Promise<Itinerary | null> {
  const supabase = createAdminClient();

  // Fetch guest
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .single();

  if (guestError || !guest) return null;

  // Fetch event IDs this guest's cohort is invited to
  const { data: cohortEvents } = await supabase
    .from("event_cohorts")
    .select("event_id")
    .eq("cohort", guest.cohort);

  const eligibleEventIds = (cohortEvents ?? []).map(
    (ec: { event_id: string }) => ec.event_id
  );

  if (eligibleEventIds.length === 0) return null;

  // Fetch RSVPs where status = accepted
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .eq("guest_id", guestId)
    .in("event_id", eligibleEventIds)
    .eq("status", "accepted");

  const acceptedRsvps = (rsvps ?? []) as Rsvp[];
  if (acceptedRsvps.length === 0) return null;

  const acceptedEventIds = acceptedRsvps.map((r) => r.event_id);

  // Fetch the accepted event details
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("id", acceptedEventIds)
    .order("date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (!events || events.length === 0) return null;

  const rsvpMap = new Map(acceptedRsvps.map((r) => [r.event_id, r]));

  // Group events by date
  const dayMap = new Map<string, ItineraryEvent[]>();

  for (const event of events as Event[]) {
    const rsvp = rsvpMap.get(event.id);
    if (!rsvp) continue;

    const existing = dayMap.get(event.date) ?? [];
    existing.push({ event, rsvp });
    dayMap.set(event.date, existing);
  }

  // Build sorted days array
  const days: ItineraryDay[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, itineraryEvents]) => ({
      date,
      label: formatDayLabel(date),
      events: itineraryEvents,
    }));

  return { guest: guest as Guest, days };
}
