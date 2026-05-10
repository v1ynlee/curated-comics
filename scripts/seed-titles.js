#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// ============================================================
// Seed 100 dummy titles into Supabase for local development.
// Run: node scripts/seed-titles.js
// Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
//           (or SUPABASE_SERVICE_ROLE_KEY for bypassing RLS)
// ============================================================

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Data ──────────────────────────────────────────────────────

const ORIGINS = ['manhwa', 'manhwa', 'manhwa', 'manhua', 'manga'];
const SERIES_STATUSES = ['ongoing', 'ongoing', 'completed', 'completed', 'hiatus'];
const READING_STATUSES = [
  'reading', 'completed', 'completed', 'completed', 'dropped',
  'paused', 'wishlist', 'hidden-gem', 'guilty-pleasure', 'top-favorite',
];
const TIERS = ['SSS+', 'S', 'S', 'A', 'A', 'A', 'B', 'B', 'C', 'D', 'F', null];

const TITLES = [
  { en: 'Solo Leveling', slug: 'solo-leveling', origin: 'manhwa' },
  { en: 'Tower of God', slug: 'tower-of-god', origin: 'manhwa' },
  { en: 'Omniscient Reader', slug: 'omniscient-reader', origin: 'manhwa' },
  { en: 'Return of the Mount Hua Sect', slug: 'return-mount-hua', origin: 'manhwa' },
  { en: 'Nano Machine', slug: 'nano-machine', origin: 'manhwa' },
  { en: 'Second Life Ranker', slug: 'second-life-ranker', origin: 'manhwa' },
  { en: 'The Beginning After the End', slug: 'the-beginning-after-the-end', origin: 'manhwa' },
  { en: 'Overgeared', slug: 'overgeared', origin: 'manhwa' },
  { en: 'Murim Login', slug: 'murim-login', origin: 'manhwa' },
  { en: 'Reincarnation of the Suicidal Battle God', slug: 'reincarnation-suicidal-battle-god', origin: 'manhwa' },
  { en: 'Eleceed', slug: 'eleceed', origin: 'manhwa' },
  { en: 'Lookism', slug: 'lookism', origin: 'manhwa' },
  { en: 'True Beauty', slug: 'true-beauty', origin: 'manhwa' },
  { en: 'Weak Hero', slug: 'weak-hero', origin: 'manhwa' },
  { en: 'The God of High School', slug: 'god-of-high-school', origin: 'manhwa' },
  { en: 'Noblesse', slug: 'noblesse', origin: 'manhwa' },
  { en: 'Hardcore Leveling Warrior', slug: 'hardcore-leveling-warrior', origin: 'manhwa' },
  { en: 'Unordinary', slug: 'unordinary', origin: 'manhwa' },
  { en: 'I Love Yoo', slug: 'i-love-yoo', origin: 'manhwa' },
  { en: 'Lore Olympus', slug: 'lore-olympus', origin: 'manhwa' },
  { en: 'Villain to Kill', slug: 'villain-to-kill', origin: 'manhwa' },
  { en: 'Mercenary Enrollment', slug: 'mercenary-enrollment', origin: 'manhwa' },
  { en: 'Reaper of the Drifting Moon', slug: 'reaper-drifting-moon', origin: 'manhwa' },
  { en: 'Volcanic Age', slug: 'volcanic-age', origin: 'manhwa' },
  { en: 'Chronicles of the Martial God\'s Return', slug: 'chronicles-martial-god-return', origin: 'manhwa' },
  { en: 'Absolute Sword Sense', slug: 'absolute-sword-sense', origin: 'manhwa' },
  { en: 'Descent of the Demon Master', slug: 'descent-demon-master', origin: 'manhwa' },
  { en: 'Fist Demon of Mount Hua', slug: 'fist-demon-mount-hua', origin: 'manhwa' },
  { en: 'Heavenly Demon Reborn', slug: 'heavenly-demon-reborn', origin: 'manhwa' },
  { en: 'Infinite Leveling: Murim', slug: 'infinite-leveling-murim', origin: 'manhwa' },
  { en: 'Martial Peak', slug: 'martial-peak', origin: 'manhua' },
  { en: 'Battle Through the Heavens', slug: 'battle-through-heavens', origin: 'manhua' },
  { en: 'Apotheosis', slug: 'apotheosis', origin: 'manhua' },
  { en: 'Tales of Demons and Gods', slug: 'tales-demons-gods', origin: 'manhua' },
  { en: 'Peerless Dad', slug: 'peerless-dad', origin: 'manhua' },
  { en: 'Against the Gods', slug: 'against-the-gods', origin: 'manhua' },
  { en: 'Chaotic Sword God', slug: 'chaotic-sword-god', origin: 'manhua' },
  { en: 'Rebirth of the Urban Immortal Cultivator', slug: 'rebirth-urban-immortal', origin: 'manhua' },
  { en: 'Versatile Mage', slug: 'versatile-mage', origin: 'manhua' },
  { en: 'The Legendary Mechanic', slug: 'legendary-mechanic', origin: 'manhua' },
  { en: 'Demon\'s Diary', slug: 'demons-diary', origin: 'manhua' },
  { en: 'Stellar Transformation', slug: 'stellar-transformation', origin: 'manhua' },
  { en: 'Coiling Dragon', slug: 'coiling-dragon', origin: 'manhua' },
  { en: 'Desolate Era', slug: 'desolate-era', origin: 'manhua' },
  { en: 'I Shall Seal the Heavens', slug: 'i-shall-seal-heavens', origin: 'manhua' },
  { en: 'One Piece', slug: 'one-piece', origin: 'manga' },
  { en: 'Berserk', slug: 'berserk', origin: 'manga' },
  { en: 'Vagabond', slug: 'vagabond', origin: 'manga' },
  { en: 'Vinland Saga', slug: 'vinland-saga', origin: 'manga' },
  { en: 'Fullmetal Alchemist', slug: 'fullmetal-alchemist', origin: 'manga' },
  { en: 'Hunter x Hunter', slug: 'hunter-x-hunter', origin: 'manga' },
  { en: 'Demon Slayer', slug: 'demon-slayer', origin: 'manga' },
  { en: 'Jujutsu Kaisen', slug: 'jujutsu-kaisen', origin: 'manga' },
  { en: 'Chainsaw Man', slug: 'chainsaw-man', origin: 'manga' },
  { en: 'Spy x Family', slug: 'spy-x-family', origin: 'manga' },
  { en: 'Blue Lock', slug: 'blue-lock', origin: 'manga' },
  { en: 'Kaiju No. 8', slug: 'kaiju-no-8', origin: 'manga' },
  { en: 'Dungeon Meshi', slug: 'dungeon-meshi', origin: 'manga' },
  { en: 'Frieren: Beyond Journey\'s End', slug: 'frieren-beyond-journeys-end', origin: 'manga' },
  { en: 'Oshi no Ko', slug: 'oshi-no-ko', origin: 'manga' },
  { en: 'Mushoku Tensei', slug: 'mushoku-tensei', origin: 'manga' },
  { en: 'That Time I Got Reincarnated as a Slime', slug: 'slime-reincarnation', origin: 'manga' },
  { en: 'Overlord', slug: 'overlord', origin: 'manga' },
  { en: 'Re:Zero', slug: 're-zero', origin: 'manga' },
  { en: 'The Eminence in Shadow', slug: 'eminence-in-shadow', origin: 'manga' },
  { en: 'Classroom of the Elite', slug: 'classroom-of-the-elite', origin: 'manga' },
  { en: 'Villainess Level 99', slug: 'villainess-level-99', origin: 'manga' },
  { en: 'I\'m the Villainess, So I\'m Taming the Final Boss', slug: 'villainess-taming-final-boss', origin: 'manga' },
  { en: 'My Next Life as a Villainess', slug: 'my-next-life-villainess', origin: 'manga' },
  { en: 'The Villainess Reverses the Hourglass', slug: 'villainess-reverses-hourglass', origin: 'manhwa' },
  { en: 'Beware of the Villainess', slug: 'beware-of-the-villainess', origin: 'manhwa' },
  { en: 'The Abandoned Empress', slug: 'abandoned-empress', origin: 'manhwa' },
  { en: 'Who Made Me a Princess', slug: 'who-made-me-princess', origin: 'manhwa' },
  { en: 'The Reason Why Raeliana Ended Up at the Duke\'s Mansion', slug: 'raeliana-dukes-mansion', origin: 'manhwa' },
  { en: 'Remarried Empress', slug: 'remarried-empress', origin: 'manhwa' },
  { en: 'Doctor Elise: The Royal Lady with the Lamp', slug: 'doctor-elise', origin: 'manhwa' },
  { en: 'Empress of Another World', slug: 'empress-another-world', origin: 'manhwa' },
  { en: 'The Duchess with an Empty Soul', slug: 'duchess-empty-soul', origin: 'manhwa' },
  { en: 'I Became the Villain\'s Mother', slug: 'villain-mother', origin: 'manhwa' },
  { en: 'The Tyrant\'s Tranquilizer', slug: 'tyrant-tranquilizer', origin: 'manhwa' },
  { en: 'Omniscient Reader\'s Viewpoint', slug: 'omniscient-readers-viewpoint', origin: 'manhwa' },
  { en: 'A Returner\'s Magic Should Be Special', slug: 'returners-magic-special', origin: 'manhwa' },
  { en: 'The Max Level Hero Has Returned', slug: 'max-level-hero-returned', origin: 'manhwa' },
  { en: 'Leveling Up, by Only Eating', slug: 'leveling-up-eating', origin: 'manhwa' },
  { en: 'Dungeon Reset', slug: 'dungeon-reset', origin: 'manhwa' },
  { en: 'The Tutorial Is Too Hard', slug: 'tutorial-too-hard', origin: 'manhwa' },
  { en: 'Skeleton Soldier Couldn\'t Protect the Dungeon', slug: 'skeleton-soldier', origin: 'manhwa' },
  { en: 'Trash of the Count\'s Family', slug: 'trash-counts-family', origin: 'manhwa' },
  { en: 'The Novel\'s Extra', slug: 'novels-extra', origin: 'manhwa' },
  { en: 'Regressor Instruction Manual', slug: 'regressor-instruction-manual', origin: 'manhwa' },
  { en: 'Regression Instruction Manual', slug: 'regression-instruction-manual', origin: 'manhwa' },
  { en: 'The S-Classes That I Raised', slug: 's-classes-i-raised', origin: 'manhwa' },
  { en: 'I Became a Renowned Family\'s Sword Prodigy', slug: 'sword-prodigy', origin: 'manhwa' },
  { en: 'Reincarnated as the Sword', slug: 'reincarnated-as-sword', origin: 'manga' },
  { en: 'Tensei Shitara Slime Datta Ken', slug: 'tensei-slime', origin: 'manga' },
  { en: 'Sword Art Online', slug: 'sword-art-online', origin: 'manga' },
  { en: 'No Game No Life', slug: 'no-game-no-life', origin: 'manga' },
  { en: 'Konosuba', slug: 'konosuba', origin: 'manga' },
];

