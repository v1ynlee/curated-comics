#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// ============================================================
// seed-vibe-metadata.js — populate vibe discovery metadata
//
// Run: node scripts/seed-vibe-metadata.js
// Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//
// What it does:
//   1. Updates moods with badge, featured_priority, featured_slot,
//      editor_note, popularity_score, atmosphere_config
//   2. Inserts mood_collage_covers (3–6 titles per mood)
//   3. Ensures every mood has ≥4 title_moods associations
//
// Idempotent: UPDATE + ON CONFLICT DO NOTHING safe to re-run
// ============================================================

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Mood metadata ─────────────────────────────────────────────

const MOOD_META = [
  {
    slug: 'aura-farming',
    badge: null,
    featured_priority: 10,
    featured_slot: 'hero',
    popularity_score: 95,
    editor_note: 'Aura farming at its peak.',
    atmosphere_config: { particleIntensity: 0.8, glowStrength: 'high', overlayOpacity: 0.12, animationIntensity: 'cinematic' },
  },
  {
    slug: 'brainrot',
    badge: 'TRENDING',
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 88,
    editor_note: 'Your brain cells were a sacrifice.',
    atmosphere_config: {},
  },
  {
    slug: 'depression-arc',
    badge: 'PEAK',
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 82,
    editor_note: 'Emotional damage guaranteed.',
    atmosphere_config: { particleIntensity: 0.5, glowStrength: 'low', overlayOpacity: 0.18, animationIntensity: 'subtle' },
  },
  {
    slug: 'murim-addiction',
    badge: 'NEW',
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 74,
    editor_note: 'Murim addiction is not curable.',
    atmosphere_config: {},
  },
  {
    slug: 'guilty-trash',
    badge: 'CURSED',
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 60,
    editor_note: 'You know what you did.',
    atmosphere_config: {},
  },
  {
    slug: 'system-addict',
    badge: 'TRENDING',
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 73,
    editor_note: 'Stat screens and level-up dopamine.',
    atmosphere_config: {},
  },
  {
    slug: 'emotional-damage',
    badge: 'PEAK',
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 76,
    editor_note: 'Will make you cry in the shower.',
    atmosphere_config: {},
  },
  {
    slug: 'revenge-fantasy',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 85,
    editor_note: 'The satisfaction is immaculate.',
    atmosphere_config: {},
  },
  {
    slug: 'power-fantasy',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 80,
    editor_note: 'Overpowered and unapologetic.',
    atmosphere_config: {},
  },
  {
    slug: 'villainess-era',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 72,
    editor_note: 'Reincarnated as the villain, thriving anyway.',
    atmosphere_config: {},
  },
  {
    slug: 'necromancer-vibes',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 78,
    editor_note: 'Death is merely a suggestion.',
    atmosphere_config: {},
  },
  {
    slug: 'regression-loop',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 65,
    editor_note: 'Time loops and second chances.',
    atmosphere_config: {},
  },
  {
    slug: 'tower-climbing',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 68,
    editor_note: 'Floor by floor, getting dangerous.',
    atmosphere_config: {},
  },
  {
    slug: 'art-god',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 62,
    editor_note: 'Visual masterpieces that justify the medium.',
    atmosphere_config: {},
  },
  {
    slug: 'manipulator-mc',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 58,
    editor_note: 'Chess masters playing 4D chess.',
    atmosphere_config: {},
  },
  {
    slug: 'comfy-sol',
    badge: null,
    featured_priority: 0,
    featured_slot: null,
    popularity_score: 70,
    editor_note: 'Warmth for the weary reader.',
    atmosphere_config: { particleIntensity: 0.3, glowStrength: 'soft', overlayOpacity: 0.10, animationIntensity: 'gentle' },
  },
];

// ── Collage covers ────────────────────────────────────────────
// Maps mood slug → [title slugs in display order]

