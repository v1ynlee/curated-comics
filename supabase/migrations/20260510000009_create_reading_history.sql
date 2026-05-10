-- ============================================================
-- Migration: 009 — Create reading_history table
-- Source: docs/database/DATABASE_SCHEMA_PLANNING.md
-- ============================================================

CREATE TABLE reading_history (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id      UUID        NOT NULL REFERENCES titles(id) ON DELETE CASCADE,

  chapters_read INTEGER     NOT NULL,
  read_date     DATE        NOT NULL DEFAULT CURRENT_DATE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reading_history_title ON reading_history(title_id);
CREATE INDEX idx_reading_history_date  ON reading_history(read_date DESC);
-- Efficient monthly aggregation via year/month columns
CREATE INDEX idx_reading_history_year  ON reading_history(CAST(EXTRACT(YEAR  FROM read_date) AS INTEGER));
CREATE INDEX idx_reading_history_month ON reading_history(CAST(EXTRACT(MONTH FROM read_date) AS INTEGER));
