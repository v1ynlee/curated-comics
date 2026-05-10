-- ============================================================
-- Migration: 004 — Create ratings table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE ratings (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id   UUID         NOT NULL REFERENCES titles(id) ON DELETE CASCADE,

  overall    NUMERIC(3,1) NOT NULL CHECK (overall   >= 1 AND overall   <= 10),
  emotional  NUMERIC(3,1) NOT NULL CHECK (emotional >= 1 AND emotional <= 10),
  art        NUMERIC(3,1) NOT NULL CHECK (art       >= 1 AND art       <= 10),
  story      NUMERIC(3,1) NOT NULL CHECK (story     >= 1 AND story     <= 10),
  pacing     NUMERIC(3,1) NOT NULL CHECK (pacing    >= 1 AND pacing    <= 10),
  -- NULL until title is completed
  ending     NUMERIC(3,1)          CHECK (ending    >= 1 AND ending    <= 10),

  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT one_rating_per_title UNIQUE (title_id)
);

CREATE INDEX idx_ratings_title   ON ratings(title_id);
CREATE INDEX idx_ratings_overall ON ratings(overall DESC);
