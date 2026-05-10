# Motion System — Comic Curated

## Motion Philosophy

Motion in Comic Curated is not decoration — it's **storytelling**. Every animation serves one of three purposes:

1. **Narrative** — Guides the user through a visual story
2. **Feedback** — Confirms interaction and state changes
3. **Atmosphere** — Creates the cinematic, living-world feeling

The golden rule: **Smoothness > Spectacle**. A butter-smooth subtle animation always beats a flashy janky one.

---

## Motion Principles

### 1. Physics-Based, Not Mechanical
Animations should feel like they obey physical laws — momentum, gravity, spring tension. Never linear, never robotic.

### 2. Purposeful, Not Gratuitous
Every animation must answer: "What does this communicate?" If the answer is "nothing, it just looks cool," reconsider.

### 3. Layered, Not Simultaneous
Elements animate in sequence with intentional stagger — creating a sense of choreography, like panels in a manga revealing one by one.

### 4. Interruptible, Not Blocking
Users should never wait for an animation to finish before they can interact. All animations are interruptible.

### 5. Progressive, Not Binary
Animations respond to scroll position, hover proximity, and interaction depth — not just on/off states.

---

## Easing Library

### Primary Easings
```javascript
const easings = {
  // Standard transitions
  smooth: [0.25, 0.1, 0.25, 1.0],        // CSS ease equivalent
  
  // Entrances (decelerate)
  enterSoft: [0.0, 0.0, 0.2, 1.0],       // Gentle arrival
  enterDramatic: [0.0, 0.0, 0.0, 1.0],   // Dramatic deceleration
  
  // Exits (accelerate)
  exitSoft: [0.4, 0.0, 1.0, 1.0],        // Gentle departure
  exitDramatic: [0.7, 0.0, 1.0, 1.0],    // Quick departure
  
  // Emphasis (overshoot)
  spring: [0.175, 0.885, 0.32, 1.275],   // Subtle bounce
  springHeavy: [0.68, -0.55, 0.265, 1.55], // Dramatic overshoot
  
  // Cinematic
  cinematic: [0.77, 0.0, 0.175, 1.0],    // Slow start, smooth end
  dramatic: [0.86, 0.0, 0.07, 1.0],      // Very slow start, snap end
}
```

### GSAP-Specific Easings
```javascript
const gsapEasings = {
  smoothReveal: "power2.out",
  dramaticReveal: "power4.out",
  elasticBounce: "elastic.out(1, 0.5)",
  cinematicIn: "power3.inOut",
  snapIn: "back.out(1.7)",
}
```

### Framer Motion Spring Configs
```javascript
const springs = {
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  snappy: { type: "spring", stiffness: 300, damping: 20 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  heavy: { type: "spring", stiffness: 80, damping: 20, mass: 2 },
  cinematic: { type: "spring", stiffness: 50, damping: 15, mass: 1.5 },
}
```

---

## Duration Scale

```
--duration-instant:   50ms    — Micro-feedback (opacity flicker)
--duration-fast:      150ms   — Button press, toggle
--duration-normal:    300ms   — Standard transitions
--duration-smooth:    500ms   — Page elements, reveals
--duration-cinematic: 800ms   — Dramatic reveals, page transitions
--duration-epic:      1200ms  — Hero animations, first-load sequences
--duration-ambient:   3000ms+ — Background loops, floating elements
```

### Duration Rules
- **Micro-interactions:** 100-200ms (fast, snappy)
- **Layout changes:** 300-500ms (smooth, noticeable)
- **Page transitions:** 600-1000ms (cinematic, dramatic)
- **Ambient motion:** 2000ms+ (slow, hypnotic)
- **Stagger delay:** 50-100ms between items

---

## Animation Categories

### Category 1: Scroll-Driven Animations

**Technology:** GSAP ScrollTrigger

#### Reveal on Scroll
Elements appear as they enter the viewport:
```
- Fade up: translateY(40px) → translateY(0), opacity 0 → 1
- Fade in: opacity 0 → 1 (no movement)
- Scale reveal: scale(0.9) → scale(1), opacity 0 → 1
- Slide from side: translateX(±60px) → translateX(0)
- Clip reveal: clip-path animation (wipe effect)
```

#### Parallax Layers
Background elements move at different scroll speeds:
```
- Far background: 0.3x scroll speed
- Mid background: 0.5x scroll speed
- Near background: 0.7x scroll speed
- Content: 1.0x scroll speed (normal)
- Foreground accents: 1.2x scroll speed
```

#### Scroll-Linked Progress
Elements that animate proportionally to scroll position:
- Progress bars that fill as you scroll
- Background color transitions between sections
- Element rotation linked to scroll
- Scale changes based on scroll proximity

#### Section Transitions
As one section ends and another begins:
- Color palette crossfade
- Atmospheric element handoff
- Typography scale shift
- Mood transition (warm → cool, etc.)

---

### Category 2: Page Transitions

**Technology:** Framer Motion (AnimatePresence + layout animations)

#### Route Change Transitions
```
Exit current page:
  - Content fades out (200ms)
  - Background shifts color (300ms)
  
Enter new page:
  - Background settles (200ms)
  - Content staggers in (400ms total)
```

#### Shared Element Transitions
When navigating from list → detail:
- Cover image morphs from card position to detail position
- Title text transitions from card to page header
- Background color transitions to match title's mood

#### Transition Variants
```javascript
const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  cinematic: {
    initial: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.02, filter: "blur(4px)" },
  },
}
```

---

### Category 3: Interaction Animations

**Technology:** Framer Motion + CSS

