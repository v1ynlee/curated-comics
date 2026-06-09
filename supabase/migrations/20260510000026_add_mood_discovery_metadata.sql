-- ============================================================
-- Migration: 026 — Add mood discovery metadata
--
-- Changes:
--   1. CREATE TYPE vibe_badge ENUM
--   2. ALTER TABLE moods — add 7 new columns
--   3. CREATE VIEW mood_discovery_stats — derived title stats
--   4. CREATE TABLE mood_collage_covers — manual collage curation
--
-- Idempotent: IF NOT EXISTS / CREATE OR REPLACE used throughout
-- ============================================================

-- ── 1. Badge ENUM ─────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE vibe_badge AS ENUM ('NEW', 'TRENDING', 'PEAK', 'CURSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Moods — new discovery columns ──────────────────────────

ALTER TABLE moods
  ADD COLUMN IF NOT EXISTS badge             vibe_badge,
  ADD COLUMN IF NOT EXISTS featured_priority INTEGER    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured_slot     TEXT,
  ADD COLUMN IF NOT EXISTS featured_until    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS popularity_score  INTEGER    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS editor_note       TEXT,
  ADD COLUMN IF NOT EXISTS atmosphere_config JSONB      NOT NULL DEFAULT '{}';

COMMENT ON COLUMN moods.badge             IS 'Editorial status badge. NULL = no badge.';
COMMENT ON COLUMN moods.featured_priority IS '0 = not featured. Higher = more prominent. Supports hero/homepage/seasonal tiers.';
COMMENT ON COLUMN moods.featured_slot     IS 'Named editorial slot: hero | homepage | seasonal | editorial. NULL = none.';
COMMENT ON COLUMN moods.featured_until    IS 'Auto-expire timestamp. NULL = permanent. For campaign/seasonal features.';
COMMENT ON COLUMN moods.popularity_score  IS 'Editorial ranking 0–100 used for sort. Set manually or computed.';
COMMENT ON COLUMN moods.editor_note       IS 'Short atmospheric editorial subtitle shown on vibe card. Personality-driven copy.';
COMMENT ON COLUMN moods.atmosphere_config IS 'Extended atmosphere params: particleIntensity, glowStrength, overlayOpacity, animationIntensity, etc.';

-- ── 3. Derived stats view ─────────────────────────────────────
--
-- Real-time stats computed from relational data.
-- Eliminates stale column maintenance for title counts and timestamps.

CREATE OR REPLACE VIEW mood_discovery_stats AS
SELECT
  m.id                                                         AS mood_id,
  m.slug,
  COUNT(tm.title_id)                                           AS title_count,
  MAX(t.created_at)                                            AS last_title_added_at,
  COUNT(tm.title_id) FILTER (
    WHERE t.created_at >= DATE_TRUNC('month', NOW())
  )                                                            AS titles_added_this_month
FROM moods m
LEFT JOIN title_moods tm ON tm.mood_id = m.id
LEFT JOIN titles t       ON t.id = tm.title_id AND t.hidden = FALSE
GROUP BY m.id, m.slug;

COMMENT ON VIEW mood_discovery_stats IS
  'Real-time vibe discovery stats derived from title_moods. '
  'Provides title_count, last_title_added_at, titles_added_this_month per mood.';

-- ── 4. Collage curation table ─────────────────────────────────
--
-- Manual editorial selection of covers for vibe collages.
-- Hybrid logic (service layer):
--   IF entries exist → use manual curation (ordered by position)
--   ELSE             → auto-select top-rated titles from title_moods

CREATE TABLE IF NOT EXISTS mood_collage_covers (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_id   UUID        NOT NULL REFERENCES moods(id)  ON DELETE CASCADE,
  title_id  UUID        NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  position  INTEGER     NOT NULL DEFAULT 0,
  added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (mood_id, title_id)
);

CREATE INDEX IF NOT EXISTS idx_mood_collage_covers_mood
  ON mood_collage_covers(mood_id, position);

COMMENT ON TABLE mood_collage_covers IS
  'Manual editorial cover selection for vibe card collages. '
  'position controls display order. Falls back to auto-selection when empty for a mood.';
COMMENT ON COLUMN mood_collage_covers.position IS 'Display order within the collage (0 = front/primary).';

-- ── 5. RLS — mood_collage_covers ─────────────────────────────

ALTER TABLE mood_collage_covers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view mood_collage_covers" ON mood_collage_covers;
CREATE POLICY "Public can view mood_collage_covers"
  ON mood_collage_covers FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated has full access to mood_collage_covers" ON mood_collage_covers;
CREATE POLICY "Authenticated has full access to mood_collage_covers"
  ON mood_collage_covers FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);
