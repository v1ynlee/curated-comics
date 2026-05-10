-- ============================================================
-- Migration: 003 — Create titles table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE titles (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT        UNIQUE NOT NULL,

  -- Identity
  title_english     TEXT        NOT NULL,
  title_original    TEXT,
  title_alternative TEXT[],

  -- Classification
  origin            TEXT        NOT NULL
    CHECK (origin IN ('manhwa', 'manhua', 'manga')),
  series_status     TEXT        NOT NULL
    CHECK (series_status IN ('ongoing', 'completed', 'hiatus', 'cancelled')),

  -- Reading Status
  reading_status    TEXT        NOT NULL
    CHECK (reading_status IN (
      'reading', 'completed', 'dropped', 'paused', 'wishlist',
      'hidden-gem', 'guilty-pleasure', 'top-favorite', 'most-reread'
    )),
  chapters_read     INTEGER     NOT NULL DEFAULT 0,
  total_chapters    INTEGER,
  started_date      DATE,
  completed_date    DATE,
  last_read_date    TIMESTAMPTZ DEFAULT NOW(),
  reread_count      INTEGER     NOT NULL DEFAULT 0,

  -- Tier
  tier              TEXT
    CHECK (tier IN ('SSS+', 'S', 'A', 'B', 'C', 'D', 'F')),

  -- Content
  synopsis          TEXT,
  vibe_check        TEXT,
  quotable_lines    TEXT[],

  -- Media
  cover_slug        TEXT,
  banner_slug       TEXT,
  dominant_color    TEXT,

  -- Flags
  featured          BOOLEAN     NOT NULL DEFAULT FALSE,
  hidden            BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Meta
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_chapters CHECK (chapters_read >= 0),
  CONSTRAINT valid_reread   CHECK (reread_count >= 0)
);

-- Indexes for common query patterns
CREATE INDEX idx_titles_reading_status ON titles(reading_status);
CREATE INDEX idx_titles_tier           ON titles(tier);
CREATE INDEX idx_titles_origin         ON titles(origin);
CREATE INDEX idx_titles_last_read      ON titles(last_read_date DESC);
CREATE INDEX idx_titles_featured       ON titles(featured) WHERE featured = TRUE;
CREATE INDEX idx_titles_slug           ON titles(slug);

-- Full-text search across title fields
CREATE INDEX idx_titles_search ON titles USING gin(
  to_tsvector('english',
    coalesce(title_english,  '') || ' ' ||
    coalesce(title_original, '') || ' ' ||
    coalesce(synopsis,       '') || ' ' ||
    coalesce(vibe_check,     '')
  )
);
