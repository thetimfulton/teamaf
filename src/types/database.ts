/* ──────────────────────────────────────────────
   #teamAF Wedding — Database types
   Mirror of the Supabase schema (Phase 1)
   ────────────────────────────────────────────── */

export type Cohort =
  | "wedding_party"
  | "immediate_family"
  | "out_of_town"
  | "full_local"
  | "ceremony_only";

export type RsvpStatus = "pending" | "accepted" | "declined";

export type EmailStatus = "queued" | "sent" | "delivered" | "bounced" | "failed";

/* ── Tables ── */

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cohort: Cohort;
  plus_one_allowed: boolean;
  plus_one_name: string | null;
  kids_count: number;
  kids_names: string | null;
  dietary_notes: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  description: string | null;
  dress_code: string | null;
  parking_notes: string | null;
  kids_allowed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventCohort {
  id: string;
  event_id: string;
  cohort: Cohort;
}

export interface Rsvp {
  id: string;
  guest_id: string;
  event_id: string;
  status: RsvpStatus;
  response_date: string | null;
  plus_one_attending: boolean;
  kids_attending: number;
  dietary_notes: string | null;
  song_request: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  guest_id: string;
  template: string;
  sent_at: string;
  brevo_message_id: string | null;
  status: EmailStatus;
}

/* ── Phase 4: Itinerary types ── */

export interface ItineraryEvent {
  event: Event;
  rsvp: Rsvp;
}

export interface ItineraryDay {
  date: string;
  label: string;
  events: ItineraryEvent[];
}

export interface Itinerary {
  guest: Guest;
  days: ItineraryDay[];
}

/* ── Phase 5: Activity Log ── */

export type ActivityType =
  | "rsvp_submitted"
  | "rsvp_updated"
  | "guest_created"
  | "guest_updated"
  | "guest_deleted"
  | "guest_imported"
  | "event_updated"
  | "email_sent"
  | "email_broadcast";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  actor: string;
  subject_type: string | null;
  subject_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

/* ── Phase 3: RSVP flow types ── */

export interface GuestLookupResult {
  id: string;
  name: string;
  email: string | null;
  cohort: Cohort;
  match_type: "email" | "exact_name" | "fuzzy";
}

export interface RsvpEventData {
  event: Event;
  existingRsvp: Rsvp | null;
}

export interface GuestRsvpData {
  guest: Guest;
  events: RsvpEventData[];
}
