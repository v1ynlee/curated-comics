-- ============================================================
-- Migration: 007 — Create external_links table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE external_links (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id   UUID        NOT NULL REFERENCES titles(id) ON DELETE CASCADE,

  platform   TEXT        NOT NULL
    CHECK (platform IN (
      'webtoon', 'kakaopage', 'naver', 'tapas', 'mangadex',
      'tappytoon', 'lezhin', 'official', 'other'
    )),
  url        TEXT        NOT NULL,
  label      TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_external_links_title ON external_links(title_id);
