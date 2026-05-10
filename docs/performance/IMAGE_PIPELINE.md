# Image Pipeline — Comic Curated

## Overview

The image pipeline handles the entire lifecycle of visual assets: from source input through processing, optimization, storage, and delivery. Given the image-heavy nature of this project (300-500+ cover images), this pipeline is critical infrastructure.

---

## Folder Structure

```
/public/
├── images/
│   ├── covers/
│   │   ├── {slug}-320w.avif
│   │   ├── {slug}-320w.webp
│   │   ├── {slug}-640w.avif
│   │   ├── {slug}-640w.webp
│   │   ├── {slug}-1200w.avif
│   │   ├── {slug}-1200w.webp
│   │   └── {slug}-blur.txt          (base64 LQIP)
│   ├── banners/
│   │   ├── {slug}-768w.avif
│   │   ├── {slug}-1200w.avif
│   │   ├── {slug}-1920w.avif
│   │   └── {slug}-blur.txt
│   ├── badges/
│   │   ├── {badge-name}.svg
│   │   └── {badge-name}-glow.svg
│   ├── ui/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   ├── og-image.jpg
│   │   └── patterns/
│   │       ├── noise.png
│   │       └── grid.svg
│   └── placeholders/
│       ├── cover-placeholder.svg
│       └── banner-placeholder.svg
├── fonts/
│   ├── dm-sans/
│   ├── datatype/
│   ├── playfair-display/
│   ├── jetbrains-mono/
│   └── caveat/
```

### Source Assets (Not in /public/)
```
/assets/
├── source-covers/          (original high-res covers)
│   └── {slug}.{jpg|png|webp}
├── source-banners/         (original banner images)
│   └── {slug}.{jpg|png}
└── source-badges/          (badge source files)
    └── {badge-name}.svg
```

---

## Image Processing Pipeline (Sharp)

### Processing Script Architecture
```javascript
// scripts/process-images.js
// Run: node scripts/process-images.js

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const COVER_SIZES = [320, 480, 640, 1200];
const BANNER_SIZES = [768, 1200, 1920];
const FORMATS = ['avif', 'webp'];
const QUALITY = { avif: 65, webp: 75 };
```

### Cover Processing
```
Input: /assets/source-covers/{slug}.jpg (any size)
Output for each cover:
  ├── /public/images/covers/{slug}-320w.avif   (card thumbnail)
  ├── /public/images/covers/{slug}-320w.webp
  ├── /public/images/covers/{slug}-480w.avif   (mobile detail)
  ├── /public/images/covers/{slug}-480w.webp
  ├── /public/images/covers/{slug}-640w.avif   (tablet/desktop card)
  ├── /public/images/covers/{slug}-640w.webp
  ├── /public/images/covers/{slug}-1200w.avif  (detail hero)
  ├── /public/images/covers/{slug}-1200w.webp
  └── /public/images/covers/{slug}-blur.txt    (base64 LQIP)
```

### Processing Steps per Image
```
1. Read source image
2. Extract metadata (width, height, dominant color)
3. For each target size:
   a. Resize (maintaining aspect ratio, cover fit)
   b. For each format (AVIF, WebP):
      - Encode with target quality
      - Write to output directory
4. Generate LQIP:
   a. Resize to 20px width
   b. Apply Gaussian blur (sigma: 3)
   c. Encode as JPEG quality 30
   d. Convert to base64
   e. Write to {slug}-blur.txt
5. Generate metadata JSON:
   a. Dominant color (for placeholder background)
   b. Aspect ratio
   c. File sizes per variant
   d. Write to {slug}-meta.json
```

