# Database Schema Planning — Comic Curated

## Database Choice: Supabase (PostgreSQL)

Supabase provides:
- PostgreSQL with full SQL capabilities
- Row Level Security (RLS) for access control
- Real-time subscriptions (future use)
- Built-in storage for images
- Edge Functions for serverless logic
- Auto-generated REST API

---

## Schema Design

### Tables Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   titles    │────<│ title_genres │>────│   genres    │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       │            ┌──────────────┐     ┌─────────────┐
       ├───────────<│ title_moods  │>────│    moods    │
       │            └──────────────┘     └─────────────┘
       │
       │            ┌──────────────┐
       ├────────────│   ratings    │
       │            └──────────────┘
       │
       │            ┌──────────────┐
       ├────────────│   reviews    │
       │            └──────────────┘
       │
       │            ┌──────────────────┐
       ├───────────<│ external_links   │
       │            └──────────────────┘
       │
       │            ┌──────────────────┐
       └───────────<│  title_tags      │
                    └──────────────────┘

┌──────────────────┐
│  achievements    │  (standalone, computed from titles)
└──────────────────┘

┌──────────────────┐
│ reading_history  │  (timeline tracking)
└──────────────────┘
```

---

### Table: `titles`
```sql
CREATE TABLE titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  
  -- Identity
  title_english TEXT NOT NULL,
  title_original TEXT,
  title_alternative TEXT[],  -- Array of alternative names
  
  -- Classification
  origin TEXT NOT NULL CHECK (origin IN ('manhwa', 'manhua', 'manga')),
  series_status TEXT NOT NULL CHECK (series_status IN ('ongoing', 'completed', 'hiatus', 'cancelled')),
  
  -- Reading Status
  reading_status TEXT NOT NULL CHECK (reading_status IN (
    'reading', 'completed', 'dropped', 'paused', 'wishlist',
    'hidden-gem', 'guilty-pleasure', 'top-favorite', 'most-reread'
  )),
  chapters_read INTEGER NOT NULL DEFAULT 0,
  total_chapters INTEGER,  -- NULL if ongoing/unknown
  started_date DATE,
  completed_date DATE,
  last_read_date TIMESTAMPTZ DEFAULT NOW(),
  reread_count INTEGER NOT NULL DEFAULT 0,
  
  -- Tier
  tier TEXT CHECK (tier IN ('SSS+', 'S', 'A', 'B', 'C', 'D', 'F')),
  
  -- Content
  synopsis TEXT,
  vibe_check TEXT,          -- One-line mood description
  quotable_lines TEXT[],    -- Array of memorable quotes
  
  -- Media
  cover_slug TEXT,          -- References image pipeline
  banner_slug TEXT,
  dominant_color TEXT,      -- Hex color from cover
  
  -- Flags
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_chapters CHECK (chapters_read >= 0),
  CONSTRAINT valid_reread CHECK (reread_count >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_titles_reading_status ON titles(reading_status);
CREATE INDEX idx_titles_tier ON titles(tier);
CREATE INDEX idx_titles_origin ON titles(origin);
CREATE INDEX idx_titles_last_read ON titles(last_read_date DESC);
CREATE INDEX idx_titles_featured ON titles(featured) WHERE featured = TRUE;
CREATE INDEX idx_titles_slug ON titles(slug);

-- Full-text search
CREATE INDEX idx_titles_search ON titles USING gin(
  to_tsvector('english', 
    coalesce(title_english, '') || ' ' || 
    coalesce(title_original, '') || ' ' ||
    coalesce(synopsis, '') || ' ' ||
    coalesce(vibe_check, '')
  )
);
```

### Table: `ratings`
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  
  overall NUMERIC(3,1) NOT NULL CHECK (overall >= 1 AND overall <= 10),
  emotional NUMERIC(3,1) NOT NULL CHECK (emotional >= 1 AND emotional <= 10),
  art NUMERIC(3,1) NOT NULL CHECK (art >= 1 AND art <= 10),
  story NUMERIC(3,1) NOT NULL CHECK (story >= 1 AND story <= 10),
  pacing NUMERIC(3,1) NOT NULL CHECK (pacing >= 1 AND pacing <= 10),
  ending NUMERIC(3,1) CHECK (ending >= 1 AND ending <= 10),  -- NULL if not completed
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT one_rating_per_title UNIQUE (title_id)
);

CREATE INDEX idx_ratings_title ON ratings(title_id);
CREATE INDEX idx_ratings_overall ON ratings(overall DESC);
```

### Table: `reviews`
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  
  -- Content
  body TEXT NOT NULL,              -- Markdown formatted
  tldr TEXT,                       -- One-paragraph summary
  
  -- Sections (optional structured content)
  what_i_loved TEXT,
  what_i_hated TEXT,
  emotional_damage TEXT,
  would_recommend_to TEXT,
  
  -- Spoiler handling
  has_spoilers BOOLEAN NOT NULL DEFAULT FALSE,
  spoiler_sections JSONB,          -- Array of { start, end, label }
  
  -- Meta
  word_count INTEGER NOT NULL DEFAULT 0,
  written_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_edited TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT one_review_per_title UNIQUE (title_id)
);

