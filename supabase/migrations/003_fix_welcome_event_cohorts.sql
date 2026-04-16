-- =============================================
-- Fix: Welcome Event was missing wedding_party and immediate_family cohorts
-- Per project plan, Welcome Event is for: wedding_party, immediate_family, out_of_town
-- =============================================

INSERT INTO event_cohorts (event_id, cohort)
SELECT e.id, c.cohort
FROM events e
CROSS JOIN (VALUES ('wedding_party'::cohort), ('immediate_family'::cohort)) AS c(cohort)
WHERE e.name = 'Welcome Event'
ON CONFLICT (event_id, cohort) DO NOTHING;
