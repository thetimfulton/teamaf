/* ──────────────────────────────────────────────
   Migration 004 — Activity Log
   Tracks admin and guest actions for audit trail
   ────────────────────────────────────────────── */

CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,
  actor       TEXT NOT NULL DEFAULT 'system',
  subject_type TEXT,
  subject_id  UUID,
  details     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_created ON activity_log (created_at DESC);
CREATE INDEX idx_activity_log_type ON activity_log (type);
CREATE INDEX idx_activity_log_subject ON activity_log (subject_type, subject_id);

-- RLS: service role only
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
