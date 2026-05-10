#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// ============================================================
// Placeholder Image Generator — covers all 100 seeded titles
// Run: node scripts/generate-placeholders.js
// ============================================================

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const COVER_SIZES = [320, 480, 640, 1200];
const FORMATS = ['avif', 'webp'];
const QUALITY = { avif: 65, webp: 75 };
const COVER_WIDTH = 640;
const COVER_HEIGHT = 960;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'covers');

const COLORS = [
  { bg: '#1a1a2e', accent: '#8b5cf6' },
  { bg: '#0f0f1a', accent: '#ec4899' },
  { bg: '#16213e', accent: '#06b6d4' },
  { bg: '#0d0d1a', accent: '#f59e0b' },
  { bg: '#1a0a2e', accent: '#e040fb' },
  { bg: '#0a1628', accent: '#3b82f6' },
  { bg: '#1a1a0a', accent: '#10b981' },
  { bg: '#2a0a1a', accent: '#ef4444' },
  { bg: '#0a1a1a', accent: '#06b6d4' },
  { bg: '#1a0a0a', accent: '#f97316' },
  { bg: '#0a0a1a', accent: '#a855f7' },
  { bg: '#1a1a10', accent: '#84cc16' },
];

// All 100 seeded titles
const ALL_TITLES = [
  // Manhwa — featured (have real placeholder images already)
  { slug: 'solo-leveling',                  title: 'Solo Leveling',                          origin: 'Manhwa' },
  { slug: 'tower-of-god',                   title: 'Tower of God',                           origin: 'Manhwa' },
  { slug: 'omniscient-reader',              title: 'Omniscient Reader',                      origin: 'Manhwa' },
  { slug: 'return-mount-hua',               title: 'Return of the Mount Hua Sect',           origin: 'Manhwa' },
  { slug: 'nano-machine',                   title: 'Nano Machine',                           origin: 'Manhwa' },
  { slug: 'second-life-ranker',             title: 'Second Life Ranker',                     origin: 'Manhwa' },
  { slug: 'the-beginning-after-the-end',   title: 'The Beginning After the End',            origin: 'Manhwa' },
  { slug: 'overgeared',                     title: 'Overgeared',                             origin: 'Manhwa' },
  // Manhwa — non-featured
  { slug: 'murim-login',                    title: 'Murim Login',                            origin: 'Manhwa' },
  { slug: 'eleceed',                        title: 'Eleceed',                                origin: 'Manhwa' },
  { slug: 'lookism',                        title: 'Lookism',                                origin: 'Manhwa' },
  { slug: 'true-beauty',                    title: 'True Beauty',                            origin: 'Manhwa' },
  { slug: 'weak-hero',                      title: 'Weak Hero',                              origin: 'Manhwa' },
  { slug: 'god-of-high-school',             title: 'The God of High School',                 origin: 'Manhwa' },
  { slug: 'noblesse',                       title: 'Noblesse',                               origin: 'Manhwa' },
  { slug: 'hardcore-leveling-warrior',      title: 'Hardcore Leveling Warrior',              origin: 'Manhwa' },
  { slug: 'unordinary',                     title: 'Unordinary',                             origin: 'Manhwa' },
  { slug: 'villain-to-kill',                title: 'Villain to Kill',                        origin: 'Manhwa' },
  { slug: 'mercenary-enrollment',           title: 'Mercenary Enrollment',                   origin: 'Manhwa' },
  { slug: 'reaper-drifting-moon',           title: 'Reaper of the Drifting Moon',            origin: 'Manhwa' },
  { slug: 'volcanic-age',                   title: 'Volcanic Age',                           origin: 'Manhwa' },
  { slug: 'absolute-sword-sense',           title: 'Absolute Sword Sense',                   origin: 'Manhwa' },
  { slug: 'descent-demon-master',           title: 'Descent of the Demon Master',            origin: 'Manhwa' },
  { slug: 'heavenly-demon-reborn',          title: 'Heavenly Demon Reborn',                  origin: 'Manhwa' },
  { slug: 'infinite-leveling-murim',        title: 'Infinite Leveling Murim',                origin: 'Manhwa' },
  // Manhua
  { slug: 'martial-peak',                   title: 'Martial Peak',                           origin: 'Manhua' },
  { slug: 'battle-through-heavens',         title: 'Battle Through the Heavens',             origin: 'Manhua' },
  { slug: 'apotheosis',                     title: 'Apotheosis',                             origin: 'Manhua' },
  { slug: 'tales-demons-gods',              title: 'Tales of Demons and Gods',               origin: 'Manhua' },
  { slug: 'peerless-dad',                   title: 'Peerless Dad',                           origin: 'Manhua' },
  { slug: 'against-the-gods',               title: 'Against the Gods',                       origin: 'Manhua' },
  { slug: 'chaotic-sword-god',              title: 'Chaotic Sword God',                      origin: 'Manhua' },
  { slug: 'rebirth-urban-immortal',         title: 'Rebirth of the Urban Immortal',          origin: 'Manhua' },
  { slug: 'versatile-mage',                 title: 'Versatile Mage',                         origin: 'Manhua' },
  { slug: 'legendary-mechanic',             title: 'The Legendary Mechanic',                 origin: 'Manhua' },
  { slug: 'demons-diary',                   title: 'Demon Diary',                            origin: 'Manhua' },
  { slug: 'stellar-transformation',         title: 'Stellar Transformation',                 origin: 'Manhua' },
  { slug: 'coiling-dragon',                 title: 'Coiling Dragon',                         origin: 'Manhua' },
  { slug: 'desolate-era',                   title: 'Desolate Era',                           origin: 'Manhua' },
  { slug: 'i-shall-seal-heavens',           title: 'I Shall Seal the Heavens',               origin: 'Manhua' },
  // Manga
  { slug: 'one-piece',                      title: 'One Piece',                              origin: 'Manga' },
  { slug: 'berserk',                        title: 'Berserk',                                origin: 'Manga' },
  { slug: 'vagabond',                       title: 'Vagabond',                               origin: 'Manga' },
  { slug: 'vinland-saga',                   title: 'Vinland Saga',                           origin: 'Manga' },
  { slug: 'fullmetal-alchemist',            title: 'Fullmetal Alchemist',                    origin: 'Manga' },
  { slug: 'hunter-x-hunter',               title: 'Hunter x Hunter',                        origin: 'Manga' },
  { slug: 'demon-slayer',                   title: 'Demon Slayer',                           origin: 'Manga' },
  { slug: 'jujutsu-kaisen',                 title: 'Jujutsu Kaisen',                         origin: 'Manga' },
  { slug: 'chainsaw-man',                   title: 'Chainsaw Man',                           origin: 'Manga' },
  { slug: 'spy-x-family',                   title: 'Spy x Family',                           origin: 'Manga' },
  { slug: 'blue-lock',                      title: 'Blue Lock',                              origin: 'Manga' },
  { slug: 'kaiju-no-8',                     title: 'Kaiju No. 8',                            origin: 'Manga' },
  { slug: 'dungeon-meshi',                  title: 'Dungeon Meshi',                          origin: 'Manga' },
  { slug: 'frieren-beyond-journeys-end',    title: 'Frieren Beyond Journey End',             origin: 'Manga' },
  { slug: 'oshi-no-ko',                     title: 'Oshi no Ko',                             origin: 'Manga' },
  { slug: 'mushoku-tensei',                 title: 'Mushoku Tensei',                         origin: 'Manga' },
  { slug: 'slime-reincarnation',            title: 'That Time I Got Reincarnated as a Slime',origin: 'Manga' },
  { slug: 'overlord',                       title: 'Overlord',                               origin: 'Manga' },
  { slug: 're-zero',                        title: 'Re Zero',                                origin: 'Manga' },
  { slug: 'eminence-in-shadow',             title: 'The Eminence in Shadow',                 origin: 'Manga' },
  { slug: 'classroom-of-the-elite',         title: 'Classroom of the Elite',                 origin: 'Manga' },
  { slug: 'villainess-level-99',            title: 'Villainess Level 99',                    origin: 'Manga' },
  { slug: 'villainess-taming-final-boss',   title: 'Villainess Taming the Final Boss',       origin: 'Manga' },
  { slug: 'my-next-life-villainess',        title: 'My Next Life as a Villainess',           origin: 'Manga' },
  { slug: 'reincarnated-as-sword',          title: 'Reincarnated as the Sword',              origin: 'Manga' },
  { slug: 'tensei-slime',                   title: 'Tensei Shitara Slime Datta Ken',         origin: 'Manga' },
  { slug: 'sword-art-online',               title: 'Sword Art Online',                       origin: 'Manga' },
  { slug: 'no-game-no-life',                title: 'No Game No Life',                        origin: 'Manga' },
  { slug: 'konosuba',                       title: 'Konosuba',                               origin: 'Manga' },
  // Manhwa — villainess / romance / regression
  { slug: 'villainess-reverses-hourglass',  title: 'The Villainess Reverses the Hourglass',  origin: 'Manhwa' },
  { slug: 'beware-of-the-villainess',       title: 'Beware of the Villainess',               origin: 'Manhwa' },
  { slug: 'abandoned-empress',              title: 'The Abandoned Empress',                  origin: 'Manhwa' },
  { slug: 'who-made-me-princess',           title: 'Who Made Me a Princess',                 origin: 'Manhwa' },
  { slug: 'raeliana-dukes-mansion',         title: 'Raeliana at the Dukes Mansion',          origin: 'Manhwa' },
  { slug: 'remarried-empress',              title: 'Remarried Empress',                      origin: 'Manhwa' },
  { slug: 'doctor-elise',                   title: 'Doctor Elise',                           origin: 'Manhwa' },
  { slug: 'empress-another-world',          title: 'Empress of Another World',               origin: 'Manhwa' },
  { slug: 'duchess-empty-soul',             title: 'The Duchess with an Empty Soul',         origin: 'Manhwa' },
  { slug: 'villain-mother',                 title: 'I Became the Villains Mother',           origin: 'Manhwa' },
  { slug: 'tyrant-tranquilizer',            title: 'The Tyrants Tranquilizer',               origin: 'Manhwa' },
  { slug: 'omniscient-readers-viewpoint',   title: 'Omniscient Readers Viewpoint',           origin: 'Manhwa' },
  { slug: 'returners-magic-special',        title: 'A Returners Magic Should Be Special',    origin: 'Manhwa' },
  { slug: 'max-level-hero-returned',        title: 'The Max Level Hero Has Returned',        origin: 'Manhwa' },
  { slug: 'dungeon-reset',                  title: 'Dungeon Reset',                          origin: 'Manhwa' },
  { slug: 'tutorial-too-hard',              title: 'The Tutorial Is Too Hard',               origin: 'Manhwa' },
  { slug: 'skeleton-soldier',               title: 'Skeleton Soldier',                       origin: 'Manhwa' },
  { slug: 'trash-counts-family',            title: 'Trash of the Counts Family',             origin: 'Manhwa' },
  { slug: 'novels-extra',                   title: 'The Novels Extra',                       origin: 'Manhwa' },
  { slug: 'regressor-instruction-manual',   title: 'Regressor Instruction Manual',           origin: 'Manhwa' },
  { slug: 's-classes-i-raised',             title: 'The S-Classes That I Raised',            origin: 'Manhwa' },
  { slug: 'sword-prodigy',                  title: 'Sword Prodigy',                          origin: 'Manhwa' },
  { slug: 'reincarnation-suicidal-battle-god', title: 'Reincarnation of the Suicidal Battle God', origin: 'Manhwa' },
  { slug: 'chronicles-martial-god-return',  title: 'Chronicles of the Martial Gods Return',  origin: 'Manhwa' },
  { slug: 'fist-demon-mount-hua',           title: 'Fist Demon of Mount Hua',                origin: 'Manhwa' },
  { slug: 'i-love-yoo',                     title: 'I Love Yoo',                             origin: 'Manhwa' },
  { slug: 'lore-olympus',                   title: 'Lore Olympus',                           origin: 'Manhwa' },
  { slug: 'regression-instruction-manual',  title: 'Regression Instruction Manual',          origin: 'Manhwa' },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createPlaceholderSVG(title, origin, color, width, height) {
  const fontSize = Math.max(12, Math.floor(width / 22));
  const subFontSize = Math.max(9, Math.floor(width / 32));
  // Truncate long titles for display
  const displayTitle = title.length > 22 ? title.slice(0, 20) + '…' : title;

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.accent}22;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${color.accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.accent}88;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect x="0" y="${height - 4}" width="100%" height="4" fill="url(#accent)"/>
      <rect x="0" y="0" width="4" height="${height}" fill="${color.accent}44"/>
      <text
        x="50%"
        y="45%"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#f0f0f5"
        font-size="${fontSize}"
        font-family="system-ui, sans-serif"
        font-weight="600"
      >${displayTitle}</text>
      <text
        x="50%"
        y="60%"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="${color.accent}"
        font-size="${subFontSize}"
        font-family="system-ui, sans-serif"
        font-weight="400"
        letter-spacing="2"
      >${origin.toUpperCase()}</text>
    </svg>
  `);
}

async function generatePlaceholder(titleData, colorIndex) {
  const { slug, title, origin } = titleData;
  const color = COLORS[colorIndex % COLORS.length];

  for (const width of COVER_SIZES) {
    const height = Math.round(width * (COVER_HEIGHT / COVER_WIDTH));
    const svg = createPlaceholderSVG(title, origin, color, width, height);

    for (const format of FORMATS) {
      const outputPath = path.join(OUTPUT_DIR, `${slug}-${width}w.${format}`);
      // Skip if already exists (don't overwrite)
      if (!fs.existsSync(outputPath)) {
        await sharp(svg)
          .resize(width, height)
          [format]({ quality: QUALITY[format] })
          .toFile(outputPath);
      }
    }
  }

  // Blur placeholder
  const blurPath = path.join(OUTPUT_DIR, `${slug}-blur.txt`);
  if (!fs.existsSync(blurPath)) {
    const blurSvg = createPlaceholderSVG(title, origin, color, 20, 30);
    const blurBuffer = await sharp(blurSvg)
      .resize(20, 30)
      .blur(3)
      .jpeg({ quality: 30 })
      .toBuffer();
    fs.writeFileSync(blurPath, `data:image/jpeg;base64,${blurBuffer.toString('base64')}`);
  }

  // Metadata
  const metaPath = path.join(OUTPUT_DIR, `${slug}-meta.json`);
  if (!fs.existsSync(metaPath)) {
    fs.writeFileSync(metaPath, JSON.stringify({
      dominantColor: color.bg,
      aspectRatio: COVER_WIDTH / COVER_HEIGHT,
      originalSize: { width: COVER_WIDTH, height: COVER_HEIGHT },
    }, null, 2));
  }
}

async function main() {
  console.log(`Generating placeholder covers for ${ALL_TITLES.length} titles...\n`);
  ensureDir(OUTPUT_DIR);

  let generated = 0;
  let skipped = 0;

  for (let i = 0; i < ALL_TITLES.length; i++) {
    const t = ALL_TITLES[i];
    const samplePath = path.join(OUTPUT_DIR, `${t.slug}-640w.avif`);
    if (fs.existsSync(samplePath)) {
      skipped++;
    } else {
      process.stdout.write(`\r  Generating: ${t.slug.padEnd(50)}`);
      await generatePlaceholder(t, i);
      generated++;
    }
  }

  console.log(`\n\nDone! Generated: ${generated} | Already existed: ${skipped}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('\nError:', err);
  process.exit(1);
});
