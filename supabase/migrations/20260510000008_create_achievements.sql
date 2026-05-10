-- ============================================================
-- Migration: 008 — Create achievements table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE achievements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        UNIQUE NOT NULL,
  slug              TEXT        UNIQUE NOT NULL,
  description       TEXT        NOT NULL,
  icon              TEXT        NOT NULL,

  -- Unlock condition
  condition_type    TEXT        NOT NULL
    CHECK (condition_type IN ('count', 'genre', 'rating', 'streak', 'special')),
  condition_target  INTEGER     NOT NULL,
  -- e.g. { "genre": "murim", "status": "completed" }
  condition_filter  JSONB,

  -- Progress tracking
  current_progress  INTEGER     NOT NULL DEFAULT 0,
  unlocked          BOOLEAN     NOT NULL DEFAULT FALSE,
  unlocked_date     TIMESTAMPTZ,

  -- Visual
  rarity            TEXT        NOT NULL
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  color             TEXT        NOT NULL,
  glow_effect       BOOLEAN     NOT NULL DEFAULT FALSE,

  sort_order        INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_achievements_unlocked ON achievements(unlocked);
CREATE INDEX idx_achievements_rarity   ON achievements(rarity);
