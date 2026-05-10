# Branding Direction — Comic Curated

## Brand Identity

### Brand Name: **Comic Curated**
A personal, curated collection — not a platform, not a service. The name communicates:
- **Comic** — the subject matter, direct and clear
- **Curated** — intentional selection, personal taste, quality over quantity

### Brand Personality
If Comic Curated were a person, they would be:
- A passionate reader who can talk about manhwa for hours
- Someone with impeccable visual taste
- Casually cool but deeply knowledgeable
- The friend who always has the perfect recommendation
- Unapologetically opinionated but never gatekeeping

### Brand Voice
- Casual but articulate
- Opinionated but welcoming
- Passionate without being cringe
- Humorous without trying too hard
- Uses internet culture naturally (not forced)

---

## Logo Direction

### Concept Directions

**Direction A: Manga Panel Frame**
- A stylized panel border (the rectangular frame from manga pages)
- Slightly broken/dynamic — one corner extends or breaks free
- Contains the "CC" monogram or a symbolic element
- Communicates: reading, comics, framing, curation

**Direction B: Bookmark / Page Turn**
- Abstract bookmark shape with a subtle page-turn curl
- Geometric, minimal, but with one dynamic element
- Can work as both full logo and favicon
- Communicates: reading, collecting, marking favorites

