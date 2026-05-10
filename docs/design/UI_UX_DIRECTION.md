# UI/UX Direction — Comic Curated

## Philosophy

This website rejects the conventional web layout paradigm. No generic navbars with cards beneath. No SaaS dashboards. No repetitive grids. Every section is a **cinematic composition** — a deliberate visual story that guides the eye, evokes emotion, and rewards exploration.

The design language draws from:
- Anime movie promotional websites (Makoto Shinkai film sites, Ufotable productions)
- Visual novel interfaces (layered, atmospheric, character-driven)
- Modern cinematic landing pages (Apple product reveals, luxury brand sites)
- Interactive art portfolios (awwwards-level craft)
- Manga panel composition (asymmetry, dramatic framing, visual flow)

---

## Core UX Principles

### 1. Cinematic Pacing
Every page has a rhythm. Sections breathe. Content reveals itself like scenes in a film — not dumped all at once.

- Hero sections are full-bleed, atmospheric
- Content sections alternate between dense and spacious
- Transitions between sections feel like scene changes
- Scroll speed varies by content density

### 2. Emotional Navigation
Navigation is not just functional — it's experiential.

- Primary navigation feels like flipping through a manga volume
- Category switching has weight and presence
- Filtering feels like tuning into a frequency
- Search is an exploration, not a utility

### 3. Visual Hierarchy Through Drama
Instead of relying on font size alone, hierarchy is established through:
- Depth (z-layers, parallax, blur)
- Motion (elements that move draw attention)
- Contrast (light against dark, color against monochrome)
- Scale (oversized elements for emphasis)
- Negative space (breathing room creates importance)

### 4. Reward Exploration
Hidden details, easter eggs, and progressive disclosure:
- Hover states reveal additional information
- Scroll depth unlocks visual treats
- Returning visitors notice new ambient details
- Achievement badges appear with ceremony

---

## Page Architecture

### Landing / Hero Experience
- Full-viewport cinematic opening
- Atmospheric background (particle effects, subtle gradients, ambient motion)
- Dramatic title reveal with staggered animation
- Mood-setting color palette that shifts subtly
- Single compelling CTA that draws you deeper
- NO generic hero with stock image + headline + button pattern

### Library Browse
- NOT a flat grid of cards
- Asymmetrical masonry with varying card sizes based on rating/importance
- Featured titles get cinematic treatment (larger, animated, atmospheric)
- Scroll-driven reveals — titles appear as you explore
- Filtering transforms the layout, not just hides items
- Category tabs feel like chapter markers

### Title Detail View
- Full-screen immersive experience per title
- Cover art as atmospheric backdrop (blurred, gradient-overlaid)
- Information layers that reveal on scroll
- Rating visualization as custom graphic elements (not star widgets)
- Review text presented with editorial typography
- Related titles as a cinematic carousel, not a grid

### Tier List View
- Interactive, visual tier system
- Each tier has its own visual identity (color, texture, motion)
- Titles within tiers have presence — not just thumbnails
- Draggable interaction for the owner (admin mode)
- Visitor mode is a cinematic scroll experience

### Statistics View
- Data visualization as art
- Animated charts that tell a story
- Reading timeline as a visual journey
- Genre distribution as an artistic composition
- Numbers presented with dramatic reveals

### Genre/Mood Discovery
- Mood-based browsing feels like tuning a radio
- Each mood has a distinct visual atmosphere
- Transitioning between moods shifts the entire page aesthetic
- Discovery feels serendipitous, not clinical

### Achievement Gallery
- Badges displayed as collectibles in a showcase
- Unlocked vs locked states with visual distinction
- Achievement unlock animations are celebratory
- Progress indicators for partially-completed achievements

---

## Layout System

### Anti-Patterns (AVOID)
```
❌ Navbar → Hero → Grid → Grid → Grid → Footer
❌ Sidebar + Content area (dashboard pattern)
❌ Uniform card grid with identical sizing
❌ Plain white background with black text
❌ Generic rounded-corner cards with shadows
```

### Desired Patterns
```
✅ Full-bleed sections with atmospheric backgrounds
✅ Asymmetrical compositions with intentional imbalance
✅ Overlapping elements creating depth
✅ Diagonal section dividers
✅ Mixed media sections (text + image + motion)
✅ Varying section heights based on content importance
✅ Negative space as a design element
✅ Layered z-depth with parallax
```

### Section Composition Types

**Type A: Cinematic Full-Bleed**
- Full viewport width and height
- Background imagery/video/particles
- Minimal text, maximum atmosphere
- Used for: Hero, mood transitions, chapter breaks