const COLLAGE_MAP = {
  'aura-farming':            ['solo-leveling', 'omniscient-reader', 'tower-of-god', 'return-mount-hua', 'nano-machine'],
  'brainrot':                ['trash-counts-family', 'eleceed', 'lookism', 'blue-lock'],
  'depression-arc':          ['berserk', 'vagabond', 'frieren-beyond-journeys-end', 'vinland-saga'],
  'murim-addiction':         ['return-mount-hua', 'nano-machine', 'murim-login', 'volcanic-age'],
  'guilty-trash':            ['martial-peak', 'against-the-gods', 'sword-art-online'],
  'system-addict':           ['solo-leveling', 'tutorial-too-hard', 'skeleton-soldier', 's-classes-i-raised'],
  'emotional-damage':        ['omniscient-reader', 'fullmetal-alchemist', 'dungeon-meshi'],
  'revenge-fantasy':         ['villainess-reverses-hourglass', 'weak-hero', 'skeleton-soldier'],
  'power-fantasy':           ['solo-leveling', 'second-life-ranker', 'the-beginning-after-the-end', 'overgeared'],
  'villainess-era':          ['villainess-reverses-hourglass', 'remarried-empress', 'who-made-me-princess', 'beware-of-the-villainess'],
  'necromancer-vibes':       ['skeleton-soldier', 'overlord', 'solo-leveling'],
  'regression-loop':         ['returners-magic-special', 'reincarnation-suicidal-battle-god', 'tales-demons-gods'],
  'tower-climbing':          ['tower-of-god', 'tutorial-too-hard', 'dungeon-reset'],
  'art-god':                 ['vagabond', 'berserk', 'dungeon-meshi'],
  'manipulator-mc':          ['omniscient-reader', 'classroom-of-the-elite', 'eminence-in-shadow'],
  'comfy-sol':               ['spy-x-family', 'dungeon-meshi', 'peerless-dad'],
};

// ── Minimum mood→title associations ──────────────────────────
// Ensures every mood has ≥4 titles for collage fallback
// Maps mood slug → fallback title slugs (added only if count < 4)

