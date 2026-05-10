-- ============================================================
-- Migration: 002 — Create moods table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE moods (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        UNIQUE NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  emoji       TEXT,
  -- Atmosphere config for UI: { gradient, particleColor, accentColor }
  atmosphere  JSONB       NOT NULL DEFAULT '{}',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moods_slug ON moods(slug);
