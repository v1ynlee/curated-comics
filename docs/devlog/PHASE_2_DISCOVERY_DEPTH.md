# Devlog — Phase 2: Discovery & Depth

**Date:** 2026-05-10
**Phase:** 2 — Discovery & Depth
**Status:** ✅ Complete

---

## Completed Tasks

Sourced from `docs/roadmap/ROADMAP.md` — Phase 2 checked items.

### Mood/Genre Discovery
- [x] Mood selector with atmospheric transitions
- [x] Per-mood visual treatment (color, particles, gradient)
- [x] Discovery grid with mood-filtered results
- [x] Mood cards with emoji and description
- [x] Smooth transitions between moods

### Tier List
- [x] Visual tier display with tier-specific styling
- [x] Tier labels with glow/gradient effects
- [x] Titles within tiers (horizontal scroll per tier)
- [x] Tier descriptions
- [x] Responsive tier layout (vertical stack on mobile)

### Enhanced Interactions
- [x] Card hover physics (tilt, shadow)
- [x] Parallax sections
- [x] Staggered scroll reveals (GSAP batch)
- [x] Ambient background effects (gradient animation)
- [x] Custom cursor effects (desktop)
- [x] Improved page transitions

### Review System Enhancement
- [x] Markdown rendering
- [x] Spoiler toggle sections
- [x] "Vibe check" display
- [x] Quotable lines showcase
- [x] Editorial typography treatment

---

## What Was Built

### New Routes
| Route | Type | Description |
|-------|------|-------------|
| `/discover` | Static (client) | Mood-based discovery with atmospheric transitions |
| `/tiers` | Static (client) | Visual tier list with horizontal scroll per tier |

### New Components
| Component | Domain | Purpose |
|-----------|--------|---------|
| `MoodCard` | discover | Individual mood card with emoji, name, description, active state |
| `MoodAtmosphere` | discover | Per-mood animated background (gradient + particles) |
| `MoodSelector` | discover | Grid of mood cards with toggle selection |
| `DiscoveryGrid` | discover | Mood-filtered title grid with AnimatePresence transitions |
| `TierLabel` | tiers | Tier name with glow/gradient text effect |
| `TierRow` | tiers | Single tier row with horizontal scroll carousel |
| `CustomCursor` | cinematic | Ambient dot + ring cursor for desktop high-perf |
| `ParallaxSection` | cinematic | GSAP ScrollTrigger parallax wrapper |
| `CinematicReveal` | cinematic | Scroll-triggered cinematic scale+blur reveal |

### New Services + Hooks
| File | Purpose |
|------|---------|
| `services/moods.ts` | fetchMoods, fetchMood |
| `services/tiers.ts` | fetchTierGroups (titles grouped by tier) |
| `hooks/useMoods.ts` | useMoods, useMood |
| `hooks/useTiers.ts` | useTierGroups |
| `hooks/useCardTilt.ts` | 3D tilt effect via mouse position |
| `hooks/useGSAPBatchReveal.ts` | GSAP ScrollTrigger batch for efficient list reveals |

### Enhanced Components
| Component | Enhancement |
|-----------|-------------|
| `TitleCard` | Added 3D tilt physics via `useCardTilt` |
| `ReviewSection` | Spoiler toggle, vibe check display, quotable lines |
| `AtmosphericBg` | Animated pulse-glow orbs on high-perf devices |
| `TitleDetailClient` | Passes vibeCheck + quotableLines to ReviewSection |

---

## Architecture Decisions

### 1. Discover Page — Client Component with Local State

**Decision:** `/discover/page.tsx` is a `'use client'` component with `useState` for `activeMoodSlug`. No server component wrapper needed.

**Reasoning:** The discover page is entirely interactive — mood selection drives the grid. There's no SEO-critical content that needs SSR. The page is statically prerendered as a shell, then hydrates with the mood selector and grid.