**Direction C: Eye / Lens**
- Stylized eye or lens shape (the curator's eye)
- Represents the act of seeing, judging, selecting
- Could incorporate a subtle star/sparkle for the "curated" aspect
- Communicates: perspective, taste, discovery

**Direction D: Constellation / Connected Dots**
- Abstract dots connected by lines (like a constellation)
- Represents the connections between titles, genres, moods
- Minimal, modern, slightly cosmic
- Communicates: collection, connection, discovery, universe

### Logo Requirements
- Works at 16×16 (favicon) through 200×200
- Legible in monochrome (white on dark)
- Has a glow/animated variant for the website
- Pairs well with the Datatype font family
- Feels premium, not corporate

### Temporary Placeholder
For development phase:
- Simple "CC" monogram in Datatype ExtraBold
- Gradient fill (brand accent colors)
- Circular container with subtle glow

---

## Color System

### Primary Palette
```
Background Deep:     #08080f   (near-black with blue undertone)
Background Mid:      #0f0f1a   (dark navy)
Background Surface:  #1a1a2e   (elevated surface)
Background Elevated: #252540   (cards, modals)
```

### Text Palette
```
Text Primary:        #f0f0f5   (warm white)
Text Secondary:      #a0a0b8   (muted lavender)
Text Tertiary:       #6b6b80   (subtle, metadata)
Text Accent:         #e0d0ff   (highlighted text)
```

### Accent Palette
```
Accent Primary:      #8b5cf6   (electric violet)
Accent Secondary:    #f59e0b   (warm gold)
Accent Tertiary:     #06b6d4   (electric cyan)
Accent Quaternary:   #ec4899   (hot pink)
```

### Semantic Colors
```
Success:             #10b981   (emerald)
Warning:             #f59e0b   (amber)
Danger:              #ef4444   (red)
Info:                #3b82f6   (blue)
```

### Tier Colors
```
SSS+:                #ffd700   (gold with glow)
S:                   #e040fb   (magenta)
A:                   #8b5cf6   (violet)
B:                   #3b82f6   (blue)
C:                   #6b7280   (grey)
D:                   #4b5563   (dark grey)
F:                   #ef4444   (red — ironic)
```

### Gradient Presets
```css
--gradient-hero: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #ec4899 100%);
--gradient-gold: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
--gradient-dark: linear-gradient(180deg, #08080f 0%, #1a1a2e 100%);
--gradient-surface: linear-gradient(135deg, #1a1a2e 0%, #252540 100%);
--gradient-text: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
```

---

## Iconography Direction

### Icon Style
- Line-based (not filled)
- 1.5-2px stroke weight
- Rounded caps and joins
- Slightly geometric
- Custom icons for key concepts (not generic library)

### Custom Icon Needs
| Concept | Icon Direction |
|---------|---------------|
| Reading | Open book with page turn |
| Completed | Checkmark with flourish |
| Dropped | Broken bookmark |
| Paused | Bookmark with pause symbol |
| Wishlist | Star with sparkle |
| Rating | Custom gauge/meter (not stars) |
| Tier | Shield with level indicator |
| Achievement | Hexagonal badge |
| Genre | Abstract mood shape |
| External link | Arrow breaking out of frame |

### Icon Animation
Key icons should have micro-animations:
- Logo: subtle pulse/glow on idle
- Navigation icons: morph on state change
- Achievement icons: sparkle on unlock
- Rating indicators: fill animation on reveal

---

## Imagery Direction

### Photography/Illustration Style
Since we can't use copyrighted manga art directly:
- Abstract atmospheric backgrounds (gradients, particles, noise)
- Geometric patterns inspired by manga panel layouts
- Subtle texture overlays (paper grain, halftone dots)
- Color washes that evoke manga/manhwa aesthetics

### Texture Library
```
- Paper grain (subtle, for editorial sections)
- Halftone dots (manga-inspired, for accents)
- Noise grain (cinematic, for backgrounds)
- Grid lines (panel-inspired, for structure)
- Speed lines (manga-inspired, for emphasis)
```

### Background Treatments
- Radial gradients with noise overlay
- Animated gradient meshes
- Particle fields (sparse, atmospheric)
- Geometric shapes with blur (bokeh-like)

---

## Motion Branding

### Signature Animations
The brand has recognizable motion signatures:

**The Reveal:** Content appears with a slight blur-to-sharp + upward drift. This is the brand's "hello."

**The Glow:** Accent elements pulse with a soft glow. This is the brand's "heartbeat."

**The Drift:** Background elements float with gentle, organic movement. This is the brand's "breathing."

**The Snap:** Interactive elements respond with a spring-physics snap. This is the brand's "personality."

### Loading Animation
- Brand monogram ("CC") with animated gradient fill
- Subtle pulse/breathe while loading
- Transitions smoothly into page content (not a separate screen)

---

## Social / OG Image Direction

### Open Graph Image Template
```
┌─────────────────────────────────────────┐
│                                         │
│  [Gradient Background]                  │
│                                         │
│     COMIC CURATED                       │
│     ─────────────                       │
│     [Page Title / Description]          │
│                                         │
│     [Subtle brand pattern]              │
│                                         │
└─────────────────────────────────────────┘
```

- Size: 1200×630px
- Dark background with brand gradient
- Logo + page-specific text
- Consistent template across all pages
- Generated dynamically via Edge Function or at build time

### Favicon Set
```
favicon.ico          (16×16, 32×32 multi-size)
apple-touch-icon.png (180×180)
icon-192.png         (192×192, PWA)
icon-512.png         (512×512, PWA)
```

---

## Future Branding Evolution

### Phase 1 (MVP)
- Placeholder logo (CC monogram)
- Core color palette established
- Basic icon set (Phosphor or Remix icons customized)
- Gradient backgrounds

### Phase 2 (Polish)
- Custom logo designed
- Custom icon set for key concepts
- Animated logo variant
- OG image generation system
- Texture library created

### Phase 3 (Premium)
- Full motion branding system
- Custom cursor design
- Sound design (subtle audio branding)
- Seasonal theme variants (dark mode variations)
- Merchandise-ready brand assets

---

## Brand Guidelines Summary

### Do
- Use dark backgrounds with vibrant accents
- Let content breathe with generous spacing
- Use gradients for emphasis and hierarchy
- Maintain the cinematic, premium feeling
- Keep text warm (not pure white)
- Use glow effects sparingly for emphasis

### Don't
- Use pure white (#fff) backgrounds
- Use generic stock imagery
- Use more than 2 accent colors simultaneously
- Make the brand feel corporate or sterile
- Use harsh, high-contrast color combinations
- Overuse glow effects (they lose impact)
