-- ============================================================
-- Migration: 019 — Create media_assets table
-- Source: .kiro/specs/platform-evolution-planning/design.md
--
-- Stores metadata for all processed media assets (covers,
-- banners, article images, thumbnails, OG assets). Binary
-- data lives in Cloudflare R2; this table holds only URLs,
-- dimensions, placeholders, and variant references.
-- ============================================================

CREATE TABLE media_assets (
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

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX idx_media_slug      ON media_assets(slug);
CREATE INDEX idx_media_type      ON media_assets(asset_type);
CREATE INDEX idx_media_slug_type ON media_assets(slug, asset_type);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view media_assets"
  ON media_assets FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Authenticated owner has full access to media_assets"
  ON media_assets FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);
