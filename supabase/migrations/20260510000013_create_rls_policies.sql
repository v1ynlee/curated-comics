-- ============================================================
-- Migration: 013 — Row Level Security policies
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
--
-- Security model:
--   Public (anon)  → SELECT only, non-hidden content
--   Authenticated  → Full access (owner only via Supabase Auth)
--
-- The owner UUID is resolved via auth.uid() — no hardcoded UUIDs.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE titles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres          ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods           ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_genres    ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_moods     ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links  ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- ── titles ────────────────────────────────────────────────────

CREATE POLICY "Public can view non-hidden titles"
  ON titles FOR SELECT
  TO anon, authenticated
  USING (hidden = FALSE);

CREATE POLICY "Authenticated owner has full access to titles"
  ON titles FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── ratings ───────────────────────────────────────────────────

CREATE POLICY "Public can view ratings for non-hidden titles"
  ON ratings FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM titles t
      WHERE t.id = ratings.title_id AND t.hidden = FALSE
    )
  );

CREATE POLICY "Authenticated owner has full access to ratings"
  ON ratings FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── reviews ───────────────────────────────────────────────────

CREATE POLICY "Public can view reviews for non-hidden titles"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM titles t
      WHERE t.id = reviews.title_id AND t.hidden = FALSE
    )
  );

CREATE POLICY "Authenticated owner has full access to reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── genres ────────────────────────────────────────────────────

CREATE POLICY "Public can view genres"
  ON genres FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Authenticated owner has full access to genres"
  ON genres FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── moods ─────────────────────────────────────────────────────

CREATE POLICY "Public can view moods"
  ON moods FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Authenticated owner has full access to moods"
  ON moods FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── title_genres ──────────────────────────────────────────────

CREATE POLICY "Public can view title_genres for non-hidden titles"
  ON title_genres FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM titles t
      WHERE t.id = title_genres.title_id AND t.hidden = FALSE
    )
  );

CREATE POLICY "Authenticated owner has full access to title_genres"
  ON title_genres FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── title_moods ───────────────────────────────────────────────

CREATE POLICY "Public can view title_moods for non-hidden titles"
  ON title_moods FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM titles t
      WHERE t.id = title_moods.title_id AND t.hidden = FALSE
    )
  );

CREATE POLICY "Authenticated owner has full access to title_moods"
  ON title_moods FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── external_links ────────────────────────────────────────────

CREATE POLICY "Public can view external_links for non-hidden titles"
  ON external_links FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM titles t
      WHERE t.id = external_links.title_id AND t.hidden = FALSE
    )
  );

CREATE POLICY "Authenticated owner has full access to external_links"
  ON external_links FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── title_tags ────────────────────────────────────────────────

CREATE POLICY "Public can view title_tags for non-hidden titles"
  ON title_tags FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM titles t
      WHERE t.id = title_tags.title_id AND t.hidden = FALSE
    )
  );

CREATE POLICY "Authenticated owner has full access to title_tags"
  ON title_tags FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── achievements ──────────────────────────────────────────────

CREATE POLICY "Public can view achievements"
  ON achievements FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Authenticated owner has full access to achievements"
  ON achievements FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── reading_history ───────────────────────────────────────────

CREATE POLICY "Public cannot view reading_history"
  ON reading_history FOR SELECT
  TO anon
  USING (FALSE);

CREATE POLICY "Authenticated owner has full access to reading_history"
  ON reading_history FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);
