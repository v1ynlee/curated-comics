-- ============================================================
-- Migration: 023 — Add featured_order column to titles table
-- Allows controlling the display order of featured titles on the homepage.
-- ============================================================

ALTER TABLE titles
  ADD COLUMN featured_order INTEGER DEFAULT 0;

-- Index for efficient ordering of featured titles
CREATE INDEX idx_titles_featured_order ON titles(featured_order ASC) WHERE featured = TRUE;
