-- ============================================================
-- Migration: 018 — Seed ratings for titles missing them
-- ============================================================

-- return-mount-hua (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.0, 8.5, 8.5, 9.0, 8.5, NULL FROM titles t WHERE t.slug = 'return-mount-hua'
ON CONFLICT (title_id) DO NOTHING;

-- tower-of-god (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.0, 9.0, 8.5, 9.5, 8.0, NULL FROM titles t WHERE t.slug = 'tower-of-god'
ON CONFLICT (title_id) DO NOTHING;

-- the-beginning-after-the-end (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.0, 8.0, 8.0, 8.0, 7.5, NULL FROM titles t WHERE t.slug = 'the-beginning-after-the-end'
ON CONFLICT (title_id) DO NOTHING;

-- second-life-ranker already has rating, skip

-- vinland-saga (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 9.5, 9.5, 9.0, NULL FROM titles t WHERE t.slug = 'vinland-saga'
ON CONFLICT (title_id) DO NOTHING;

-- jujutsu-kaisen (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 9.0, 8.5, 8.0, NULL FROM titles t WHERE t.slug = 'jujutsu-kaisen'
ON CONFLICT (title_id) DO NOTHING;

-- chainsaw-man (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.0, 9.0, 9.5, 9.0, 8.5, NULL FROM titles t WHERE t.slug = 'chainsaw-man'
ON CONFLICT (title_id) DO NOTHING;

-- spy-x-family (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 9.0, 8.0, 8.5, NULL FROM titles t WHERE t.slug = 'spy-x-family'
ON CONFLICT (title_id) DO NOTHING;

-- blue-lock (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.0, 8.5, 9.0, 8.5, 9.0, NULL FROM titles t WHERE t.slug = 'blue-lock'
ON CONFLICT (title_id) DO NOTHING;

-- frieren-beyond-journeys-end (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 9.0, 9.5, 9.5, NULL FROM titles t WHERE t.slug = 'frieren-beyond-journeys-end'
ON CONFLICT (title_id) DO NOTHING;

-- oshi-no-ko (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.0, 9.0, 8.5, 9.0, 8.5, NULL FROM titles t WHERE t.slug = 'oshi-no-ko'
ON CONFLICT (title_id) DO NOTHING;

-- one-piece (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 9.5, 9.5, 9.0, 9.5, 8.5, NULL FROM titles t WHERE t.slug = 'one-piece'
ON CONFLICT (title_id) DO NOTHING;

-- remarried-empress (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 9.0, 9.0, 8.5, 8.5, NULL FROM titles t WHERE t.slug = 'remarried-empress'
ON CONFLICT (title_id) DO NOTHING;

-- trash-counts-family (reading, series ongoing — no ending)
INSERT INTO ratings (title_id, overall, emotional, art, story, pacing, ending)
SELECT t.id, 8.5, 8.5, 8.0, 8.5, 8.0, NULL FROM titles t WHERE t.slug = 'trash-counts-family'
ON CONFLICT (title_id) DO NOTHING;
