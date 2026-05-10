-- ============================================================
-- Migration: 011 — Create computed views
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

-- ── Reading Statistics ────────────────────────────────────────
-- Aggregate stats across all non-hidden titles.
CREATE VIEW reading_statistics AS
SELECT
  COUNT(*)                                                          AS total_titles,
  COALESCE(SUM(t.chapters_read), 0)                                AS total_chapters,
  ROUND(COALESCE(SUM(t.chapters_read), 0) * 4.0 / 60, 1)          AS estimated_hours,
  ROUND(AVG(r.overall)::NUMERIC, 2)                                AS average_rating,
  COUNT(*) FILTER (WHERE t.reading_status = 'completed')           AS completed_count,
  COUNT(*) FILTER (WHERE t.reading_status = 'dropped')             AS dropped_count,
  ROUND(
    COUNT(*) FILTER (WHERE t.reading_status = 'completed')::NUMERIC /
    NULLIF(
      COUNT(*) FILTER (WHERE t.reading_status IN ('completed', 'dropped')),
      0
    ) * 100,
    1
  )                                                                 AS completion_rate
FROM titles t
LEFT JOIN ratings r ON r.title_id = t.id
WHERE t.hidden = FALSE;

-- ── Genre Distribution ────────────────────────────────────────
-- Title count and average rating per genre.
CREATE VIEW genre_distribution AS
SELECT
  g.id,
  g.name,
  g.slug,
  g.color,
  COUNT(tg.title_id)            AS title_count,
  ROUND(AVG(r.overall)::NUMERIC, 1) AS avg_rating
FROM genres g
LEFT JOIN title_genres tg ON tg.genre_id = g.id
LEFT JOIN ratings r       ON r.title_id  = tg.title_id
GROUP BY g.id, g.name, g.slug, g.color
ORDER BY title_count DESC;

-- ── Monthly Reading ───────────────────────────────────────────
-- Chapters read and active titles per calendar month.
CREATE VIEW monthly_reading AS
SELECT
  date_trunc('month', read_date::TIMESTAMPTZ) AS month,
  SUM(chapters_read)                          AS chapters,
  COUNT(DISTINCT title_id)                    AS titles_active
FROM reading_history
GROUP BY date_trunc('month', read_date::TIMESTAMPTZ)
ORDER BY month DESC;
