-- ============================================================
-- Migration: 001 — Create genres table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE genres (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        UNIQUE NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  color       TEXT        NOT NULL,
  icon        TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_genres_slug ON genres(slug);