const SYNOPSES = [
  'A hunter awakens a hidden power and rises to become the strongest in the world.',
  'A young warrior enters a mysterious tower to find the one who brought him there.',
  'The last reader of a prophetic novel must live through its events to save the world.',
  'A martial arts master reincarnates and must rebuild his sect from scratch.',
  'A nano machine is injected into a young warrior, granting him extraordinary abilities.',
  'A hunter dies and is reincarnated in a world of dungeons and monsters.',
  'A young king must navigate a world of magic and politics to protect his kingdom.',
  'A gamer is transported into a virtual reality game and must survive.',
  'A modern man wakes up in a murim world with memories of his past life.',
  'A warrior reincarnates to prevent the apocalypse he failed to stop.',
];

const VIBE_CHECKS = [
  'The one that started it all',
  'Absolute peak fiction, no notes',
  'Cried at 3am, would do it again',
  'My comfort read when life gets hard',
  'Dropped it but still think about it',
  'Guilty pleasure that I recommend unironically',
  'The art alone is worth the read',
  'Slow burn that pays off spectacularly',
  'Chaotic energy from start to finish',
  'The ending destroyed me in the best way',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, step = 0.5) {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('Seeding 100 dummy titles...\n');

  // Fetch genre and mood IDs
  const { data: genres } = await supabase.from('genres').select('id, slug');
  const { data: moods } = await supabase.from('moods').select('id, slug');

  if (!genres || genres.length === 0) {
    console.error('No genres found. Run supabase db push --yes --include-seed first.');
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < TITLES.length; i++) {
    const t = TITLES[i];
    const readingStatus = pick(READING_STATUSES);
    const seriesStatus = pick(SERIES_STATUSES);
    const tier = pick(TIERS);
    const chaptersRead = randInt(10, 800);
    const totalChapters = seriesStatus === 'completed' ? chaptersRead : (Math.random() > 0.5 ? chaptersRead + randInt(10, 200) : null);
    const featured = i < 8; // first 8 are featured (match placeholder images)
    const coverSlug = i < 8 ? t.slug : null; // only first 8 have placeholder images

    // Insert title
    const { data: titleData, error: titleError } = await supabase
      .from('titles')
      .insert({
        slug: t.slug,
        title_english: t.en,
        origin: t.origin,
        series_status: seriesStatus,
        reading_status: readingStatus,
        chapters_read: chaptersRead,
        total_chapters: totalChapters,
        tier: tier,
        synopsis: pick(SYNOPSES),
        vibe_check: pick(VIBE_CHECKS),
        featured,
        hidden: false,
        cover_slug: coverSlug,
        dominant_color: pick(['#1a1a2e', '#0f0f1a', '#16213e', '#1a0a2e', '#0a1628']),
        last_read_date: new Date(Date.now() - randInt(0, 365) * 24 * 60 * 60 * 1000).toISOString(),
        reread_count: Math.random() > 0.8 ? randInt(1, 5) : 0,
      })
      .select('id')
      .single();

    if (titleError) {
      if (titleError.code === '23505') {
        skipped++;
        continue; // Already exists
      }
      console.error(`Error inserting ${t.en}:`, titleError.message);
      continue;
    }

    const titleId = titleData.id;

    // Add 2-4 random genres
    const numGenres = randInt(2, 4);
    const shuffledGenres = [...genres].sort(() => Math.random() - 0.5).slice(0, numGenres);
    if (shuffledGenres.length > 0) {
      await supabase.from('title_genres').insert(
        shuffledGenres.map((g) => ({ title_id: titleId, genre_id: g.id }))
      );
    }

    // Add 1-2 random moods
    if (moods && moods.length > 0) {
      const numMoods = randInt(1, 2);
      const shuffledMoods = [...moods].sort(() => Math.random() - 0.5).slice(0, numMoods);
      await supabase.from('title_moods').insert(
        shuffledMoods.map((m) => ({ title_id: titleId, mood_id: m.id }))
      );
    }

    // Add ratings for completed/top-favorite titles
    if (['completed', 'top-favorite', 'most-reread', 'hidden-gem'].includes(readingStatus)) {
      const overall = randFloat(6, 10);
      await supabase.from('ratings').insert({
        title_id: titleId,
        overall,
        emotional: randFloat(5, 10),
        art: randFloat(5, 10),
        story: randFloat(5, 10),
        pacing: randFloat(5, 10),
        ending: seriesStatus === 'completed' ? randFloat(5, 10) : null,
      });
    }

    inserted++;
    process.stdout.write(`\r  Inserted: ${inserted} | Skipped: ${skipped}`);
  }

  console.log(`\n\nDone! Inserted ${inserted} titles, skipped ${skipped} (already exist).`);
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
