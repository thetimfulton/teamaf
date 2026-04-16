-- =============================================
-- #teamAF Wedding — Guest Lookup (Phase 3)
-- Fuzzy name/email matching for RSVP flow
-- =============================================

-- Enable extensions for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Trigram index for fast fuzzy name search
CREATE INDEX idx_guests_name_trgm ON guests USING gin (lower(name) gin_trgm_ops);

-- ── Guest lookup function ──
-- Priority: exact email > exact name > fuzzy (trigram + levenshtein + prefix)
-- Returns max 5 candidates to prevent guest-list enumeration

CREATE OR REPLACE FUNCTION lookup_guest(search_text TEXT)
RETURNS TABLE (
  id      UUID,
  name    TEXT,
  email   TEXT,
  cohort  cohort,
  match_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned TEXT;
BEGIN
  cleaned := trim(lower(search_text));

  -- 1. Exact email match (case-insensitive)
  IF cleaned LIKE '%@%' THEN
    RETURN QUERY
      SELECT g.id, g.name, g.email, g.cohort, 'email'::TEXT AS match_type
      FROM guests g
      WHERE lower(g.email) = cleaned
      LIMIT 1;

    IF FOUND THEN RETURN; END IF;
  END IF;

  -- 2. Exact name match (case-insensitive)
  RETURN QUERY
    SELECT g.id, g.name, g.email, g.cohort, 'exact_name'::TEXT AS match_type
    FROM guests g
    WHERE lower(g.name) = cleaned
    LIMIT 5;

  IF FOUND THEN RETURN; END IF;

  -- 3. Fuzzy matching: trigram similarity, Levenshtein, or first-name prefix
  RETURN QUERY
    SELECT g.id, g.name, g.email, g.cohort, 'fuzzy'::TEXT AS match_type
    FROM guests g
    WHERE
      similarity(lower(g.name), cleaned) >= 0.3
      OR levenshtein(lower(g.name), cleaned) <= 2
      OR lower(g.name) LIKE cleaned || ' %'   -- "Tim" matches "Tim Fulton"
      OR lower(g.name) LIKE '% ' || cleaned    -- "Fulton" matches "Tim Fulton"
    ORDER BY similarity(lower(g.name), cleaned) DESC
    LIMIT 5;
END;
$$;

COMMENT ON FUNCTION lookup_guest IS 'Fuzzy guest lookup for RSVP flow — returns up to 5 candidates';
