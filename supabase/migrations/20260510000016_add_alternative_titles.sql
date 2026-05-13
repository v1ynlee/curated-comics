-- ============================================================
-- Migration: 016 — Add alternative titles to seed data
-- title_alternative TEXT[] already exists on the titles table.
-- This migration populates it for key titles.
-- ============================================================

-- Return of the Mount Hua Sect
UPDATE titles SET title_alternative = ARRAY[
  'Return of the Blossoming Blade',
  '화산귀환',
  'Hwasan Gwiwan'
] WHERE slug = 'return-mount-hua';

-- One Piece
UPDATE titles SET title_alternative = ARRAY[
  'ワンピース',
  'Wan Pisu'
] WHERE slug = 'one-piece';

-- Solo Leveling
UPDATE titles SET title_alternative = ARRAY[
  '나 혼자만 레벨업',
  'Na Honjaman Level Up',
  'Only I Level Up'
] WHERE slug = 'solo-leveling';

-- Tower of God
UPDATE titles SET title_alternative = ARRAY[
  '신의 탑',
  'Sin-ui Tap'
] WHERE slug = 'tower-of-god';

-- Omniscient Reader
UPDATE titles SET title_alternative = ARRAY[
  '전지적 독자 시점',
  'Jeonjijeogin Dokja Sijeom'
] WHERE slug = 'omniscient-reader';

-- Nano Machine
UPDATE titles SET title_alternative = ARRAY[
  '나노마신',
  'Nanomachine'
] WHERE slug = 'nano-machine';

-- Berserk
UPDATE titles SET title_alternative = ARRAY[
  'ベルセルク',
  'Beruseruku'
] WHERE slug = 'berserk';

-- Vagabond
UPDATE titles SET title_alternative = ARRAY[
  'バガボンド',
  'Bagabondo'
] WHERE slug = 'vagabond';

-- Fullmetal Alchemist
UPDATE titles SET title_alternative = ARRAY[
  '鋼の錬金術師',
  'Hagane no Renkinjutsushi',
  'FMA'
] WHERE slug = 'fullmetal-alchemist';

-- Hunter x Hunter
UPDATE titles SET title_alternative = ARRAY[
  'ハンター×ハンター',
  'Hanta Hanta',
  'HxH'
] WHERE slug = 'hunter-x-hunter';