### Sharp Processing Code Pattern
```javascript
async function processCover(inputPath, slug) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Extract dominant color
  const { dominant } = await image.stats();
  const dominantColor = `rgb(${dominant.r},${dominant.g},${dominant.b})`;
  
  // Generate responsive sizes
  for (const width of COVER_SIZES) {
    for (const format of FORMATS) {
      await image
        .clone()
        .resize(width, null, { fit: 'cover' })
        [format]({ quality: QUALITY[format] })
        .toFile(`public/images/covers/${slug}-${width}w.${format}`);
    }
  }
  
  // Generate LQIP
  const blurBuffer = await image
    .clone()
    .resize(20)
    .blur(3)
    .jpeg({ quality: 30 })
    .toBuffer();
  
  const blurBase64 = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
  fs.writeFileSync(`public/images/covers/${slug}-blur.txt`, blurBase64);
  
  // Generate metadata
  const meta = {
    dominantColor,
    aspectRatio: metadata.width / metadata.height,
    originalSize: { width: metadata.width, height: metadata.height },
  };
  fs.writeFileSync(
    `public/images/covers/${slug}-meta.json`, 
    JSON.stringify(meta)
  );
}
```

---

## Placeholder Generation (Development)

During development, use generated placeholder images instead of real copyrighted covers.

### ImageMagick Placeholder Generation
```bash
# Generate a colored placeholder with text overlay
magick -size 640x960 \
  xc:"#1a1a2e" \
  -fill "#e94560" \
  -font "DM-Sans" \
  -pointsize 32 \
  -gravity center \
  -annotate 0 "Title Name\n640x960" \
  placeholder-cover.jpg

# Batch generate with random colors
for i in $(seq 1 50); do
  COLOR=$(printf '#%06X' $((RANDOM * RANDOM % 16777216)))
  magick -size 640x960 \
    xc:"$COLOR" \
    -fill white \
    -font "DM-Sans" \
    -pointsize 24 \
    -gravity center \
    -annotate 0 "Title $i" \
    "placeholders/cover-$i.jpg"
done
```

### Sharp Placeholder Generation (Node.js)
```javascript
// scripts/generate-placeholders.js
const sharp = require('sharp');

const COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#f38181', '#fce38a', '#95e1d3',
  '#aa96da', '#fcbad3', '#a8d8ea', '#3d5a80',
];

async function generatePlaceholder(index, title) {
  const color = COLORS[index % COLORS.length];
  const width = 640;
  const height = 960; // Standard manhwa cover ratio (2:3)
  
  // Create colored rectangle with SVG text overlay
  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="45%" text-anchor="middle" 
            fill="white" font-size="28" font-family="sans-serif">
        ${title}
      </text>
      <text x="50%" y="55%" text-anchor="middle" 
            fill="rgba(255,255,255,0.5)" font-size="18" font-family="sans-serif">
        ${width}×${height}
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 80 })
    .toFile(`assets/source-covers/placeholder-${index}.jpg`);
}

// Generate 50 placeholders
const titles = [
  'Solo Leveling', 'Tower of God', 'Omniscient Reader',
  'Return of the Mount Hua Sect', 'Nano Machine',
  // ... more placeholder titles
];

titles.forEach((title, i) => generatePlaceholder(i, title));
```

### Placeholder Aspect Ratios
```
Manhwa covers:    2:3 (640×960)   — Most common
Manga covers:     7:10 (700×1000) — Japanese standard
Banner/hero:      21:9 (1920×823) — Cinematic widescreen
Square badges:    1:1 (256×256)   — Achievement icons
OG image:         1.91:1 (1200×630) — Social sharing
```

---

## Responsive Image Component

### Next.js Image Component Usage
```jsx
// For cover images in cards
<Image
  src={`/images/covers/${slug}-640w.avif`}
  alt={title}
  width={640}
  height={960}
  placeholder="blur"
  blurDataURL={blurBase64}
  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  quality={80}
  loading="lazy"
/>

// For hero/banner images
<Image
  src={`/images/banners/${slug}-1920w.avif`}
  alt={title}
  fill
  placeholder="blur"
  blurDataURL={blurBase64}
  sizes="100vw"
  quality={85}
  priority // Above fold — preload
  className="object-cover"
/>
```

