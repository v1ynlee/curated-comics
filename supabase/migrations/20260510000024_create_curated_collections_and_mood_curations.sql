-- ============================================================
-- Migration: 024 — Curated collections and mood curations
-- Source: .kiro/specs/studio-ui-revision (Requirement 18.5)
--
-- Creates tables for curated comic collections (by-artist,
-- by-author, recommended, featured) and mood/theme curations.
-- Also adds author, artist, and release_date columns to titles.
-- ============================================================

-- ── Add author/artist/release_date/completed_date columns to titles ─
-- Note: completed_date already exists in the original schema but
-- IF NOT EXISTS makes this safe and explicit per the design spec.
ALTER TABLE titles ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE titles ADD COLUMN IF NOT EXISTS artist TEXT;
ALTER TABLE titles ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE titles ADD COLUMN IF NOT EXISTS completed_date DATE;

-- Indexes for new columns (useful for dashboard stats and filtering)
CREATE INDEX IF NOT EXISTS idx_titles_author ON titles(author) WHERE author IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_titles_artist ON titles(artist) WHERE artist IS NOT NULL;

-- ── curated_collections ───────────────────────────────────────
CREATE TABLE curated_collections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  category    TEXT        NOT NULL
    CHECK (category IN ('by-artist', 'by-author', 'recommended', 'featured')),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_curated_collections_category ON curated_collections(category);
CREATE INDEX idx_curated_collections_slug ON curated_collections(slug);

-- RLS
ALTER TABLE curated_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view curated_collections"
  ON curated_collections FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated has full access to curated_collections"
  ON curated_collections FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── collection_titles (junction) ──────────────────────────────
CREATE TABLE collection_titles (
  collection_id UUID NOT NULL REFERENCES curated_collections(id) ON DELETE CASCADE,
  title_id      UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL DEFAULT 0,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, title_id)
);

-- Index for ordering titles within a collection
CREATE INDEX idx_collection_titles_position ON collection_titles(collection_id, position);

-- RLS
ALTER TABLE collection_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view collection_titles"
  ON collection_titles FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated has full access to collection_titles"
  ON collection_titles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── mood_curations ────────────────────────────────────────────
CREATE TABLE mood_curations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mood_curations_slug ON mood_curations(slug);

-- RLS
ALTER TABLE mood_curations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view mood_curations"
  ON mood_curations FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated has full access to mood_curations"
  ON mood_curations FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── mood_curation_titles (junction) ───────────────────────────
CREATE TABLE mood_curation_titles (
  curation_id UUID NOT NULL REFERENCES mood_curations(id) ON DELETE CASCADE,
  title_id    UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (curation_id, title_id)
);

-- Index for ordering titles within a mood curation
CREATE INDEX idx_mood_curation_titles_position ON mood_curation_titles(curation_id, position);

-- RLS
ALTER TABLE mood_curation_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view mood_curation_titles"
  ON mood_curation_titles FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated has full access to mood_curation_titles"
  ON mood_curation_titles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
