-- ============================================================
-- Migration: Improve article editorial workflow compatibility
-- Ensures article/media schema supports Studio uploads, filtering,
-- timestamps, and richer management without changing public RLS.
-- ============================================================

-- media upload route persists this value during R2 uploads.
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS file_size_total BIGINT;

-- Category/tag management metadata for Studio maintenance screens.
ALTER TABLE article_categories
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE article_tags
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Keep body consistently present even when the fallback migration created
-- the column without the original NOT NULL constraint.
UPDATE articles SET body = '' WHERE body IS NULL;
ALTER TABLE articles
  ALTER COLUMN body SET DEFAULT '',
  ALTER COLUMN body SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_excerpt_length_check'
  ) THEN
    ALTER TABLE articles
      ADD CONSTRAINT articles_excerpt_length_check
      CHECK (excerpt IS NULL OR char_length(excerpt) <= 300);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_seo_description_length_check'
  ) THEN
    ALTER TABLE articles
      ADD CONSTRAINT articles_seo_description_length_check
      CHECK (seo_description IS NULL OR char_length(seo_description) <= 160);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_articles_updated_at ON articles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_tag_assignments_tag ON article_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_sort ON article_categories(sort_order, name);
CREATE INDEX IF NOT EXISTS idx_article_tags_name ON article_tags(name);

CREATE INDEX IF NOT EXISTS idx_articles_editorial_search
  ON articles USING GIN (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(subtitle, '') || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      coalesce(body, '')
    )
  );

DROP TRIGGER IF EXISTS set_updated_at_articles ON articles;
CREATE TRIGGER set_updated_at_articles
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_media_assets ON media_assets;
CREATE TRIGGER set_updated_at_media_assets
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_article_categories ON article_categories;
CREATE TRIGGER set_updated_at_article_categories
  BEFORE UPDATE ON article_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_article_tags ON article_tags;
CREATE TRIGGER set_updated_at_article_tags
  BEFORE UPDATE ON article_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
