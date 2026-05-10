-- ============================================================
-- Migration: 005 — Create reviews table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE reviews (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id            UUID        NOT NULL REFERENCES titles(id) ON DELETE CASCADE,

  -- Content
  body                TEXT        NOT NULL,
  tldr                TEXT,

  -- Optional structured sections
  what_i_loved        TEXT,
  what_i_hated        TEXT,
  emotional_damage    TEXT,
  would_recommend_to  TEXT,

  -- Spoiler handling
  has_spoilers        BOOLEAN     NOT NULL DEFAULT FALSE,
  -- Array of { start, end, label } objects
  spoiler_sections    JSONB,

  -- Meta
  word_count          INTEGER     NOT NULL DEFAULT 0,
  written_date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  last_edited         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT one_review_per_title UNIQUE (title_id)
);

CREATE INDEX idx_reviews_title ON reviews(title_id);