### Custom Image Component with Blur-Up
```jsx
const CoverImage = ({ slug, title, priority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const meta = useCoverMeta(slug); // Loads from meta.json
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{ 
        aspectRatio: meta?.aspectRatio || '2/3',
        backgroundColor: meta?.dominantColor || '#1a1a2e'
      }}
    >
      {/* Blur placeholder */}
      <div 
        className={cn(
          "absolute inset-0 scale-110 blur-xl transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100"
        )}
        style={{ backgroundImage: `url(${meta?.blurDataURL})`, backgroundSize: 'cover' }}
      />
      
      {/* Full image */}
      <Image
        src={`/images/covers/${slug}-640w.avif`}
        alt={title}
        fill
        className={cn(
          "object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        priority={priority}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </div>
  );
};
```

---

## CDN & Delivery Strategy

### Supabase Storage Structure
```
Bucket: comic-curated-images
├── covers/
│   ├── {slug}/
│   │   ├── original.jpg
│   │   ├── 320w.avif
│   │   ├── 640w.avif
│   │   ├── 1200w.avif
│   │   └── blur.txt
├── banners/
├── badges/
└── user-uploads/
```

### CDN Headers
```
Cache-Control: public, max-age=31536000, immutable
Content-Type: image/avif (or image/webp)
Vary: Accept (for format negotiation)
```

### Image URL Pattern
```
Development:  /images/covers/{slug}-{size}w.{format}
Production:   https://cdn.comic-curated.com/covers/{slug}-{size}w.{format}
Supabase:     https://{project}.supabase.co/storage/v1/object/public/images/covers/{slug}/{size}w.{format}
```

---

## Optimization Metrics

### Target File Sizes
| Image Type | 320w | 480w | 640w | 1200w |
|------------|------|------|------|-------|
| Cover (AVIF) | 15-25KB | 25-40KB | 40-60KB | 80-120KB |
| Cover (WebP) | 20-35KB | 35-55KB | 55-80KB | 100-150KB |
| Banner (AVIF) | — | — | 60-100KB | 120-200KB |
| Blur (base64) | 200-500 bytes | — | — | — |

### Quality Settings
```javascript
const qualitySettings = {
  avif: {
    cover: 65,      // Good balance for illustrated content
    banner: 70,     // Slightly higher for large display
    blur: 30,       // Minimal quality for placeholder
  },
  webp: {
    cover: 75,
    banner: 80,
    blur: 30,
  },
  jpeg: {
    fallback: 80,   // Only for browsers without AVIF/WebP
  }
};
```

---

## Batch Processing Script

### Full Pipeline Command
```bash
# Process all source images
node scripts/process-images.js --all

# Process single image
node scripts/process-images.js --slug "solo-leveling"

# Generate placeholders for development
node scripts/generate-placeholders.js --count 50

# Audit image sizes
node scripts/audit-images.js

# Clean unused processed images
node scripts/clean-images.js
```

### Audit Script Output
```
Image Audit Report
==================
Total covers: 347
Total size (all variants): 89.2 MB
Average cover size (640w AVIF): 47KB ✅
Largest cover (640w AVIF): 92KB ⚠️ (solo-leveling)
Missing blur placeholders: 0 ✅
Missing AVIF variants: 0 ✅
Covers exceeding budget: 3 ⚠️
```

---

## Future Considerations

### AI-Powered Enhancements
- Auto-crop to focus on character faces
- Dominant color extraction for dynamic theming
- Content-aware resizing for different aspect ratios
- Auto-generate artistic blur/bokeh backgrounds from covers

### Video Thumbnails
- Animated WebP for "preview on hover" effect
- Short 2-3 second loops from key art
- Generated from static images with Ken Burns effect

### User-Uploaded Content
- Client-side compression before upload
- Server-side validation and re-processing
- Automatic format conversion
- Size limit enforcement (5MB source max)
