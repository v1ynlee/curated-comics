-- ============================================================
-- Migration: 027 — Seed mood discovery metadata
-- Idempotent: uses ON CONFLICT DO NOTHING / UPDATE by slug
-- ============================================================

-- ── 1. Update moods with discovery metadata ───────────────────

UPDATE moods SET
  featured_priority = 10,
  featured_slot     = 'hero',
  popularity_score  = 95,
  editor_note       = 'Aura farming at its peak.',
  atmosphere_config = '{"particleIntensity": 0.8, "glowStrength": "high", "overlayOpacity": 0.12, "animationIntensity": "cinematic"}'
WHERE slug = 'aura-farming';

UPDATE moods SET
  badge            = 'TRENDING',
  popularity_score = 88,
  editor_note      = 'Your brain cells were a sacrifice.'
WHERE slug = 'brainrot';

UPDATE moods SET
  badge            = 'PEAK',
  popularity_score = 82,
  editor_note      = 'Emotional damage guaranteed.',
  atmosphere_config = '{"particleIntensity": 0.5, "glowStrength": "low", "overlayOpacity": 0.18, "animationIntensity": "subtle"}'
WHERE slug = 'depression-arc';

UPDATE moods SET
  badge            = 'NEW',
  popularity_score = 74,
  editor_note      = 'Murim addiction is not curable.'
WHERE slug = 'murim-addiction';

UPDATE moods SET
  badge            = 'CURSED',
  popularity_score = 60,
  editor_note      = 'You know what you did.'
WHERE slug = 'guilty-trash';

UPDATE moods SET
  popularity_score = 78,
  editor_note      = 'Death is merely a suggestion.'
WHERE slug = 'necromancer-vibes';

UPDATE moods SET
  popularity_score = 70,
  editor_note      = 'Warmth for the weary reader.',
  atmosphere_config = '{"particleIntensity": 0.3, "glowStrength": "soft", "overlayOpacity": 0.10, "animationIntensity": "gentle"}'
WHERE slug = 'comfy-sol';

UPDATE moods SET
  popularity_score = 85,
  editor_note      = 'The satisfaction is immaculate.'
WHERE slug = 'revenge-fantasy';

UPDATE moods SET
  popularity_score = 80,
  editor_note      = 'Overpowered and unapologetic.'
WHERE slug = 'power-fantasy';

UPDATE moods SET
  badge            = 'PEAK',
  popularity_score = 76,
  editor_note      = 'Will make you cry in the shower.'
WHERE slug = 'emotional-damage';

UPDATE moods SET
  popularity_score = 72,
  editor_note      = 'Reincarnated as the villain, thriving anyway.'
WHERE slug = 'villainess-era';

UPDATE moods SET
  popularity_score = 65,
  editor_note      = 'Time loops and second chances.'
WHERE slug = 'regression-loop';

UPDATE moods SET
  popularity_score = 68,
  editor_note      = 'Floor by floor, getting dangerous.'
WHERE slug = 'tower-climbing';

UPDATE moods SET
  badge            = 'TRENDING',
  popularity_score = 73,
  editor_note      = 'Stat screens and level-up dopamine.'
WHERE slug = 'system-addict';

UPDATE moods SET
  popularity_score = 62,
  editor_note      = 'Visual masterpieces that justify the medium.'
WHERE slug = 'art-god';

UPDATE moods SET
  popularity_score = 58,
  editor_note      = 'Chess masters playing 4D chess.'
WHERE slug = 'manipulator-mc';

-- ── 2. Seed mood_collage_covers (manual curation) ────────────
-- Uses subquery pattern: SELECT m.id, t.id FROM moods m, titles t
-- ON CONFLICT DO NOTHING for idempotency

-- aura-farming
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'aura-farming' AND t.slug = 'solo-leveling' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'aura-farming' AND t.slug = 'omniscient-reader' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'aura-farming' AND t.slug = 'tower-of-god' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 3 FROM moods m, titles t WHERE m.slug = 'aura-farming' AND t.slug = 'return-mount-hua' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 4 FROM moods m, titles t WHERE m.slug = 'aura-farming' AND t.slug = 'nano-machine' ON CONFLICT DO NOTHING;

-- brainrot
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'brainrot' AND t.slug = 'trash-counts-family' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'brainrot' AND t.slug = 'eleceed' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'brainrot' AND t.slug = 'lookism' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 3 FROM moods m, titles t WHERE m.slug = 'brainrot' AND t.slug = 'blue-lock' ON CONFLICT DO NOTHING;

