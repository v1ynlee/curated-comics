-- ============================================================
-- Migration: 014 — Fix reading_history monthly index
-- Reason: Migration 009 failed to create the monthly index
-- because date_trunc() on a DATE column is not IMMUTABLE.
-- This migration adds the index using a stable approach.
-- ============================================================

-- Simple index on read_date is sufficient for monthly grouping.
-- The view uses date_trunc('month', read_date::TIMESTAMPTZ) which
-- can use this index via index scan on read_date.
CREATE INDEX IF NOT EXISTS idx_reading_history_year_month
  ON reading_history(read_date);