**Tradeoff:** No URL-based mood state (can't share a specific mood URL). Phase 3 enhancement: add `?mood=slug` URL params.

### 2. MoodAtmosphere — AnimatePresence with `mode="wait"`

**Decision:** `AnimatePresence mode="wait"` ensures the old atmosphere fades out completely before the new one fades in.

**Reasoning:** Crossfading two atmospheric backgrounds simultaneously creates a muddy visual. Sequential fade (out → in) creates a clean "scene change" feeling that matches the cinematic design philosophy.

**Performance:** The atmosphere div is `aria-hidden` and uses only `opacity` transitions — GPU-accelerated, no layout thrash.

### 3. Tier Groups — Client-Side Grouping

**Decision:** `fetchTierGroups()` fetches all tiered titles in one query, then groups them in JavaScript.

**Reasoning:** Supabase doesn't have a native "group by" that returns nested arrays in the REST API. The alternative (7 separate queries, one per tier) would be 7× the network round trips. One query + JS grouping is faster and simpler.

**Tradeoff:** Fetches up to 500 titles at once. With 300-500 titles total, this is fine. If the library grows to 1000+, add server-side grouping via a Supabase RPC function.

### 4. Card Tilt — CSS Transform, Not Framer Motion

**Decision:** `useCardTilt` returns a `style` object with CSS `transform` and applies it directly. Not using Framer Motion's `style` prop with `useMotionValue`.

**Reasoning:** The tilt needs to update on every `mousemove` event — potentially 60+ times per second. Framer Motion's `useMotionValue` + `useTransform` would work but adds overhead. Direct CSS transform via `style` is the most performant approach for high-frequency updates.

**Reduced motion:** `useCardTilt` returns empty `tiltStyle` when `prefersReduced` is true or on non-desktop. The card still renders normally.

### 5. Custom Cursor — RAF Loop, Not React State

**Decision:** The cursor uses a `requestAnimationFrame` loop with direct DOM manipulation (`element.style.transform`), not React state.

**Reasoning:** React state updates trigger re-renders. A cursor that re-renders on every mouse move (60fps) would cause massive performance issues. Direct DOM manipulation via `useRef` + RAF is the correct pattern for high-frequency visual updates.

**Cleanup:** The RAF loop is cancelled and `cursor: none` is removed on unmount. Only active on `tier === 'high'` devices.

### 6. GSAP Batch Reveal — Efficiency Over Per-Element Triggers

**Decision:** `useGSAPBatchReveal` uses `ScrollTrigger.batch()` instead of individual `ScrollTrigger.create()` per element.

**Reasoning:** Per-element ScrollTrigger instances are expensive — each one adds to the scroll event processing budget. `ScrollTrigger.batch()` processes all matching elements in a single pass, dramatically reducing overhead for large lists.

### 7. ReviewSection — Spoiler Toggle with AnimatePresence

**Decision:** Spoiler content uses `AnimatePresence` with `height: 0 → auto` animation via Framer Motion's layout animation.

**Reasoning:** Animating `height: auto` is normally forbidden (causes layout thrash). Framer Motion handles this correctly by measuring the element height before animating. The `overflow: hidden` on the wrapper prevents content flash during animation.

---

## Performance Considerations

### Discover Page
- Mood cards are CSS-only for hover states (no JS)
- `MoodAtmosphere` particles are CSS `animate-float` (compositor thread)
- Grid uses `keepPreviousData` — no flash when switching moods
- `AnimatePresence mode="wait"` on atmosphere prevents simultaneous renders

### Tier Page
- Single Supabase query for all tiered titles (not 7 queries)
- Horizontal scroll uses CSS `overflow-x: auto` + `snap-x` (no JS)
- `TierRow` uses `whileInView` — only animates when visible

### Card Tilt
- Direct DOM style mutation (no React re-renders)
- `will-change: transform` applied only while hovered, removed on leave
- Disabled on mobile, low-perf devices, and reduced motion

---

## Future Concerns

1. **Mood URL state:** Currently mood selection is in-memory. Phase 3 should add `?mood=slug` URL params for shareability.

2. **Tier drag-and-drop:** Phase 4 (admin) will add drag-and-drop tier assignment. The `TierRow` component is designed to be extended with a drag context wrapper.

3. **Markdown rendering:** The review body is currently rendered as `whitespace-pre-wrap` plain text. Phase 3 should add a proper markdown renderer (e.g., `react-markdown` with custom components for the editorial typography treatment).

4. **Mood filtering in library:** The `useLibraryStore` has `activeMoods` state but the library grid doesn't expose mood filtering in the UI yet. Phase 3 enhancement.

---

## Rejected Approaches

### ❌ Framer Motion `useMotionValue` for card tilt

Would work but adds unnecessary overhead for high-frequency mouse events. Direct CSS transform is faster.

### ❌ 7 separate Supabase queries for tier groups

Too many round trips. One query + JS grouping is faster and simpler.

### ❌ CSS-only mood transitions (no AnimatePresence)

Without `AnimatePresence`, the old and new atmospheres would overlap during transition, creating a muddy visual. The sequential fade is worth the small overhead.

### ❌ `react-markdown` for review body

Adds ~15KB to the bundle. The current `whitespace-pre-wrap` approach handles line breaks correctly for plain text reviews. Full markdown rendering is a Phase 3 polish item.

---

## Git Commit Message

```
feat(phase-2): discovery, tier list, enhanced interactions, review depth

Discover Page:
- MoodCard: emoji + name + description + active state with accent color
- MoodAtmosphere: per-mood animated background (gradient + particles),
  AnimatePresence mode="wait" for clean scene transitions
- MoodSelector: 4-col grid of mood cards with toggle selection
- DiscoveryGrid: mood-filtered title grid with AnimatePresence transitions
- /discover: full page with atmospheric background + mood selector + grid

Tier List:
- TierLabel: tier name with glow (SSS+), gradient (S/A), or solid color
- TierRow: horizontal scroll carousel per tier, responsive (stacks on mobile)
- services/tiers.ts: single query + JS grouping for all tier groups
- /tiers: full page with tier legend + all tier rows

Enhanced Interactions:
- useCardTilt: 3D tilt via mouse position, direct CSS transform (no re-renders),
  disabled on mobile/reduced-motion/low-perf
- TitleCard: integrated tilt physics
- CustomCursor: dot + lagged ring, RAF loop (no React state), high-perf only
- ParallaxSection: GSAP ScrollTrigger scrub wrapper
- CinematicReveal: scale+blur scroll reveal
- useGSAPBatchReveal: ScrollTrigger.batch for efficient list reveals
- AtmosphericBg: animated pulse-glow orbs on high-perf devices

Review System:
- Spoiler toggle: AnimatePresence height animation, warning banner
- Vibe check: displayed above TL;DR with accent font
- Quotable lines: blockquote list with accent border
- TitleDetailClient: passes vibeCheck + quotableLines to ReviewSection

Services + Hooks:
- services/moods.ts: fetchMoods, fetchMood
- hooks/useMoods.ts: useMoods, useMood
- services/tiers.ts: fetchTierGroups
- hooks/useTiers.ts: useTierGroups
- hooks/useCardTilt.ts: 3D tilt effect
- hooks/useGSAPBatchReveal.ts: GSAP batch reveal

ROADMAP.md: all Phase 2 tasks marked complete
```
