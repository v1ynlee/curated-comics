-- ============================================================
-- Migration: 012 — Create database functions and triggers
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

-- ── Auto-update updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables that have an updated_at column
CREATE TRIGGER set_updated_at_titles
  BEFORE UPDATE ON titles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_ratings
  BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_reviews
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_achievements
  BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Achievement Progress ──────────────────────────────────────
-- Recalculates progress for all achievements after any title change.
-- Handles 'count' and 'genre' condition types.
-- 'rating', 'streak', 'special' types are computed in application code.

CREATE OR REPLACE FUNCTION update_achievement_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE achievements SET
    current_progress = (
      CASE condition_type
        WHEN 'count' THEN (
          SELECT COUNT(*)
          FROM titles
          WHERE hidden = FALSE
            AND reading_status = COALESCE(
              condition_filter->>'status',
              reading_status
            )
        )
        WHEN 'genre' THEN (
          SELECT COUNT(DISTINCT t.id)
          FROM titles t
          JOIN title_genres tg ON tg.title_id = t.id
          JOIN genres g        ON g.id         = tg.genre_id
          WHERE t.hidden = FALSE
            AND g.slug = condition_filter->>'genre'
            AND (
              condition_filter->>'status' IS NULL
              OR t.reading_status = condition_filter->>'status'
            )
        )
        ELSE current_progress
      END
    ),
    unlocked = (
      CASE condition_type
        WHEN 'count' THEN (
          SELECT COUNT(*)
          FROM titles
          WHERE hidden = FALSE
            AND reading_status = COALESCE(
              condition_filter->>'status',
              reading_status
            )
        ) >= condition_target
        WHEN 'genre' THEN (
          SELECT COUNT(DISTINCT t.id)
          FROM titles t
          JOIN title_genres tg ON tg.title_id = t.id
          JOIN genres g        ON g.id         = tg.genre_id
          WHERE t.hidden = FALSE
            AND g.slug = condition_filter->>'genre'
            AND (
              condition_filter->>'status' IS NULL
              OR t.reading_status = condition_filter->>'status'
            )
        ) >= condition_target
        ELSE unlocked
      END
    ),
    unlocked_date = CASE
      WHEN unlocked = FALSE AND (
        CASE condition_type
          WHEN 'count' THEN (
            SELECT COUNT(*) FROM titles
            WHERE hidden = FALSE
              AND reading_status = COALESCE(condition_filter->>'status', reading_status)
          ) >= condition_target
          WHEN 'genre' THEN (
            SELECT COUNT(DISTINCT t.id)
            FROM titles t
            JOIN title_genres tg ON tg.title_id = t.id
            JOIN genres g        ON g.id         = tg.genre_id
            WHERE t.hidden = FALSE
              AND g.slug = condition_filter->>'genre'
              AND (condition_filter->>'status' IS NULL OR t.reading_status = condition_filter->>'status')
          ) >= condition_target
          ELSE FALSE
        END
      ) THEN NOW()
      ELSE unlocked_date
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_achievement_update
  AFTER INSERT OR UPDATE ON titles
  FOR EACH ROW EXECUTE FUNCTION update_achievement_progress();