**Type B: Editorial Spread**
- Asymmetrical two-column with dramatic sizing difference (70/30 or 80/20)
- One side dominates visually
- Used for: Featured titles, reviews, highlights

**Type C: Flowing Gallery**
- Masonry or staggered layout
- Items vary in size based on importance
- Scroll-driven reveals
- Used for: Library browse, tier lists

**Type D: Data Narrative**
- Information presented as visual story
- Charts and numbers with dramatic presentation
- Used for: Statistics, achievements, progress

**Type E: Immersive Detail**
- Single-focus deep dive
- Layered information reveal
- Full atmospheric treatment
- Used for: Title detail, review reading

---

## Color Philosophy

### Base Palette Direction
The site operates in a **dark-dominant** color space:
- Deep blacks and near-blacks as primary backgrounds
- Rich, saturated accent colors that glow against darkness
- Gradient transitions between sections
- Color as emotional indicator (warm for favorites, cool for dropped, etc.)

### Color Roles
| Role | Direction |
|------|-----------|
| Background Primary | Deep charcoal / near-black (#0a0a0f to #12121a) |
| Background Secondary | Dark navy / deep purple undertones |
| Text Primary | Warm white / cream (not pure #fff) |
| Text Secondary | Muted silver / lavender |
| Accent Primary | Electric violet / deep magenta |
| Accent Secondary | Warm gold / amber |
| Accent Tertiary | Cyan / electric blue |
| Success/Positive | Emerald with glow |
| Warning | Amber with warmth |
| Danger/Dropped | Deep crimson |

### Mood-Based Color Shifting
Different sections/moods shift the ambient color:
- Murim titles → deep red/gold atmosphere
- Romance → soft pink/lavender
- Horror → desaturated green/grey
- Comedy → warm orange/yellow
- Action → electric blue/cyan

---

## Interaction Patterns

### Hover States
- Cards lift with subtle shadow deepening
- Cover images shift slightly (parallax tilt)
- Additional info slides in from edges
- Color temperature shifts on hover
- Cursor changes to contextual indicators

### Click/Tap Feedback
- Ripple effects with brand colors
- Scale micro-animation (press → release)
- Haptic-feeling visual feedback
- Transition to new state feels weighted

### Scroll Behavior
- Smooth scrolling via Lenis
- Scroll-triggered animations (GSAP ScrollTrigger)
- Parallax depth on background elements
- Section snapping for key areas (optional, not forced)
- Progress indicators that feel organic

### Page Transitions
- Full-page transitions between routes
- Shared element transitions (cover art persists between list → detail)
- Fade + slide combinations
- No jarring white flashes between pages

---

## Navigation Architecture

### Primary Navigation
Not a traditional navbar. Instead:
- Floating, minimal navigation that appears on scroll
- Morphs based on context (transparent → solid on scroll)
- Navigation items have hover micro-animations
- Mobile: gesture-based with bottom sheet navigation

### Navigation Items
1. **Home** — Cinematic landing
2. **Library** — Full reading archive
3. **Discover** — Mood/genre exploration
4. **Tiers** — Tier list showcase
5. **Stats** — Reading statistics
6. **About** — Personal branding page

### Secondary Navigation
- Within Library: category tabs (reading, completed, dropped, etc.)
- Within Discover: mood/genre selectors
- Within Stats: time period selectors
- Breadcrumb-style context indicators (subtle, not intrusive)

---

## Responsive Strategy

### Mobile-First, Desktop-Cinematic
- Mobile is the baseline — clean, fast, functional
- Tablet adds spatial luxury
- Desktop unlocks full cinematic potential
- Ultrawide gets additional atmospheric elements

### Mobile Adaptations
- Cinematic sections become vertical scrolling stories
- Asymmetrical layouts stack gracefully
- Touch gestures replace hover interactions
- Bottom navigation replaces floating nav
- Reduced particle/ambient effects for performance

### Desktop Enhancements
- Full parallax and depth effects
- Hover interactions with physics
- Wider cinematic compositions
- Side-by-side editorial layouts
- Ambient cursor effects

---

## Micro-Interaction Inventory

| Interaction | Behavior |
|-------------|----------|
| Card hover | Lift + tilt + info reveal |
| Rating display | Animated fill on scroll-into-view |
| Badge unlock | Particle burst + scale animation |
| Filter toggle | Layout morph with stagger |
| Page transition | Shared element + fade |
| Scroll progress | Organic progress indicator |
| Search open | Expansion with backdrop blur |
| Menu open | Staggered item reveal |
| Tier drag | Physics-based movement |
| Stat counter | Counting animation on reveal |
