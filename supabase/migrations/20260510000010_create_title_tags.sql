-- ============================================================
-- Migration: 010 — Create title_tags table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- Note: Placed after reading_history to keep junction tables grouped
-- ============================================================

CREATE TABLE title_tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  tag      TEXT NOT NULL,

  CONSTRAINT unique_title_tag UNIQUE (title_id, tag)
);

CREATE INDEX idx_title_tags_title ON title_tags(title_id);
CREATE INDEX idx_title_tags_tag   ON title_tags(tag);