CREATE INDEX idx_reviews_title ON reviews(title_id);
```

### Table: `genres`
```sql
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL,             -- Hex color
  icon TEXT,                       -- Icon identifier
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_genres_slug ON genres(slug);
```

### Table: `title_genres` (Junction)
```sql
CREATE TABLE title_genres (
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  
  PRIMARY KEY (title_id, genre_id)
);

CREATE INDEX idx_title_genres_genre ON title_genres(genre_id);
```

### Table: `moods`
```sql
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  emoji TEXT,
  
  -- Atmosphere config (for UI)
  atmosphere JSONB NOT NULL DEFAULT '{}',
  -- { gradient: [...], particleColor: "...", accentColor: "..." }
  
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moods_slug ON moods(slug);
```

### Table: `title_moods` (Junction)
```sql
CREATE TABLE title_moods (
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  mood_id UUID NOT NULL REFERENCES moods(id) ON DELETE CASCADE,
  
  PRIMARY KEY (title_id, mood_id)
);

CREATE INDEX idx_title_moods_mood ON title_moods(mood_id);
```

### Table: `external_links`
```sql
CREATE TABLE external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL CHECK (platform IN (
    'webtoon', 'kakaopage', 'naver', 'tapas', 'mangadex',
    'tappytoon', 'lezhin', 'official', 'other'
  )),
  url TEXT NOT NULL,
  label TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_external_links_title ON external_links(title_id);
```

### Table: `title_tags`
```sql
CREATE TABLE title_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  
  CONSTRAINT unique_title_tag UNIQUE (title_id, tag)
);

CREATE INDEX idx_title_tags_title ON title_tags(title_id);
CREATE INDEX idx_title_tags_tag ON title_tags(tag);
```

### Table: `achievements`
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  
  -- Condition
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'count', 'genre', 'rating', 'streak', 'special'
  )),
  condition_target INTEGER NOT NULL,
  condition_filter JSONB,          -- { genre: "murim", status: "completed" }
  
  -- Status
  current_progress INTEGER NOT NULL DEFAULT 0,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_date TIMESTAMPTZ,
  
  -- Visual
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  color TEXT NOT NULL,
  glow_effect BOOLEAN NOT NULL DEFAULT FALSE,
  
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_achievements_unlocked ON achievements(unlocked);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
```

### Table: `reading_history`
```sql
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  
  chapters_read INTEGER NOT NULL,  -- Chapters read in this session
  read_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reading_history_title ON reading_history(title_id);
CREATE INDEX idx_reading_history_date ON reading_history(read_date DESC);
CREATE INDEX idx_reading_history_month ON reading_history(date_trunc('month', read_date));
```

---

## Views (Computed Queries)

### Statistics View
```sql
CREATE VIEW reading_statistics AS
SELECT
  COUNT(*) as total_titles,
  SUM(chapters_read) as total_chapters,
  ROUND(SUM(chapters_read) * 4.0 / 60, 1) as estimated_hours,
  AVG(r.overall) as average_rating,
  COUNT(*) FILTER (WHERE reading_status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE reading_status = 'dropped') as dropped_count,
  ROUND(
    COUNT(*) FILTER (WHERE reading_status = 'completed')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE reading_status IN ('completed', 'dropped')), 0) * 100,
    1
  ) as completion_rate
FROM titles t
LEFT JOIN ratings r ON r.title_id = t.id
WHERE t.hidden = FALSE;
```

### Genre Distribution View
```sql
CREATE VIEW genre_distribution AS
SELECT 
  g.name,
  g.slug,
  g.color,
  COUNT(tg.title_id) as title_count,
  ROUND(AVG(r.overall), 1) as avg_rating
FROM genres g
LEFT JOIN title_genres tg ON tg.genre_id = g.id
LEFT JOIN ratings r ON r.title_id = tg.title_id
GROUP BY g.id, g.name, g.slug, g.color
ORDER BY title_count DESC;
```

### Monthly Reading View
```sql
CREATE VIEW monthly_reading AS
SELECT
  date_trunc('month', read_date) as month,
  SUM(chapters_read) as chapters,
  COUNT(DISTINCT title_id) as titles_active
FROM reading_history
GROUP BY date_trunc('month', read_date)
ORDER BY month DESC;
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Public read access (for the showcase website)
CREATE POLICY "Public can view non-hidden titles"
  ON titles FOR SELECT
  USING (hidden = FALSE);

-- Owner full access (for admin/management)
CREATE POLICY "Owner has full access"
  ON titles FOR ALL
  USING (auth.uid() = 'OWNER_UUID');

-- Same pattern for all tables
```

---

## Database Functions

