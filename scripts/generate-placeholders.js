#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// ============================================================
// Placeholder Image Generator
// Source of truth: docs/performance/IMAGE_PIPELINE.md
//
// Generates development placeholder cover images using Sharp.
// Run: node scripts/generate-placeholders.js
//
// Output: public/images/covers/{slug}-{size}w.{format}
//         public/images/covers/{slug}-blur.txt
//
// This is a Node.js CommonJS script — require() is intentional.
// ============================================================

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ── Config ────────────────────────────────────────────────────

const COVER_SIZES = [320, 480, 640, 1200];
const FORMATS = ['avif', 'webp'];
const QUALITY = { avif: 65, webp: 75 };

// Manhwa cover ratio: 2:3
const COVER_WIDTH = 640;
const COVER_HEIGHT = 960;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'covers');

// Brand-adjacent placeholder colors
const COLORS = [
  { bg: '#1a1a2e', accent: '#8b5cf6' },
  { bg: '#0f0f1a', accent: '#ec4899' },
  { bg: '#16213e', accent: '#06b6d4' },
  { bg: '#0d0d1a', accent: '#f59e0b' },
  { bg: '#1a0a2e', accent: '#e040fb' },
  { bg: '#0a1628', accent: '#3b82f6' },
  { bg: '#1a1a0a', accent: '#10b981' },
  { bg: '#2a0a1a', accent: '#ef4444' },
];

// Sample placeholder titles
const PLACEHOLDER_TITLES = [
  { slug: 'solo-leveling', title: 'Solo Leveling', origin: 'Manhwa' },
  { slug: 'tower-of-god', title: 'Tower of God', origin: 'Manhwa' },
  { slug: 'omniscient-reader', title: 'Omniscient Reader', origin: 'Manhwa' },
  { slug: 'return-mount-hua', title: 'Return of the Mount Hua Sect', origin: 'Manhwa' },
  { slug: 'nano-machine', title: 'Nano Machine', origin: 'Manhwa' },
  { slug: 'second-life-ranker', title: 'Second Life Ranker', origin: 'Manhwa' },
  { slug: 'the-beginning-after-the-end', title: 'The Beginning After the End', origin: 'Manhwa' },
  { slug: 'overgeared', title: 'Overgeared', origin: 'Manhwa' },
];

// ── Helpers ───────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createPlaceholderSVG(title, origin, color, width, height) {
  const fontSize = Math.max(14, Math.floor(width / 20));
  const subFontSize = Math.max(10, Math.floor(width / 30));

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
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <!-- Decorative accent bar -->
      <rect x="0" y="${height - 4}" width="100%" height="4" fill="url(#accent)"/>
      <!-- Corner accent -->
      <rect x="0" y="0" width="4" height="${height}" fill="${color.accent}44"/>
      <!-- Title text -->
      <text
        x="50%"
        y="45%"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#f0f0f5"
        font-size="${fontSize}"
        font-family="system-ui, sans-serif"
        font-weight="600"
      >${title}</text>
      <!-- Origin label -->
      <text
        x="50%"
        y="58%"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="${color.accent}"
        font-size="${subFontSize}"
        font-family="system-ui, sans-serif"
        font-weight="400"
        letter-spacing="2"
      >${origin.toUpperCase()}</text>
      <!-- Size label (dev only) -->
      <text
        x="50%"
        y="90%"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#6b6b8088"
        font-size="${Math.max(8, subFontSize - 2)}"
        font-family="monospace"
      >${width}×${height}</text>
    </svg>
  `);
}

// ── Main ──────────────────────────────────────────────────────

async function generatePlaceholder(titleData, colorIndex) {
  const { slug, title, origin } = titleData;
  const color = COLORS[colorIndex % COLORS.length];

  console.log(`  Generating: ${slug}`);

  for (const width of COVER_SIZES) {
    const height = Math.round(width * (COVER_HEIGHT / COVER_WIDTH));
    const svg = createPlaceholderSVG(title, origin, color, width, height);

    for (const format of FORMATS) {
      const outputPath = path.join(OUTPUT_DIR, `${slug}-${width}w.${format}`);
      await sharp(svg)
        .resize(width, height)
        [format]({ quality: QUALITY[format] })
        .toFile(outputPath);
    }
  }

  // Generate blur placeholder (LQIP)
  const blurSvg = createPlaceholderSVG(title, origin, color, 20, 30);
  const blurBuffer = await sharp(blurSvg)
    .resize(20, 30)
    .blur(3)
    .jpeg({ quality: 30 })
    .toBuffer();

  const blurBase64 = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
  fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}-blur.txt`), blurBase64);

  // Generate metadata
  const meta = {
    dominantColor: color.bg,
    aspectRatio: COVER_WIDTH / COVER_HEIGHT,
    originalSize: { width: COVER_WIDTH, height: COVER_HEIGHT },
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${slug}-meta.json`),
    JSON.stringify(meta, null, 2),
  );
}

async function main() {
  console.log('🎨 Generating placeholder cover images...\n');
  ensureDir(OUTPUT_DIR);

  for (let i = 0; i < PLACEHOLDER_TITLES.length; i++) {
    await generatePlaceholder(PLACEHOLDER_TITLES[i], i);
  }

  console.log(`\n✅ Generated ${PLACEHOLDER_TITLES.length} placeholder covers`);
  console.log(`   Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('❌ Error generating placeholders:', err);
  process.exit(1);
});
