-- ============================================================
-- Migration: 029 — Creators and title associations
--
-- Normalizes creators away from the legacy titles.author and
-- titles.artist text fields while keeping those columns usable.
-- ============================================================

-- ── creators ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creators (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL
    CHECK (type IN ('author', 'artist', 'studio')),
  description TEXT,
  image       TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creators_slug ON creators(slug);
CREATE INDEX IF NOT EXISTS idx_creators_type ON creators(type);
CREATE INDEX IF NOT EXISTS idx_creators_name ON creators(name);

CREATE TRIGGER set_updated_at_creators
  BEFORE UPDATE ON creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view creators"
  ON creators FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Authenticated owner has full access to creators"
  ON creators FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── title_creators ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS title_creators (
  title_id   UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  role       TEXT NOT NULL
    CHECK (role IN ('author', 'artist', 'studio')),
  PRIMARY KEY (title_id, creator_id, role)
);

CREATE INDEX IF NOT EXISTS idx_title_creators_title ON title_creators(title_id);
CREATE INDEX IF NOT EXISTS idx_title_creators_creator ON title_creators(creator_id);
CREATE INDEX IF NOT EXISTS idx_title_creators_role ON title_creators(role);

ALTER TABLE title_creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view title_creators for non-hidden titles"
  ON title_creators FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM titles t
      WHERE t.id = title_creators.title_id AND t.hidden = FALSE
    )
  );

CREATE POLICY "Authenticated owner has full access to title_creators"
  ON title_creators FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── Seed creators from legacy title columns ───────────────────
WITH raw_creators AS (
  SELECT
    btrim(name) AS name,
    'author'::text AS role
  FROM titles
  CROSS JOIN LATERAL regexp_split_to_table(coalesce(author, ''), '[[:space:]]*,[[:space:]]*') AS name
  WHERE btrim(name) <> ''

  UNION ALL

  SELECT
    btrim(name) AS name,
    'artist'::text AS role
  FROM titles
  CROSS JOIN LATERAL regexp_split_to_table(coalesce(artist, ''), '[[:space:]]*,[[:space:]]*') AS name
  WHERE btrim(name) <> ''
),
creator_rollup AS (
  SELECT
    lower(trim(both '-' from regexp_replace(name, '[^[:alnum:]]+', '-', 'g'))) AS slug,
    min(name) AS name,
    CASE
      WHEN bool_or(name ILIKE '%studio%') THEN 'studio'
      WHEN bool_or(role = 'artist') THEN 'artist'
      ELSE 'author'
    END AS type
  FROM raw_creators
  GROUP BY lower(trim(both '-' from regexp_replace(name, '[^[:alnum:]]+', '-', 'g')))
)
INSERT INTO creators (slug, name, type, description, image)
SELECT
  slug,
  name,
  type,
  'Creator profile for ' || name || '.',
  CASE
    WHEN type = 'author' THEN '/images/authors/' || slug || '.webp'
    ELSE '/images/artists/' || slug || '.webp'
  END
FROM creator_rollup
WHERE slug <> ''
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  image = COALESCE(creators.image, EXCLUDED.image),
  description = COALESCE(creators.description, EXCLUDED.description);

-- Editorial starter descriptions for seeded creators.
UPDATE creators SET description = 'Author of Solo Leveling, known for direct escalation, tight game-system pacing, and clean power fantasy momentum.' WHERE slug = 'chugong';
UPDATE creators SET description = 'The Redice Studio artist whose Solo Leveling adaptation defined the modern vertical action look.' WHERE slug = 'dubu-redice-studio';
UPDATE creators SET description = 'Creator of Tower of God, building a long-form climb through tests, factions, contracts, and strange loyalties.' WHERE slug = 'siu';
UPDATE creators SET description = 'Writing duo behind Omniscient Reader, famous for layered scenarios, reader mythology, and apocalypse-scale structure.' WHERE slug = 'sing-shong';
UPDATE creators SET description = 'Artist for Omniscient Reader, translating dense scenario fiction into sharp, readable vertical action.' WHERE slug = 'sleepy-c';
UPDATE creators SET description = 'Author of Return of the Mount Hua Sect, mixing sect comedy, old-master arrogance, and comeback momentum.' WHERE slug = 'bi-ryeok-cheon';
UPDATE creators SET description = 'Artist on Return of the Mount Hua Sect, pairing expressive comedy with fast martial-arts choreography.' WHERE slug = 'lufan';
UPDATE creators SET description = 'Creator of One Piece, a landmark adventure built on elastic comedy, found family, and long-form payoff.' WHERE slug = 'eiichiro-oda';
UPDATE creators SET description = 'Creator of Berserk, whose dark fantasy draftsmanship and tragic character writing remain genre-defining.' WHERE slug = 'kentaro-miura';
UPDATE creators SET description = 'Creator of Vagabond, known for painterly action, negative space, and searching character interiority.' WHERE slug = 'takehiko-inoue';
UPDATE creators SET description = 'Creator of Fullmetal Alchemist, balancing strict plotting, political stakes, and precise emotional turns.' WHERE slug = 'hiromu-arakawa';
UPDATE creators SET description = 'Creator of Hunter x Hunter, famous for elastic rules, tactical pressure, and arcs that refuse easy answers.' WHERE slug = 'yoshihiro-togashi';

-- ── Seed title associations from legacy columns ───────────────
WITH raw_title_creators AS (
  SELECT
    id AS title_id,
    btrim(name) AS name,
    'author'::text AS role
  FROM titles
  CROSS JOIN LATERAL regexp_split_to_table(coalesce(author, ''), '[[:space:]]*,[[:space:]]*') AS name
  WHERE btrim(name) <> ''

  UNION ALL

  SELECT
    id AS title_id,
    btrim(name) AS name,
    'artist'::text AS role
  FROM titles
  CROSS JOIN LATERAL regexp_split_to_table(coalesce(artist, ''), '[[:space:]]*,[[:space:]]*') AS name
  WHERE btrim(name) <> ''
)
INSERT INTO title_creators (title_id, creator_id, role)
SELECT DISTINCT
  rtc.title_id,
  c.id,
  rtc.role
FROM raw_title_creators rtc
JOIN creators c
  ON c.slug = lower(trim(both '-' from regexp_replace(rtc.name, '[^[:alnum:]]+', '-', 'g')))
ON CONFLICT (title_id, creator_id, role) DO NOTHING;