### Update Achievement Progress
```sql
CREATE OR REPLACE FUNCTION update_achievement_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate all achievement progress
  UPDATE achievements SET
    current_progress = (
      CASE condition_type
        WHEN 'count' THEN (
          SELECT COUNT(*) FROM titles 
          WHERE reading_status = COALESCE(condition_filter->>'status', reading_status)
        )
        WHEN 'genre' THEN (
          SELECT COUNT(DISTINCT t.id) FROM titles t
          JOIN title_genres tg ON tg.title_id = t.id
          JOIN genres g ON g.id = tg.genre_id
          WHERE g.slug = condition_filter->>'genre'
        )
        ELSE current_progress
      END
    ),
    unlocked = (current_progress >= condition_target),
    unlocked_date = CASE 
      WHEN current_progress >= condition_target AND unlocked = FALSE 
      THEN NOW() 
      ELSE unlocked_date 
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on title changes
CREATE TRIGGER trigger_achievement_update
  AFTER INSERT OR UPDATE ON titles
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_progress();
```

### Auto-Update Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON titles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## Seed Data Structure

### Initial Genre Seed
```sql
INSERT INTO genres (name, slug, color, sort_order) VALUES
  ('Action', 'action', '#EF4444', 1),
  ('Adventure', 'adventure', '#F59E0B', 2),
  ('Comedy', 'comedy', '#FCD34D', 3),
  ('Drama', 'drama', '#8B5CF6', 4),
  ('Fantasy', 'fantasy', '#6366F1', 5),
  ('Horror', 'horror', '#1F2937', 6),
  ('Martial Arts', 'martial-arts', '#DC2626', 7),
  ('Murim', 'murim', '#B91C1C', 8),
  ('Mystery', 'mystery', '#4B5563', 9),
  ('Psychological', 'psychological', '#7C3AED', 10),
  ('Regression', 'regression', '#2563EB', 11),
  ('Reincarnation', 'reincarnation', '#0EA5E9', 12),
  ('Romance', 'romance', '#EC4899', 13),
  ('School Life', 'school-life', '#10B981', 14),
  ('Sci-Fi', 'sci-fi', '#06B6D4', 15),
  ('Slice of Life', 'slice-of-life', '#34D399', 16),
  ('Sports', 'sports', '#F97316', 17),
  ('Supernatural', 'supernatural', '#A855F7', 18),
  ('System', 'system', '#3B82F6', 19),
  ('Thriller', 'thriller', '#374151', 20),
  ('Tower', 'tower', '#6D28D9', 21),
  ('Villainess', 'villainess', '#BE185D', 22),
  ('Wuxia', 'wuxia', '#991B1B', 23);
```

---

## Query Patterns

### Library Browse (with filters)
```sql
SELECT t.*, r.overall as rating, 
  array_agg(DISTINCT g.name) as genres,
  array_agg(DISTINCT m.name) as moods
FROM titles t
LEFT JOIN ratings r ON r.title_id = t.id
LEFT JOIN title_genres tg ON tg.title_id = t.id
LEFT JOIN genres g ON g.id = tg.genre_id
LEFT JOIN title_moods tm ON tm.title_id = t.id
LEFT JOIN moods m ON m.id = tm.mood_id
WHERE t.hidden = FALSE
  AND t.reading_status = $1  -- filter by status
  AND ($2::text[] IS NULL OR g.slug = ANY($2))  -- filter by genres
GROUP BY t.id, r.overall
ORDER BY t.last_read_date DESC
LIMIT $3 OFFSET $4;
```

### Title Detail (full data)
```sql
SELECT 
  t.*,
  r.*,
  rev.body as review_body,
  rev.tldr as review_tldr,
  array_agg(DISTINCT jsonb_build_object('name', g.name, 'slug', g.slug, 'color', g.color)) as genres,
  array_agg(DISTINCT jsonb_build_object('name', m.name, 'slug', m.slug, 'emoji', m.emoji)) as moods,
  array_agg(DISTINCT jsonb_build_object('platform', el.platform, 'url', el.url)) as links,
  array_agg(DISTINCT tt.tag) as tags
FROM titles t
LEFT JOIN ratings r ON r.title_id = t.id
LEFT JOIN reviews rev ON rev.title_id = t.id
LEFT JOIN title_genres tg ON tg.title_id = t.id
LEFT JOIN genres g ON g.id = tg.genre_id
LEFT JOIN title_moods tm ON tm.title_id = t.id
LEFT JOIN moods m ON m.id = tm.mood_id
LEFT JOIN external_links el ON el.title_id = t.id
LEFT JOIN title_tags tt ON tt.title_id = t.id
WHERE t.slug = $1
GROUP BY t.id, r.id, rev.id;
```

---

## Migration Strategy

### Version Control
- All schema changes via numbered migration files
- Use Supabase CLI for local development
- Migration naming: `YYYYMMDD_HHMMSS_description.sql`

### Migration Order
```
001_create_genres.sql
002_create_moods.sql
003_create_titles.sql
004_create_ratings.sql
005_create_reviews.sql
006_create_junction_tables.sql
007_create_external_links.sql
008_create_achievements.sql
009_create_reading_history.sql
010_create_views.sql
011_create_functions.sql
012_create_rls_policies.sql
013_seed_genres.sql
014_seed_moods.sql
015_seed_achievements.sql
```