#### Hover Effects
```
Card hover:
  - translateY(-4px) over 200ms
  - Box shadow deepens
  - Cover image scale(1.05) with overflow hidden
  - Info overlay slides up from bottom

Button hover:
  - Background gradient shift
  - Subtle glow intensifies
  - Scale(1.02)

Link hover:
  - Underline draws from left to right
  - Color transition
  - Subtle letter-spacing increase
```

#### Click/Press Effects
```
Button press:
  - Scale(0.97) on mousedown
  - Scale(1.0) on mouseup with spring
  - Ripple effect from click point

Card press:
  - Scale(0.98) briefly
  - Transition to detail view
```

#### Drag Interactions (Tier List)
```
Drag start:
  - Element lifts (scale 1.05, shadow deepens)
  - Other elements make space (layout animation)
  
Dragging:
  - Element follows cursor with slight lag (spring)
  - Drop zones highlight on proximity
  
Drop:
  - Element settles into position (spring bounce)
  - Layout reflows smoothly
```

---

### Category 4: Ambient Motion

**Technology:** CSS animations + GSAP (lightweight)

#### Background Particles
- Slow-moving dots/shapes
- Random drift patterns
- Very low opacity (0.1-0.3)
- GPU-accelerated (transform only)
- Reduced/disabled on mobile

#### Gradient Animation
- Slow color cycling on backgrounds
- 10-20 second loop duration
- Subtle, almost imperceptible
- Uses CSS `@keyframes` for performance

#### Floating Elements
- Decorative elements with gentle bob
- Sin-wave motion (up/down)
- Rotation drift
- Independent timing per element

#### Atmospheric Glow
- Pulsing glow effects on accent elements
- Breathing rhythm (inhale/exhale timing)
- Tied to brand colors

---

### Category 5: Data Animations

**Technology:** Framer Motion + GSAP

#### Number Counting
```
Statistics reveal:
  - Numbers count up from 0 to final value
  - Duration: 1500-2000ms
  - Easing: power2.out (fast start, slow end)
  - Triggered on scroll into view
```

#### Chart Animations
```
Bar charts:
  - Bars grow from 0 to full height
  - Staggered by 50ms per bar
  - Spring easing for slight overshoot

Pie/Donut charts:
  - Segments draw clockwise
  - Each segment staggers 100ms
  - Total duration: 1000ms

Line charts:
  - Path draws from left to right
  - Duration: 1500ms
  - Followed by dot reveals
```

#### Progress Indicators
```
Rating bars:
  - Fill from left with gradient
  - Duration: 800ms per bar
  - Stagger: 100ms between ratings
```

---

### Category 6: Loading & Skeleton States

#### Skeleton Shimmer
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

#### Content Reveal (after load)
```
Skeleton → Content:
  - Skeleton fades out (200ms)
  - Content fades in with slight scale (300ms)
  - Staggered if multiple items
```

#### Image Loading
```
Blur placeholder → Full image:
  - Start with tiny blurred version (LQIP)
  - Full image loads behind
  - Crossfade blur → sharp (400ms)
  - No layout shift (aspect ratio preserved)
```

---

## Motion Orchestration

### First Load Sequence
```
1. [0ms]     Background gradient appears
2. [200ms]   Logo/brand mark fades in
3. [500ms]   Hero title staggers in (letter by letter or word by word)
4. [800ms]   Subtitle fades up
5. [1000ms]  CTA appears with glow
6. [1200ms]  Ambient particles begin
7. [1500ms]  Scroll indicator pulses
```

### Section Enter Sequence
```
1. [0ms]     Section background transitions
2. [100ms]   Section label slides in
3. [200ms]   Section title reveals
4. [350ms]   Content begins staggering in
5. [350ms+]  Each item staggers by 75ms
```

### Card Interaction Sequence
```
Hover:
1. [0ms]     Card lifts (translateY)
2. [50ms]    Shadow deepens
3. [100ms]   Image zooms slightly
4. [150ms]   Overlay info slides up

Click → Detail:
1. [0ms]     Card scales down slightly (press)
2. [100ms]   Other cards fade out
3. [200ms]   Clicked card expands (shared element)
4. [400ms]   Detail content begins appearing
5. [600ms]   Full detail view settled
```

---

## Performance Guardrails

### Animation Budget
- Maximum 3 simultaneous complex animations per viewport
- Ambient animations use CSS only (no JS runtime cost)
- ScrollTrigger animations batch-process (not per-frame for each)
- Disable non-essential animations below 30fps detection

### GPU Optimization Rules
```
ALWAYS animate (GPU-accelerated):
  ✅ transform (translate, scale, rotate)
  ✅ opacity
  ✅ filter (blur, brightness)

NEVER animate (triggers layout/paint):
  ❌ width, height
  ❌ top, left, right, bottom
  ❌ margin, padding
  ❌ border-width
  ❌ font-size
```

### will-change Strategy
```css
/* Apply only when animation is imminent */
.about-to-animate {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.animation-done {
  will-change: auto;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* Replace all motion with instant state changes */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Technology Responsibilities

| Technology | Responsibility |
|------------|---------------|
| **Lenis** | Smooth scroll, scroll velocity, momentum |
| **GSAP + ScrollTrigger** | Scroll-linked animations, timelines, complex sequences |
| **Framer Motion** | Page transitions, layout animations, gesture responses, component state |
| **CSS @keyframes** | Ambient loops, skeleton shimmer, simple hover states |
| **React Three Fiber** | Optional 3D elements, particle systems (if used) |

### Integration Rules
- Lenis handles ALL scroll behavior (disable native smooth scroll)
- GSAP handles scroll-position-dependent animations
- Framer Motion handles React component lifecycle animations
- CSS handles simple, always-running ambient effects
- Never mix GSAP and Framer Motion on the same element
