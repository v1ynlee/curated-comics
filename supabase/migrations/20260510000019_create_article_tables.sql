-- ============================================================
-- Migration: 019 — media_assets + Article tables
-- (categories, tags, articles, assignments)
-- Source: .kiro/specs/platform-evolution-planning (Requirements 12.1–12.6)
--
-- Note: media_assets is created first because articles.featured_image_id
-- references it via FK. Originally split across two files with the same
-- migration number; merged here for correct dependency order.
-- ============================================================

-- ── media_assets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_assets (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        NOT NULL,
  asset_type      TEXT        NOT NULL
    CHECK (asset_type IN ('cover', 'banner', 'article-image', 'thumbnail', 'og-asset')),
  content_hash    TEXT        NOT NULL,
  original_width  INTEGER,
  original_height INTEGER,
  aspect_ratio    NUMERIC(6,4),
  mime_type       TEXT,
  dominant_color  TEXT,
  blur_data_uri   TEXT,
  variants        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  r2_base_path    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_asset UNIQUE (slug, asset_type, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_media_slug      ON media_assets(slug);
CREATE INDEX IF NOT EXISTS idx_media_type      ON media_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_media_slug_type ON media_assets(slug, asset_type);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view media_assets" ON media_assets;
CREATE POLICY "Public can view media_assets"
  ON media_assets FOR SELECT TO anon, authenticated USING (TRUE);
DROP POLICY IF EXISTS "Authenticated owner has full access to media_assets" ON media_assets;
CREATE POLICY "Authenticated owner has full access to media_assets"
  ON media_assets FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── article_categories ────────────────────────────────────────
CREATE TABLE article_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        UNIQUE NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  color       TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0
);

-- RLS
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view article_categories"
  ON article_categories FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated owner has full access to article_categories"
  ON article_categories FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── article_tags ──────────────────────────────────────────────
CREATE TABLE article_tags (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- RLS
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view article_tags"
  ON article_tags FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated owner has full access to article_tags"
  ON article_tags FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── articles ──────────────────────────────────────────────────
CREATE TABLE articles (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT        UNIQUE NOT NULL,
  title                TEXT        NOT NULL,
  subtitle             TEXT,
  body                 TEXT        NOT NULL,
  excerpt              TEXT        CHECK (char_length(excerpt) <= 300),
  featured_image_id    UUID        REFERENCES media_assets(id) ON DELETE SET NULL,
  category_id          UUID        REFERENCES article_categories(id) ON DELETE SET NULL,
  publication_state    TEXT        NOT NULL DEFAULT 'draft'
    CHECK (publication_state IN ('draft', 'scheduled', 'published', 'archived')),
  publish_date         TIMESTAMPTZ,
  scheduled_date       TIMESTAMPTZ,
  featured             BOOLEAN     NOT NULL DEFAULT FALSE,
  seo_title            TEXT,
  seo_description      TEXT        CHECK (char_length(seo_description) <= 160),
  word_count           INTEGER     NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_articles_state ON articles(publication_state);
CREATE INDEX idx_articles_publish_date ON articles(publish_date DESC);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_featured ON articles(featured) WHERE featured = TRUE;
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_scheduled ON articles(scheduled_date)
  WHERE publication_state = 'scheduled';

-- RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT TO anon, authenticated
  USING (publication_state = 'published' AND (publish_date IS NULL OR publish_date <= NOW()));
CREATE POLICY "Authenticated owner has full access to articles"
  ON articles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── article_tag_assignments ───────────────────────────────────
CREATE TABLE article_tag_assignments (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES article_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- RLS
ALTER TABLE article_tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view article_tag_assignments"
  ON article_tag_assignments FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated owner has full access to article_tag_assignments"
  ON article_tag_assignments FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
