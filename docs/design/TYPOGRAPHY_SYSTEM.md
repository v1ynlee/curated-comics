# Typography System — Comic Curated

## Font Inventory Analysis

Based on locally available fonts, the following have been identified as candidates for the cinematic anime-inspired design direction.

---

## Available Local Fonts (Categorized)

### Display / Headline Candidates
| Font | Style | Suitability |
|------|-------|-------------|
| **Playfair Display** | Elegant serif, high contrast | ★★★★★ — Perfect for cinematic titles, dramatic headers |
| **Oswald** | Condensed sans, bold presence | ★★★★☆ — Strong for section headers, tier labels |
| **Datatype** (full family) | Geometric, variable width | ★★★★★ — Excellent for futuristic/tech-anime aesthetic |
| **Space Grotesk** | Geometric sans, modern | ★★★★☆ — Clean, slightly techy, good for UI elements |

### Body / Reading Candidates
| Font | Style | Suitability |
|------|-------|-------------|
| **DM Sans** (full family) | Clean geometric sans | ★★★★★ — Excellent readability, modern, versatile |
| **Inter** (full family) | Neutral, highly legible | ★★★★★ — Industry standard for UI, excellent at small sizes |
| **IBM Plex Sans** (full family) | Humanist, professional | ★★★★☆ — Slightly more character than Inter |
| **Open Sans** (full family) | Friendly, readable | ★★★☆☆ — Safe but less distinctive |
| **Roboto** (full family) | Android standard, clean | ★★★☆☆ — Ubiquitous, less unique |

### Accent / Decorative Candidates
| Font | Style | Suitability |
|------|-------|-------------|
| **Caveat** | Handwritten, casual | ★★★★☆ — Personal notes, annotations, casual reviews |
| **Datatype Condensed/Expanded** | Variable geometric | ★★★★★ — Dramatic labels, badges, tier names |
| **Ink Free** (system) | Casual handwriting | ★★★☆☆ — Backup for handwritten accents |

### Monospace / Code Candidates
| Font | Style | Suitability |
|------|-------|-------------|
| **JetBrains Mono** | Developer-focused mono | ★★★★★ — Stats, numbers, data displays |
| **Fira Code Nerd Font** | Ligature-rich mono | ★★★★☆ — Alternative for data |
| **Victor Mono** | Elegant cursive italics | ★★★★☆ — Unique italic style for quotes |
| **Source Code Pro** | Adobe's mono | ★★★☆☆ — Clean fallback |
| **Iosevka Charon** | Narrow, efficient | ★★★★☆ — Compact data displays |

### CJK Support (Critical for manhwa/manga titles)
| Font | Coverage | Notes |
|------|----------|-------|
| **Malgun Gothic** | Korean | System Korean font, clean |
| **Microsoft YaHei** | Chinese | System Chinese font |
| **Yu Gothic** | Japanese | System Japanese font |
| **MS Gothic** | Japanese | Fallback Japanese |

---

## Recommended Typography System

### Primary Pairing: Cinematic + Readable

```
Display:     Playfair Display (dramatic, editorial, cinematic)
Headlines:   Datatype / Datatype Condensed (geometric, futuristic, bold)
Body:        DM Sans (clean, modern, excellent readability)
Accent:      Caveat (handwritten personality for annotations)
Data:        JetBrains Mono (precise, technical, stats)
CJK:         Malgun Gothic / Yu Gothic / Microsoft YaHei (native titles)
```

### Why This Pairing Works

1. **Playfair Display** brings editorial gravitas — it feels like a premium magazine or film title. The high-contrast serifs create drama at large sizes.

2. **Datatype** (especially Condensed and Expanded variants) provides a futuristic, slightly anime-tech aesthetic. Perfect for tier labels, badge names, and section markers.

3. **DM Sans** is the workhorse — clean enough to disappear when reading reviews, but with enough geometric character to feel intentional. The optical size variants (18pt, 24pt, 36pt) allow precise tuning.

