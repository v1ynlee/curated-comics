-- ============================================================
-- Migration: 030 — Editorial curation management system
--
-- Adds the database support needed for Studio Curation to manage
-- homepage narrative, weighted featured exposure, discover themes,
-- creator exposure, and tier presentation from editorial data.
-- ============================================================

-- ── Global curation settings ─────────────────────────────────
CREATE TABLE IF NOT EXISTS curation_settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE curation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view curation_settings" ON curation_settings;
CREATE POLICY "Public can view curation_settings"
  ON curation_settings FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated owner has full access to curation_settings" ON curation_settings;
CREATE POLICY "Authenticated owner has full access to curation_settings"
  ON curation_settings FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_curation_settings') THEN
    CREATE TRIGGER set_updated_at_curation_settings
      BEFORE UPDATE ON curation_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

INSERT INTO curation_settings (key, value) VALUES
  ('featured_narratives_random', '{"enabled": false}'),
  ('featured_titles_random', '{"enabled": false}'),
  ('featured_creators_random', '{"enabled": false}')
ON CONFLICT (key) DO NOTHING;

-- ── Homepage narrative curation ──────────────────────────────
CREATE TABLE IF NOT EXISTS featured_narratives (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  cta_text        TEXT,
  cta_href        TEXT,
  cover_slugs     TEXT[]      NOT NULL DEFAULT '{}',
  accent_color    TEXT        NOT NULL DEFAULT '#8b5cf6',
  display_order   INTEGER     NOT NULL DEFAULT 0,
  featured_weight INTEGER     NOT NULL DEFAULT 50 CHECK (featured_weight BETWEEN 1 AND 100),
  visible         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_narratives_order
  ON featured_narratives(display_order ASC) WHERE visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_featured_narratives_weight
  ON featured_narratives(featured_weight DESC) WHERE visible = TRUE;

ALTER TABLE featured_narratives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible featured_narratives" ON featured_narratives;
CREATE POLICY "Public can view visible featured_narratives"
  ON featured_narratives FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Authenticated owner has full access to featured_narratives" ON featured_narratives;
CREATE POLICY "Authenticated owner has full access to featured_narratives"
  ON featured_narratives FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_featured_narratives') THEN
    CREATE TRIGGER set_updated_at_featured_narratives
      BEFORE UPDATE ON featured_narratives
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

INSERT INTO featured_narratives (
  title, subtitle, description, cta_text, cta_href, cover_slugs,
  accent_color, display_order, featured_weight, visible
) VALUES
  (
    'New to manhwa? Start here.',
    'Handpicked gateway titles that hook you from chapter one.',
    'No filler, no slow burns, just instant immersion into worlds you will not want to leave.',
    'Explore Starter Picks',
    '/discover?mood=starter',
    ARRAY['solo-leveling', 'tower-of-god', 'the-beginning-after-the-end', 'omniscient-readers-viewpoint'],
    '#8b5cf6',
    0,
    90,
    TRUE
  ),
  (
    'Wholesome characters, warm stories.',
    'For the days you need comfort.',
    'Adorable leads, found families, gentle humor, and the kind of warmth that makes you smile at your screen.',
    'Find Comfort Reads',
    '/discover?mood=wholesome',
    ARRAY['spy-x-family', 'dungeon-meshi', 'eleceed', 'i-love-yoo'],
    '#f59e0b',
    1,
    60,
    TRUE
  ),
  (
    'Dark fantasy. Overpowered protagonists.',
    'When you want stakes, power systems, and protagonists who break the ceiling.',
    'Murim, regression, reincarnation, and raw ambition.',
    'Unleash the Power',
    '/discover?mood=dark-fantasy',
    ARRAY['nano-machine', 'return-mount-hua', 'heavenly-demon-reborn', 'fist-demon-mount-hua'],
    '#ef4444',
    2,
    75,
    TRUE
  )
ON CONFLICT DO NOTHING;

-- ── Weighted homepage titles ─────────────────────────────────
ALTER TABLE titles
  ADD COLUMN IF NOT EXISTS featured_weight INTEGER NOT NULL DEFAULT 50;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'titles_featured_weight_range'
  ) THEN
    ALTER TABLE titles
      ADD CONSTRAINT titles_featured_weight_range
      CHECK (featured_weight BETWEEN 1 AND 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_titles_featured_weight
  ON titles(featured_weight DESC) WHERE featured = TRUE;

UPDATE titles SET featured_weight = 100 WHERE slug = 'solo-leveling';
UPDATE titles SET featured_weight = 85 WHERE slug IN ('omniscient-reader', 'tower-of-god', 'return-mount-hua');
UPDATE titles SET featured_weight = 70 WHERE featured = TRUE AND featured_weight = 50;

-- ── Weighted homepage creators ───────────────────────────────
CREATE TABLE IF NOT EXISTS featured_creators (
  creator_id      UUID        PRIMARY KEY REFERENCES creators(id) ON DELETE CASCADE,
  display_order   INTEGER     NOT NULL DEFAULT 0,
  featured_weight INTEGER     NOT NULL DEFAULT 50 CHECK (featured_weight BETWEEN 1 AND 100),
  visible         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_creators_order
  ON featured_creators(display_order ASC) WHERE visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_featured_creators_weight
  ON featured_creators(featured_weight DESC) WHERE visible = TRUE;

ALTER TABLE featured_creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible featured_creators" ON featured_creators;
CREATE POLICY "Public can view visible featured_creators"
  ON featured_creators FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Authenticated owner has full access to featured_creators" ON featured_creators;
CREATE POLICY "Authenticated owner has full access to featured_creators"
  ON featured_creators FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_featured_creators') THEN
    CREATE TRIGGER set_updated_at_featured_creators
      BEFORE UPDATE ON featured_creators
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

INSERT INTO featured_creators (creator_id, display_order, featured_weight, visible)
SELECT id, 0, 100, TRUE FROM creators WHERE slug = 'dubu-redice-studio'
ON CONFLICT (creator_id) DO NOTHING;
INSERT INTO featured_creators (creator_id, display_order, featured_weight, visible)
SELECT id, 1, 85, TRUE FROM creators WHERE slug = 'siu'
ON CONFLICT (creator_id) DO NOTHING;
INSERT INTO featured_creators (creator_id, display_order, featured_weight, visible)
SELECT id, 2, 80, TRUE FROM creators WHERE slug = 'chugong'
ON CONFLICT (creator_id) DO NOTHING;
INSERT INTO featured_creators (creator_id, display_order, featured_weight, visible)
SELECT id, 3, 75, TRUE FROM creators WHERE slug = 'sing-shong'
ON CONFLICT (creator_id) DO NOTHING;

-- ── Discover theme configuration ─────────────────────────────
ALTER TABLE moods
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS theme_color TEXT,
  ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE moods
SET theme_color = COALESCE(theme_color, atmosphere->>'accentColor', '#8b5cf6')
WHERE theme_color IS NULL;

CREATE INDEX IF NOT EXISTS idx_moods_visible_order
  ON moods(visible, sort_order ASC);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_moods') THEN
    CREATE TRIGGER set_updated_at_moods
      BEFORE UPDATE ON moods
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

ALTER TABLE title_moods
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_title_moods_position
  ON title_moods(mood_id, position ASC);

WITH ranked_title_moods AS (
  SELECT
    title_id,
    mood_id,
    row_number() OVER (PARTITION BY mood_id ORDER BY title_id) - 1 AS position
  FROM title_moods
)
UPDATE title_moods tm
SET position = rtm.position
FROM ranked_title_moods rtm
WHERE tm.title_id = rtm.title_id
  AND tm.mood_id = rtm.mood_id
  AND tm.position = 0;

-- ── Tier definitions and title ordering ──────────────────────
CREATE TABLE IF NOT EXISTS tier_definitions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  description   TEXT,
  color         TEXT        NOT NULL DEFAULT '#8b5cf6',
  icon          TEXT,
  display_order INTEGER     NOT NULL DEFAULT 0,
  visible       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tier_definitions_order
  ON tier_definitions(display_order ASC) WHERE visible = TRUE;

ALTER TABLE tier_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible tier_definitions" ON tier_definitions;
CREATE POLICY "Public can view visible tier_definitions"
  ON tier_definitions FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Authenticated owner has full access to tier_definitions" ON tier_definitions;
CREATE POLICY "Authenticated owner has full access to tier_definitions"
  ON tier_definitions FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_tier_definitions') THEN
    CREATE TRIGGER set_updated_at_tier_definitions
      BEFORE UPDATE ON tier_definitions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

INSERT INTO tier_definitions (slug, name, description, color, icon, display_order, visible) VALUES
  ('sss-plus', 'SSS+', 'Changed my brain chemistry', '#FFD700', 'crown', 0, TRUE),
  ('s', 'S', 'Masterpiece, no notes', '#E040FB', 'star', 1, TRUE),
  ('a', 'A', 'Highly recommended', '#8B5CF6', 'sparkles', 2, TRUE),
  ('b', 'B', 'Enjoyable, solid read', '#3B82F6', 'book-open', 3, TRUE),
  ('c', 'C', 'Mid but readable', '#6B7280', 'minus', 4, TRUE),
  ('d', 'D', 'Barely survived it', '#4B5563', 'archive', 5, TRUE),
  ('f', 'F', 'Not worth the damage', '#EF4444', 'trash', 6, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = COALESCE(tier_definitions.description, EXCLUDED.description),
  color = COALESCE(tier_definitions.color, EXCLUDED.color),
  icon = COALESCE(tier_definitions.icon, EXCLUDED.icon),
  display_order = EXCLUDED.display_order;

CREATE TABLE IF NOT EXISTS tier_titles (
  tier_id  UUID        NOT NULL REFERENCES tier_definitions(id) ON DELETE CASCADE,
  title_id UUID        NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  position INTEGER     NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tier_id, title_id)
);

CREATE INDEX IF NOT EXISTS idx_tier_titles_tier_position
  ON tier_titles(tier_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_tier_titles_title
  ON tier_titles(title_id);

ALTER TABLE tier_titles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tier_titles for visible tiers" ON tier_titles;
CREATE POLICY "Public can view tier_titles for visible tiers"
  ON tier_titles FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tier_definitions td
      JOIN titles t ON t.id = tier_titles.title_id
      WHERE td.id = tier_titles.tier_id
        AND td.visible = TRUE
        AND t.hidden = FALSE
    )
  );

DROP POLICY IF EXISTS "Authenticated owner has full access to tier_titles" ON tier_titles;
CREATE POLICY "Authenticated owner has full access to tier_titles"
  ON tier_titles FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

WITH title_tier_rows AS (
  SELECT
    t.id AS title_id,
    td.id AS tier_id,
    row_number() OVER (PARTITION BY td.id ORDER BY t.title_english) - 1 AS position
  FROM titles t
  JOIN tier_definitions td ON td.name = t.tier
  WHERE t.tier IS NOT NULL
)
INSERT INTO tier_titles (tier_id, title_id, position)
SELECT tier_id, title_id, position FROM title_tier_rows
ON CONFLICT (tier_id, title_id) DO NOTHING;
