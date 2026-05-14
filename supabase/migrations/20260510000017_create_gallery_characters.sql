-- ============================================================
-- Migration: 017 — Gallery images + Characters tables
-- ============================================================

-- ── title_gallery ─────────────────────────────────────────────
CREATE TABLE title_gallery (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id    UUID        NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  category    TEXT        NOT NULL DEFAULT 'general'
    CHECK (category IN ('best-scene', 'romantic-scene', 'funny-scene', 'general', 'cover')),
  image_url   TEXT        NOT NULL,
  caption     TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_title ON title_gallery(title_id);
CREATE INDEX idx_gallery_category ON title_gallery(title_id, category);

-- RLS
ALTER TABLE title_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view gallery"
  ON title_gallery FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated owner has full access to gallery"
  ON title_gallery FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── title_characters ──────────────────────────────────────────
CREATE TABLE title_characters (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id    UUID        NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'supporting'
    CHECK (role IN ('main', 'supporting', 'antagonist', 'side')),
  description TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_characters_title ON title_characters(title_id);

-- RLS
ALTER TABLE title_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view characters"
  ON title_characters FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated owner has full access to characters"
  ON title_characters FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── character_images ──────────────────────────────────────────
CREATE TABLE character_images (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID        NOT NULL REFERENCES title_characters(id) ON DELETE CASCADE,
  image_url     TEXT        NOT NULL,
  caption       TEXT,
  sort_order    INTEGER     NOT NULL DEFAULT 0
);

CREATE INDEX idx_char_images_character ON character_images(character_id);

-- RLS
ALTER TABLE character_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view character images"
  ON character_images FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Authenticated owner has full access to character images"
  ON character_images FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── Add author/artist to titles ───────────────────────────────
ALTER TABLE titles ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE titles ADD COLUMN IF NOT EXISTS artist TEXT;

-- ── Seed: return-mount-hua ────────────────────────────────────

-- Author/artist
UPDATE titles SET author = 'Bi Ryeok Cheon', artist = 'Lufan' WHERE slug = 'return-mount-hua';
UPDATE titles SET author = 'Eiichiro Oda', artist = 'Eiichiro Oda' WHERE slug = 'one-piece';
UPDATE titles SET author = 'Chugong', artist = 'DUBU (Redice Studio)' WHERE slug = 'solo-leveling';
UPDATE titles SET author = 'SIU', artist = 'SIU' WHERE slug = 'tower-of-god';
UPDATE titles SET author = 'Sing Shong', artist = 'Sleepy-C' WHERE slug = 'omniscient-reader';
UPDATE titles SET author = 'Kentaro Miura', artist = 'Kentaro Miura' WHERE slug = 'berserk';
UPDATE titles SET author = 'Takehiko Inoue', artist = 'Takehiko Inoue' WHERE slug = 'vagabond';
UPDATE titles SET author = 'Hiromu Arakawa', artist = 'Hiromu Arakawa' WHERE slug = 'fullmetal-alchemist';
UPDATE titles SET author = 'Yoshihiro Togashi', artist = 'Yoshihiro Togashi' WHERE slug = 'hunter-x-hunter';

-- Characters: return-mount-hua
INSERT INTO title_characters (title_id, name, role, description, sort_order)
SELECT t.id, 'Chun Myung', 'main', 'The reincarnated Mount Hua Sect disciple, carrying memories of his past life as the greatest swordsman.', 1
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_characters (title_id, name, role, description, sort_order)
SELECT t.id, 'Yeon Harin', 'supporting', 'A talented disciple of the Mount Hua Sect who becomes one of Chun Myung''s closest allies.', 2
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_characters (title_id, name, role, description, sort_order)
SELECT t.id, 'Hyun Jong', 'supporting', 'The sect leader of Mount Hua, struggling to restore the sect''s former glory.', 3
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_characters (title_id, name, role, description, sort_order)
SELECT t.id, 'Baek Cheon', 'supporting', 'The top disciple of the current generation, initially at odds with Chun Myung.', 4
FROM titles t WHERE t.slug = 'return-mount-hua';

-- Characters: one-piece
INSERT INTO title_characters (title_id, name, role, description, sort_order)
SELECT t.id, 'Monkey D. Luffy', 'main', 'The rubber-powered captain of the Straw Hat Pirates, seeking the One Piece treasure.', 1
FROM titles t WHERE t.slug = 'one-piece';

INSERT INTO title_characters (title_id, name, role, description, sort_order)
SELECT t.id, 'Roronoa Zoro', 'supporting', 'The swordsman of the crew, aiming to become the world''s greatest swordsman.', 2
FROM titles t WHERE t.slug = 'one-piece';

INSERT INTO title_characters (title_id, name, role, description, sort_order)
SELECT t.id, 'Nami', 'supporting', 'The navigator of the Straw Hats, with a dream to map the entire world.', 3
FROM titles t WHERE t.slug = 'one-piece';

-- Gallery: return-mount-hua (using cover images as placeholders)
INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'best-scene', '/images/covers/return-mount-hua-640w.avif', 'The iconic plum blossom sword technique', 1
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'best-scene', '/images/covers/nano-machine-640w.avif', 'Chun Myung''s first breakthrough moment', 2
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'best-scene', '/images/covers/solo-leveling-640w.avif', 'The sect''s revival ceremony', 3
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'funny-scene', '/images/covers/overgeared-640w.avif', 'Chun Myung''s shameless begging arc', 4
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'funny-scene', '/images/covers/omniscient-reader-640w.avif', 'The disciples'' reaction to Chun Myung''s training methods', 5
FROM titles t WHERE t.slug = 'return-mount-hua';

INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'funny-scene', '/images/covers/second-life-ranker-640w.avif', 'Elder Hyun Jong''s exasperated expressions', 6
FROM titles t WHERE t.slug = 'return-mount-hua';

-- Gallery: one-piece
INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'best-scene', '/images/covers/tower-of-god-640w.avif', 'Gear 5 awakening', 1
FROM titles t WHERE t.slug = 'one-piece';

INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'best-scene', '/images/covers/the-beginning-after-the-end-640w.avif', 'Marineford War climax', 2
FROM titles t WHERE t.slug = 'one-piece';

INSERT INTO title_gallery (title_id, category, image_url, caption, sort_order)
SELECT t.id, 'best-scene', '/images/covers/overgeared-640w.avif', 'Wano Country finale', 3
FROM titles t WHERE t.slug = 'one-piece';