4. **Caveat** adds human warmth — personal annotations, "vibe check" labels, and casual asides feel handwritten and authentic.

5. **JetBrains Mono** makes statistics and data feel precise and technical — chapter counts, reading hours, and ratings get a data-visualization treatment.

---

## Type Scale

Using a modular scale with ratio 1.25 (Major Third):

```
--text-xs:    0.75rem   (12px)  — Captions, metadata
--text-sm:    0.875rem  (14px)  — Secondary info, tags
--text-base:  1rem      (16px)  — Body text
--text-lg:    1.125rem  (18px)  — Lead paragraphs
--text-xl:    1.25rem   (20px)  — Card titles
--text-2xl:   1.5rem    (24px)  — Section subtitles
--text-3xl:   1.875rem  (30px)  — Section titles
--text-4xl:   2.25rem   (36px)  — Page titles
--text-5xl:   3rem      (48px)  — Hero subtitles
--text-6xl:   3.75rem   (60px)  — Hero titles
--text-7xl:   4.5rem    (72px)  — Cinematic display
--text-8xl:   6rem      (96px)  — Ultra display (desktop only)
--text-9xl:   8rem      (128px) — Maximum impact (desktop only)
```

### Mobile Scale Adjustments
```
--text-6xl → 2.5rem (40px) on mobile
--text-7xl → 3rem (48px) on mobile
--text-8xl → 3.75rem (60px) on mobile
--text-9xl → 4.5rem (72px) on mobile
```

---

## Font Weight Strategy

### Playfair Display (Display)
- Regular (400) — Elegant titles
- Bold (700) — Maximum drama
- Black (900) — Ultra impact moments
- Italic variants — Editorial quotes

### Datatype (Headlines/Labels)
- Light (300) — Subtle section markers
- Regular (400) — Standard labels
- Medium (500) — Emphasized labels
- Bold (700) — Strong headers
- ExtraBold (800) — Tier names, badges
- Black (900) — Maximum impact

### DM Sans (Body)
- Light (300) — Atmospheric text, large quotes
- Regular (400) — Body text
- Medium (500) — Emphasized body, card titles
- SemiBold (600) — Subheadings
- Bold (700) — Strong emphasis

### JetBrains Mono (Data)
- Light (300) — Background data
- Regular (400) — Standard data display
- Medium (500) — Emphasized numbers
- Bold (700) — Key statistics

---

## Typography Hierarchy Application

### Hero / Landing
```
Site Title:        Playfair Display Black, text-8xl/text-9xl
Tagline:           DM Sans Light, text-2xl/text-3xl
CTA:               Datatype Medium, text-lg, letter-spacing: 0.1em
```

### Section Headers
```
Section Title:     Datatype Bold/ExtraBold, text-4xl/text-5xl
Section Subtitle:  DM Sans Regular, text-lg/text-xl
Section Label:     Datatype Condensed Medium, text-sm, uppercase, tracking-widest
```

### Card Components
```
Title Name:        DM Sans SemiBold, text-xl
Genre Tags:        Datatype Condensed Regular, text-xs, uppercase
Rating:            JetBrains Mono Medium, text-lg
Quick Review:      DM Sans Regular, text-base
Personal Note:     Caveat Regular, text-lg
```

### Review Pages
```
Review Title:      Playfair Display Bold, text-3xl
Review Body:       DM Sans Regular, text-base, line-height: 1.75
Pull Quote:        Playfair Display Italic, text-2xl
Spoiler Tag:       Datatype Condensed Bold, text-xs, uppercase
```

### Statistics
```
Stat Number:       JetBrains Mono Bold, text-5xl/text-6xl
Stat Label:        DM Sans Medium, text-sm
Chart Labels:      JetBrains Mono Regular, text-xs
Timeline Dates:    JetBrains Mono Light, text-sm
```

### Tier List
```
Tier Name:         Datatype Expanded ExtraBold, text-3xl
Tier Description:  DM Sans Regular, text-base
Title in Tier:     DM Sans Medium, text-sm
```