const MOOD_TITLE_FALLBACKS = {
  'aura-farming':      ['solo-leveling', 'omniscient-reader', 'tower-of-god', 'return-mount-hua', 'nano-machine', 'second-life-ranker'],
  'brainrot':          ['eleceed', 'lookism', 'unordinary', 'mercenary-enrollment'],
  'depression-arc':    ['vagabond', 'vinland-saga', 'omniscient-reader', 'berserk'],
  'murim-addiction':   ['return-mount-hua', 'nano-machine', 'murim-login', 'volcanic-age', 'absolute-sword-sense'],
  'guilty-trash':      ['martial-peak', 'noblesse', 'hardcore-leveling-warrior', 'god-of-high-school'],
  'system-addict':     ['solo-leveling', 'second-life-ranker', 'overgeared', 'skeleton-soldier', 'the-beginning-after-the-end'],
  'emotional-damage':  ['omniscient-reader', 'tower-of-god', 'vinland-saga', 'reincarnation-suicidal-battle-god'],
  'revenge-fantasy':   ['weak-hero', 'villain-to-kill', 'mercenary-enrollment', 'second-life-ranker'],
  'power-fantasy':     ['solo-leveling', 'second-life-ranker', 'the-beginning-after-the-end', 'overgeared', 'nano-machine'],
  'villainess-era':    ['lore-olympus', 'i-love-yoo', 'true-beauty', 'noblesse'],
  'necromancer-vibes': ['solo-leveling', 'overlord', 'descent-demon-master', 'skeleton-soldier'],
  'regression-loop':   ['reincarnation-suicidal-battle-god', 'second-life-ranker', 'solo-leveling', 'return-mount-hua'],
  'tower-climbing':    ['tower-of-god', 'solo-leveling', 'god-of-high-school', 'hardcore-leveling-warrior'],
  'art-god':           ['vagabond', 'omniscient-reader', 'tower-of-god', 'lore-olympus'],
  'manipulator-mc':    ['omniscient-reader', 'solo-leveling', 'unordinary', 'villain-to-kill'],
  'comfy-sol':         ['true-beauty', 'i-love-yoo', 'lore-olympus', 'eleceed'],
};

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('🎨 Seeding vibe discovery metadata…\n');

  // 1. Update moods
  console.log('Step 1: Updating mood metadata…');
  for (const meta of MOOD_META) {
    const { error } = await supabase
      .from('moods')
      .update({
        badge: meta.badge,
        featured_priority: meta.featured_priority,
        featured_slot: meta.featured_slot,
        popularity_score: meta.popularity_score,
        editor_note: meta.editor_note,
        atmosphere_config: meta.atmosphere_config,
      })
      .eq('slug', meta.slug);

    if (error) {
      console.error(`  ✗ ${meta.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${meta.slug}`);
    }
  }

  // 2. Fetch all mood IDs
  console.log('\nStep 2: Fetching mood IDs…');
  const { data: moodRows, error: moodErr } = await supabase
    .from('moods')
    .select('id, slug');
  if (moodErr) { console.error(moodErr.message); process.exit(1); }
  const moodIdMap = Object.fromEntries(moodRows.map((r) => [r.slug, r.id]));

  // 3. Fetch all title IDs
  console.log('Step 3: Fetching title IDs…');
  const { data: titleRows, error: titleErr } = await supabase
    .from('titles')
    .select('id, slug');
  if (titleErr) { console.error(titleErr.message); process.exit(1); }
  const titleIdMap = Object.fromEntries(titleRows.map((r) => [r.slug, r.id]));

  // 4. Insert mood_collage_covers
  console.log('\nStep 4: Inserting mood_collage_covers…');
  for (const [moodSlug, titleSlugs] of Object.entries(COLLAGE_MAP)) {
    const moodId = moodIdMap[moodSlug];
    if (!moodId) { console.log(`  ⚠ mood not found: ${moodSlug}`); continue; }

    for (let pos = 0; pos < titleSlugs.length; pos++) {
      const titleSlug = titleSlugs[pos];
      const titleId = titleIdMap[titleSlug];
      if (!titleId) continue; // title not seeded yet — skip silently

      const { error } = await supabase
        .from('mood_collage_covers')
        .upsert(
          { mood_id: moodId, title_id: titleId, position: pos },
          { onConflict: 'mood_id,title_id' },
        );

      if (error) console.error(`  ✗ collage ${moodSlug}/${titleSlug}: ${error.message}`);
    }
    console.log(`  ✓ ${moodSlug} (${titleSlugs.length} covers)`);
  }

  // 5. Ensure title_moods minimum associations
  console.log('\nStep 5: Ensuring minimum mood→title associations…');
  for (const [moodSlug, titleSlugs] of Object.entries(MOOD_TITLE_FALLBACKS)) {
    const moodId = moodIdMap[moodSlug];
    if (!moodId) continue;

    // Check current count
    const { count } = await supabase
      .from('title_moods')
      .select('*', { count: 'exact', head: true })
      .eq('mood_id', moodId);

    if ((count ?? 0) >= 4) {
      console.log(`  ✓ ${moodSlug} already has ${count} titles`);
      continue;
    }

    // Insert missing associations
    let added = 0;
    for (const titleSlug of titleSlugs) {
      const titleId = titleIdMap[titleSlug];
      if (!titleId) continue;

      const { error } = await supabase
        .from('title_moods')
        .upsert(
          { mood_id: moodId, title_id: titleId },
          { onConflict: 'mood_id,title_id' },
        );

      if (!error) added++;
      if (added + (count ?? 0) >= 6) break;
    }
    console.log(`  ✓ ${moodSlug}: added ${added} associations (total now ~${(count ?? 0) + added})`);
  }

  console.log('\n✅ Vibe metadata seeding complete!');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