-- depression-arc
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'depression-arc' AND t.slug = 'berserk' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'depression-arc' AND t.slug = 'vagabond' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'depression-arc' AND t.slug = 'frieren-beyond-journeys-end' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 3 FROM moods m, titles t WHERE m.slug = 'depression-arc' AND t.slug = 'vinland-saga' ON CONFLICT DO NOTHING;

-- murim-addiction
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'murim-addiction' AND t.slug = 'return-mount-hua' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'murim-addiction' AND t.slug = 'nano-machine' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'murim-addiction' AND t.slug = 'murim-login' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 3 FROM moods m, titles t WHERE m.slug = 'murim-addiction' AND t.slug = 'volcanic-age' ON CONFLICT DO NOTHING;

-- guilty-trash
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'guilty-trash' AND t.slug = 'martial-peak' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'guilty-trash' AND t.slug = 'against-the-gods' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'guilty-trash' AND t.slug = 'sword-art-online' ON CONFLICT DO NOTHING;

-- villainess-era
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'villainess-era' AND t.slug = 'villainess-reverses-hourglass' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'villainess-era' AND t.slug = 'remarried-empress' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'villainess-era' AND t.slug = 'who-made-me-princess' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 3 FROM moods m, titles t WHERE m.slug = 'villainess-era' AND t.slug = 'beware-of-the-villainess' ON CONFLICT DO NOTHING;

-- emotional-damage
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'emotional-damage' AND t.slug = 'omniscient-reader' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'emotional-damage' AND t.slug = 'fullmetal-alchemist' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'emotional-damage' AND t.slug = 'dungeon-meshi' ON CONFLICT DO NOTHING;

-- revenge-fantasy
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'revenge-fantasy' AND t.slug = 'villainess-reverses-hourglass' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'revenge-fantasy' AND t.slug = 'weak-hero' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'revenge-fantasy' AND t.slug = 'skeleton-soldier' ON CONFLICT DO NOTHING;

-- power-fantasy
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'power-fantasy' AND t.slug = 'solo-leveling' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'power-fantasy' AND t.slug = 'second-life-ranker' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'power-fantasy' AND t.slug = 'the-beginning-after-the-end' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 3 FROM moods m, titles t WHERE m.slug = 'power-fantasy' AND t.slug = 'overgeared' ON CONFLICT DO NOTHING;

-- regression-loop
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'regression-loop' AND t.slug = 'returners-magic-special' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'regression-loop' AND t.slug = 'reincarnation-suicidal-battle-god' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'regression-loop' AND t.slug = 'tales-demons-gods' ON CONFLICT DO NOTHING;

-- tower-climbing
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'tower-climbing' AND t.slug = 'tower-of-god' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'tower-climbing' AND t.slug = 'tutorial-too-hard' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'tower-climbing' AND t.slug = 'dungeon-reset' ON CONFLICT DO NOTHING;

-- system-addict
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'system-addict' AND t.slug = 'solo-leveling' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'system-addict' AND t.slug = 'tutorial-too-hard' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'system-addict' AND t.slug = 'skeleton-soldier' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 3 FROM moods m, titles t WHERE m.slug = 'system-addict' AND t.slug = 's-classes-i-raised' ON CONFLICT DO NOTHING;

-- art-god
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'art-god' AND t.slug = 'vagabond' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'art-god' AND t.slug = 'berserk' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'art-god' AND t.slug = 'dungeon-meshi' ON CONFLICT DO NOTHING;

-- manipulator-mc
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'manipulator-mc' AND t.slug = 'omniscient-reader' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'manipulator-mc' AND t.slug = 'classroom-of-the-elite' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'manipulator-mc' AND t.slug = 'eminence-in-shadow' ON CONFLICT DO NOTHING;

-- necromancer-vibes
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'necromancer-vibes' AND t.slug = 'skeleton-soldier' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'necromancer-vibes' AND t.slug = 'overlord' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'necromancer-vibes' AND t.slug = 'solo-leveling' ON CONFLICT DO NOTHING;

-- comfy-sol
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 0 FROM moods m, titles t WHERE m.slug = 'comfy-sol' AND t.slug = 'spy-x-family' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 1 FROM moods m, titles t WHERE m.slug = 'comfy-sol' AND t.slug = 'dungeon-meshi' ON CONFLICT DO NOTHING;
INSERT INTO mood_collage_covers (mood_id, title_id, position)
SELECT m.id, t.id, 2 FROM moods m, titles t WHERE m.slug = 'comfy-sol' AND t.slug = 'peerless-dad' ON CONFLICT DO NOTHING;
