-- =============================================
-- #teamAF Wedding — Initial Schema
-- Phase 1: Foundation
-- =============================================

-- ── Enum types ──

CREATE TYPE cohort AS ENUM (
  'wedding_party',
  'immediate_family',
  'out_of_town',
  'full_local',
  'ceremony_only'
);

CREATE TYPE rsvp_status AS ENUM (
  'pending',
  'accepted',
  'declined'
);

CREATE TYPE email_status AS ENUM (
  'queued',
  'sent',
  'delivered',
  'bounced',
  'failed'
);

-- ── Guests ──

CREATE TABLE guests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  cohort        cohort NOT NULL DEFAULT 'full_local',
  plus_one_allowed BOOLEAN NOT NULL DEFAULT false,
  plus_one_name TEXT,
  kids_count    INTEGER NOT NULL DEFAULT 0,
  kids_names    TEXT,
  dietary_notes TEXT,
  address       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_guests_email ON guests (lower(email));
CREATE INDEX idx_guests_name  ON guests (lower(name));
CREATE INDEX idx_guests_cohort ON guests (cohort);

-- ── Events ──

CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  date          DATE NOT NULL,
  time          TIME,
  venue         TEXT NOT NULL,
  address       TEXT NOT NULL,
  description   TEXT,
  dress_code    TEXT,
  parking_notes TEXT,
  kids_allowed  BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Event ↔ Cohort mapping ──

CREATE TABLE event_cohorts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  cohort    cohort NOT NULL,
  UNIQUE (event_id, cohort)
);

CREATE INDEX idx_event_cohorts_event ON event_cohorts (event_id);
CREATE INDEX idx_event_cohorts_cohort ON event_cohorts (cohort);

-- ── RSVPs ──

CREATE TABLE rsvps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id          UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id          UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status            rsvp_status NOT NULL DEFAULT 'pending',
  response_date     TIMESTAMPTZ,
  plus_one_attending BOOLEAN NOT NULL DEFAULT false,
  kids_attending    INTEGER NOT NULL DEFAULT 0,
  dietary_notes     TEXT,
  song_request      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (guest_id, event_id)
);

CREATE INDEX idx_rsvps_guest ON rsvps (guest_id);
CREATE INDEX idx_rsvps_event ON rsvps (event_id);
CREATE INDEX idx_rsvps_status ON rsvps (status);

-- ── Email log ──

CREATE TABLE email_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id         UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  template         TEXT NOT NULL,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  brevo_message_id TEXT,
  status           email_status NOT NULL DEFAULT 'queued'
);

CREATE INDEX idx_email_log_guest ON email_log (guest_id);

-- ── Auto-update updated_at ──

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rsvps_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row-level security (locked down — server-side only for now) ──

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Allow the service role to do everything (API routes use service role key)
-- Anon/public policies will be added in Phase 3 for guest lookup + RSVP

COMMENT ON TABLE guests IS 'Wedding guest list with cohort assignments';
COMMENT ON TABLE events IS 'All wedding events (rehearsal, ceremony, reception, etc.)';
COMMENT ON TABLE event_cohorts IS 'Which guest cohorts are invited to which events';
COMMENT ON TABLE rsvps IS 'Per-event RSVP responses from guests';
COMMENT ON TABLE email_log IS 'Transactional email audit trail via Brevo';
