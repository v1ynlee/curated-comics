-- ============================================================
-- Migration: 006 — Create junction tables (title_genres, title_moods)
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

-- title ↔ genre (many-to-many)
CREATE TABLE title_genres (
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,

  PRIMARY KEY (title_id, genre_id)
);

CREATE INDEX idx_title_genres_genre ON title_genres(genre_id);

-- title ↔ mood (many-to-many)
CREATE TABLE title_moods (
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  mood_id  UUID NOT NULL REFERENCES moods(id)  ON DELETE CASCADE,

  PRIMARY KEY (title_id, mood_id)
);

CREATE INDEX idx_title_moods_mood ON title_moods(mood_id);
