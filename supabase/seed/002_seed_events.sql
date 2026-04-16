-- =============================================
-- #teamAF Wedding — Seed: Events + Cohort mappings
-- Dates/times/venues are PLACEHOLDERS — Tim to confirm
-- kids_allowed = true ONLY for ceremony
-- =============================================

-- ── Events ──
-- Using fixed UUIDs so the cohort mapping below can reference them

INSERT INTO events (id, name, date, time, venue, address, description, dress_code, parking_notes, kids_allowed, sort_order) VALUES

-- 1. Rehearsal Dinner (Friday)
('a0000000-0000-0000-0000-000000000001',
 'Rehearsal Dinner',
 '2026-08-14', '18:00',
 'TBD Venue', 'TBD Address, Columbus, OH',
 'Rehearsal dinner for the wedding party and immediate family.',
 'Smart casual',
 'TBD',
 false, 10),

-- 2. Welcome Event (Friday)
('a0000000-0000-0000-0000-000000000002',
 'Welcome Event',
 '2026-08-14', '19:30',
 'TBD Venue', 'TBD Address, Columbus, OH',
 'A casual welcome gathering for out-of-town guests arriving early.',
 'Casual',
 'TBD',
 false, 20),

-- 3. Ceremony (Saturday)
('a0000000-0000-0000-0000-000000000003',
 'Ceremony',
 '2026-08-15', '16:00',
 'Park of Roses', 'Park of Roses, Columbus, OH 43214',
 'The main event. Bring tissues.',
 'Formal / cocktail attire',
 'TBD — parking details for Park of Roses',
 true, 30),   -- ← kids allowed at ceremony ONLY

-- 4. Reception (Saturday)
('a0000000-0000-0000-0000-000000000004',
 'Reception',
 '2026-08-15', '18:00',
 'TBD Venue', 'TBD Address, Columbus, OH',
 'Dinner, dancing, and dubious speeches.',
 'Formal / cocktail attire',
 'TBD',
 false, 40),

-- 5. Day-After Brunch (Sunday)
('a0000000-0000-0000-0000-000000000005',
 'Day-After Brunch',
 '2026-08-16', '10:00',
 'TBD Venue', 'TBD Address, Columbus, OH',
 'A relaxed morning to recover and say goodbye.',
 'Casual',
 'TBD',
 false, 50);

-- ── Event ↔ Cohort mappings ──
-- A = wedding_party, B = immediate_family, C = out_of_town, D = full_local, E = ceremony_only

-- Rehearsal Dinner → A (wedding party) + B (immediate family)
INSERT INTO event_cohorts (event_id, cohort) VALUES
('a0000000-0000-0000-0000-000000000001', 'wedding_party'),
('a0000000-0000-0000-0000-000000000001', 'immediate_family');

-- Welcome Event → A (wedding party) + B (immediate family) + C (out-of-town)
INSERT INTO event_cohorts (event_id, cohort) VALUES
('a0000000-0000-0000-0000-000000000002', 'wedding_party'),
('a0000000-0000-0000-0000-000000000002', 'immediate_family'),
('a0000000-0000-0000-0000-000000000002', 'out_of_town');

-- Ceremony → ALL cohorts
INSERT INTO event_cohorts (event_id, cohort) VALUES
('a0000000-0000-0000-0000-000000000003', 'wedding_party'),
('a0000000-0000-0000-0000-000000000003', 'immediate_family'),
('a0000000-0000-0000-0000-000000000003', 'out_of_town'),
('a0000000-0000-0000-0000-000000000003', 'full_local'),
('a0000000-0000-0000-0000-000000000003', 'ceremony_only');

-- Reception → A, B, C, D (everyone except ceremony-only)
INSERT INTO event_cohorts (event_id, cohort) VALUES
('a0000000-0000-0000-0000-000000000004', 'wedding_party'),
('a0000000-0000-0000-0000-000000000004', 'immediate_family'),
('a0000000-0000-0000-0000-000000000004', 'out_of_town'),
('a0000000-0000-0000-0000-000000000004', 'full_local');

-- Day-After Brunch → A, B, C (wedding party, family, out-of-towners)
INSERT INTO event_cohorts (event_id, cohort) VALUES
('a0000000-0000-0000-0000-000000000005', 'wedding_party'),
('a0000000-0000-0000-0000-000000000005', 'immediate_family'),
('a0000000-0000-0000-0000-000000000005', 'out_of_town');
