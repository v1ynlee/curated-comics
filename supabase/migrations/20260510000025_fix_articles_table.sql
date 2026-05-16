-- ============================================================
-- Migration: 025 — Fix articles table (ensure it exists)
-- Source: .kiro/specs/studio-ui-revision (Requirements 16.1, 16.2)
--
-- The original articles migration (019_create_article_tables)
-- shares a timestamp with 019_create_media_assets. Due to
-- alphabetical ordering, the articles migration may run before
-- media_assets exists, causing the FK on featured_image_id to
-- fail. This migration ensures the articles table is created
-- without the problematic FK dependency, then adds the FK
-- constraint only if media_assets already exists.
-- ============================================================

-- Create the articles table without the FK to media_assets
CREATE TABLE IF NOT EXISTS articles (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT        UNIQUE NOT NULL,
  title                TEXT        NOT NULL,
  subtitle             TEXT,
  body                 TEXT,
  excerpt              TEXT,
  featured_image_id    UUID,
  category_id          UUID,
  publication_state    TEXT        NOT NULL DEFAULT 'draft'
    CHECK (publication_state IN ('draft', 'scheduled', 'published', 'archived')),
  publish_date         TIMESTAMPTZ,
  scheduled_date       TIMESTAMPTZ,
  featured             BOOLEAN     NOT NULL DEFAULT FALSE,
  seo_title            TEXT,
  seo_description      TEXT,
  word_count           INTEGER     NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK to media_assets if that table exists (safe to skip if already set)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'media_assets'
  ) THEN
    -- Only add the constraint if it doesn't already exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'articles_featured_image_id_fkey'
        AND table_name = 'articles'
    ) THEN
      ALTER TABLE articles
        ADD CONSTRAINT articles_featured_image_id_fkey
        FOREIGN KEY (featured_image_id) REFERENCES media_assets(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add FK to article_categories if that table exists (safe to skip if already set)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'article_categories'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'articles_category_id_fkey'
        AND table_name = 'articles'
    ) THEN
      ALTER TABLE articles
        ADD CONSTRAINT articles_category_id_fkey
        FOREIGN KEY (category_id) REFERENCES article_categories(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_articles_state ON articles(publication_state);
CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON articles(scheduled_date)
  WHERE publication_state = 'scheduled';

-- Enable RLS (idempotent)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (use IF NOT EXISTS pattern via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'articles' AND policyname = 'Public can view published articles'
  ) THEN
    CREATE POLICY "Public can view published articles"
      ON articles FOR SELECT TO anon, authenticated
      USING (publication_state = 'published' AND (publish_date IS NULL OR publish_date <= NOW()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'articles' AND policyname = 'Authenticated owner has full access to articles'
  ) THEN
    CREATE POLICY "Authenticated owner has full access to articles"
      ON articles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

-- Also ensure article_categories exists (needed for the join in studioFetchAllArticles)
CREATE TABLE IF NOT EXISTS article_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        UNIQUE NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  color       TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0
);

ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_categories' AND policyname = 'Public can view article_categories'
  ) THEN
    CREATE POLICY "Public can view article_categories"
      ON article_categories FOR SELECT TO anon, authenticated USING (TRUE);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_categories' AND policyname = 'Authenticated owner has full access to article_categories'
  ) THEN
    CREATE POLICY "Authenticated owner has full access to article_categories"
      ON article_categories FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

-- Ensure article_tags table exists (referenced by article_tag_assignments)
CREATE TABLE IF NOT EXISTS article_tags (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_tags' AND policyname = 'Public can view article_tags'
  ) THEN
    CREATE POLICY "Public can view article_tags"
      ON article_tags FOR SELECT TO anon, authenticated USING (TRUE);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_tags' AND policyname = 'Authenticated owner has full access to article_tags'
  ) THEN
    CREATE POLICY "Authenticated owner has full access to article_tags"
      ON article_tags FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

-- Ensure article_tag_assignments junction table exists
CREATE TABLE IF NOT EXISTS article_tag_assignments (
  article_id UUID NOT NULL,
  tag_id     UUID NOT NULL,
  PRIMARY KEY (article_id, tag_id)
);

-- Add FKs for article_tag_assignments if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_tag_assignments_article_id_fkey'
      AND table_name = 'article_tag_assignments'
  ) THEN
    ALTER TABLE article_tag_assignments
      ADD CONSTRAINT article_tag_assignments_article_id_fkey
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_tag_assignments_tag_id_fkey'
      AND table_name = 'article_tag_assignments'
  ) THEN
    ALTER TABLE article_tag_assignments
      ADD CONSTRAINT article_tag_assignments_tag_id_fkey
      FOREIGN KEY (tag_id) REFERENCES article_tags(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE article_tag_assignments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_tag_assignments' AND policyname = 'Public can view article_tag_assignments'
  ) THEN
    CREATE POLICY "Public can view article_tag_assignments"
      ON article_tag_assignments FOR SELECT TO anon, authenticated USING (TRUE);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_tag_assignments' AND policyname = 'Authenticated owner has full access to article_tag_assignments'
  ) THEN
    CREATE POLICY "Authenticated owner has full access to article_tag_assignments"
      ON article_tag_assignments FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;