### Badges / Achievements
```
Badge Name:        Datatype Bold, text-lg
Badge Description: DM Sans Regular, text-sm
Progress:          JetBrains Mono Medium, text-xs
```

---

## Line Height & Spacing

```
Display text:      line-height: 1.0 - 1.1
Headlines:         line-height: 1.1 - 1.2
Subheadings:       line-height: 1.2 - 1.3
Body text:         line-height: 1.6 - 1.75
Captions:          line-height: 1.4
Data/Mono:         line-height: 1.5
```

### Letter Spacing
```
Display (large):   letter-spacing: -0.02em (tighter)
Headlines:         letter-spacing: -0.01em
Body:              letter-spacing: 0 (default)
Uppercase labels:  letter-spacing: 0.05em - 0.15em (wider)
Data:              letter-spacing: 0.02em
```

---

## CJK Typography Handling

For manhwa/manhua/manga titles displayed in their original language:

```css
.title-korean {
  font-family: 'Malgun Gothic', sans-serif;
  font-weight: 700;
}

.title-japanese {
  font-family: 'Yu Gothic', sans-serif;
  font-weight: 700;
}

.title-chinese {
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: 700;
}
```

### CJK Display Rules
- Original titles shown alongside romanized/English titles
- CJK text uses slightly larger font-size (1.1x multiplier) for visual balance
- CJK fonts pair well with geometric sans (DM Sans, Datatype)
- Vertical text option for decorative Japanese titles

---

## Font Loading Strategy

### Priority Loading Order
1. **DM Sans Regular + Medium** — Critical for body text (preload)
2. **Datatype Bold** — Critical for headlines (preload)
3. **Playfair Display Bold** — Hero display (preload on landing)
4. **JetBrains Mono Regular** — Data displays (lazy)
5. **Caveat Regular** — Accent text (lazy)
6. **All other weights** — On-demand

### Font Display Strategy
```css
/* Critical fonts */
@font-face {
  font-display: swap; /* Show fallback immediately, swap when loaded */
}

/* Non-critical fonts */
@font-face {
  font-display: optional; /* Only use if already cached */
}
```

### Fallback Stack
```css
--font-display: 'Playfair Display', 'Georgia', serif;
--font-heading: 'Datatype', 'Oswald', 'Arial Narrow', sans-serif;
--font-body: 'DM Sans', 'Inter', system-ui, sans-serif;
--font-accent: 'Caveat', 'Ink Free', cursive;
--font-data: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
--font-cjk-ko: 'Malgun Gothic', sans-serif;
--font-cjk-ja: 'Yu Gothic', 'MS Gothic', sans-serif;
--font-cjk-zh: 'Microsoft YaHei', 'SimSun', sans-serif;
```

---

## Responsive Typography

### Fluid Typography (clamp)
```css
/* Hero display */
.hero-title {
  font-size: clamp(3rem, 8vw, 8rem);
}

/* Section titles */
.section-title {
  font-size: clamp(1.875rem, 4vw, 3.75rem);
}

/* Body text remains fixed for readability */
.body-text {
  font-size: 1rem; /* Always 16px */
}
```

### Breakpoint-Specific Adjustments
- **Mobile (< 768px):** Reduce display sizes, increase body line-height
- **Tablet (768-1024px):** Intermediate scaling
- **Desktop (1024-1440px):** Full type scale
- **Ultrawide (> 1440px):** Cap maximum sizes, increase spacing

---

## Special Typography Treatments

### Gradient Text (for tier names, special labels)
```css
.gradient-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Glow Text (for SSS+ tier, achievements)
```css
.glow-text {
  text-shadow: 0 0 10px var(--accent-primary),
               0 0 20px var(--accent-primary),
               0 0 40px var(--accent-primary);
}
```

### Vertical Text (decorative Japanese-style)
```css
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

### Masked Text (text filled with image/gradient)
```css
.masked-text {
  background-image: url('texture.jpg');
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
