# Devlog — Phase 3: Statistics & Achievements

**Date:** 2026-05-10
**Phase:** 3 — Statistics & Achievements
**Status:** ✅ Complete

---

## Completed Tasks

### Statistics Dashboard
- [x] Total reading stats (chapters, hours, titles)
- [x] Genre distribution chart (animated)
- [x] Reading timeline (monthly/yearly)
- [x] Yearly reading arc visualization
- [x] Reading streak display
- [x] Animated number counters
- [x] Responsive chart layouts

### Achievement System
- [x] Badge grid display
- [x] Individual badge cards (locked/unlocked states)
- [x] Progress indicators (ring/bar)
- [x] Achievement unlock animation
- [x] Rarity-based visual treatment
- [x] Achievement detail modal

### Performance Polish
- [x] Image optimization audit
- [x] Bundle size optimization
- [x] Virtualization for long lists
- [x] Performance tier detection
- [x] Reduced motion full implementation
- [x] Lighthouse audit and fixes

### Visual Polish
- [x] Consistent animation timing
- [x] Loading state refinement
- [x] Error state design
- [x] Empty state design
- [x] Micro-interaction refinement
- [x] Mobile gesture polish

---

## What Was Built

### New Routes
| Route | Type | Description |
|-------|------|-------------|
| `/stats` | Static (client) | Full statistics dashboard + achievements |
| `/not-found` | Static | Cinematic 404 page |
| `/error` | Client | Global error boundary |

### New Components
| Component | Domain | Purpose |
|-----------|--------|---------|
| `StatCard` | stats | Animated counter card with `useInView` trigger |
| `GenreChart` | stats | Horizontal bar chart, staggered animation |
| `TimelineChart` | stats | Monthly chapters bar chart |
| `ReadingStreak` | stats | Current + longest streak display |
| `YearlyArc` | stats | Yearly title count progress bars |
| `ProgressRing` | achievements | SVG circular progress indicator |
| `BadgeCard` | achievements | Badge with locked/unlocked states + detail modal |
| `BadgeGrid` | achievements | Rarity-grouped achievement showcase |

### New Services + Hooks
| File | Purpose |
|------|---------|
| `services/stats.ts` | `fetchReadingStatistics` — parallel Supabase queries |
| `services/achievements.ts` | `fetchAchievements` |
| `hooks/useStats.ts` | `useReadingStatistics`, `useAchievements` |
| `hooks/useCountUp.ts` | RAF-based animated counter, React 19 compliant |

### CSS Additions
- `.content-deferred` — `content-visibility: auto` for off-screen sections
- `.card-contained` — `contain: layout style` for animated cards
- `.state-empty` / `.state-error` — consistent empty/error state styling

---

## Architecture Decisions

### 1. Statistics — Parallel Supabase Queries

**Decision:** `fetchReadingStatistics` runs 6 Supabase queries in parallel via `Promise.all`.

**Reasoning:** The stats page needs data from multiple tables/views: `reading_statistics` (aggregate view), `genre_distribution` (view), `monthly_reading` (view), plus raw `titles` for origin/tier/status distributions. Running them sequentially would be 6× slower. `Promise.all` runs them concurrently — total time ≈ slowest single query.

**Tradeoff:** If any query fails, the entire `Promise.all` rejects. This is acceptable — stats are all-or-nothing. A partial stats page would be confusing.

### 2. `useCountUp` — RAF Loop, Not GSAP

**Decision:** Custom `requestAnimationFrame` loop instead of GSAP's `gsap.to()` for number counting.

**Reasoning:** GSAP is already loaded for scroll animations. However, using GSAP for number counting would require importing it into a hook, creating a dependency. The RAF approach is ~20 lines, zero dependencies, and gives identical visual results. The `power3.out` easing is implemented manually.

**React 19 compliance:** The linter (`react-hooks/set-state-in-effect`) forbids synchronous `setState` inside effects. The solution: track `progress` (0–1) in state, derive `displayValue` from `progress * end` during render. No `setState` in the effect body — only the RAF callback calls `setProgress`.

### 3. `ProgressRing` — SVG, Not CSS

**Decision:** SVG `stroke-dasharray` / `stroke-dashoffset` for the circular progress ring.

**Reasoning:** CSS `conic-gradient` would work but has poor browser support for animation. SVG `stroke-dashoffset` is the standard approach — GPU-accelerated via Framer Motion's `motion.circle`, works in all target browsers, and gives precise control over stroke appearance (rounded caps, etc.).

### 4. `BadgeCard` — Local Modal State

**Decision:** Each `BadgeCard` manages its own `showDetail` state. No global modal store.

**Reasoning:** Only one badge detail can be open at a time (clicking another badge closes the current one via the backdrop). Local state is simpler than a global modal store for this use case. If multiple modals needed coordination, a global store would be warranted.

### 5. Achievement Rarity Grouping — Client-Side

**Decision:** `BadgeGrid` groups achievements by rarity in JavaScript, not via separate Supabase queries.

**Reasoning:** All achievements are fetched in a single query (18 rows). Grouping 18 items in JS is trivial. Separate queries per rarity would be 4× the network round trips for no benefit.

### 6. Reading Streak — Monthly Granularity

**Decision:** Streak is calculated from monthly reading data (consecutive months with activity), not daily.

**Reasoning:** The `reading_history` table tracks sessions, not daily check-ins. Without daily granularity, a true "days read" streak isn't possible. Monthly streak is a meaningful approximation. Phase 4 (admin) will add daily reading log entries that enable true daily streaks.

### 7. Performance Polish — `content-visibility: auto`

**Decision:** Added `.content-deferred` CSS class using `content-visibility: auto` for below-fold sections.

**Reasoning:** The stats page has many sections. `content-visibility: auto` tells the browser to skip rendering off-screen sections until they're near the viewport, reducing initial paint time. `contain-intrinsic-size: 0 400px` prevents layout shift when sections are deferred.

---

## Performance Considerations

### Stats Page Load
- 6 parallel Supabase queries (not sequential)
- All charts use `whileInView` — only animate when visible
- `StatCard` uses Framer Motion's `useInView` — no GSAP overhead
- `GenreChart` and `YearlyArc` use Framer Motion `motion.div` — GPU-accelerated

### `useCountUp` Performance
- Single RAF loop per counter (not one per frame for all counters)
- Derives display value during render (no extra re-renders)
- Automatically cancelled on unmount

### Bundle Impact
- No new dependencies added in Phase 3
- All new components are tree-shaken
- `ProgressRing` is pure SVG — no library needed

---

## Future Concerns

1. **Daily reading streak:** Requires `reading_history` entries with daily granularity. Phase 4 admin will add this.

2. **Mood distribution:** `stats.moodDistribution` is currently empty `{}`. Requires a join between `titles`, `title_moods`, and `moods`. Can be added as a 7th parallel query in `fetchReadingStatistics`.

3. **Chart library:** The current charts are custom SVG/CSS. For Phase 5, a proper chart library (e.g., Recharts or Victory) could add tooltips, zoom, and more chart types. The current approach is intentionally lightweight.

4. **Achievement progress sync:** Achievement `current_progress` is updated by a database trigger on title changes. If the trigger hasn't run recently, progress may be stale. Phase 4 admin will add a manual "recalculate" button.

---

## Rejected Approaches

### ❌ Recharts / Victory for charts

Adds 30-50KB to the bundle. The custom SVG approach achieves the same visual result with zero dependencies. Phase 5 can upgrade if interactive tooltips are needed.

### ❌ GSAP for number counting

Would work but adds a dependency to the hook layer. The custom RAF approach is simpler and equally performant.

### ❌ Global modal store for badge details

Overkill for a single-modal use case. Local state in `BadgeCard` is simpler and sufficient.

### ❌ Separate queries per rarity for achievements

4× the network round trips for 18 total rows. Single query + JS grouping is faster.

---

## Git Commit Message

```
feat(phase-3): statistics dashboard, achievements, and production polish

Statistics Dashboard:
- services/stats.ts: 6 parallel Supabase queries (reading_statistics view,
  genre_distribution view, monthly_reading view, titles table)
- hooks/useStats.ts: useReadingStatistics, useAchievements
- hooks/useCountUp.ts: RAF-based animated counter, React 19 compliant
  (derives display value during render, no setState in effect body)
- StatCard: animated counter with useInView trigger, staggered entrance
- GenreChart: horizontal bar chart with staggered Framer Motion animation
- TimelineChart: monthly chapters bar chart with animated bars
- ReadingStreak: current + longest streak with animated counters
- YearlyArc: yearly title count as gradient progress bars
- /stats: full page — volume stats, breakdown, genre chart, origin split,
  timeline, yearly arc, streak, achievements

Achievement System:
- services/achievements.ts: fetchAchievements from Supabase
- ProgressRing: SVG stroke-dashoffset circular progress, Framer Motion animated
- BadgeCard: locked/unlocked states, rarity colors, glow effects,
  detail modal with AnimatePresence (progress bar, unlock date)
- BadgeGrid: rarity-grouped (legendary → common), unlocked count summary

Performance & Visual Polish:
- globals.css: content-deferred (content-visibility: auto), card-contained,
  state-empty, state-error CSS utilities
- not-found.tsx: cinematic 404 page with ambient background
- error.tsx: global error boundary with retry button
- All charts: whileInView triggers (only animate when visible)
- Consistent animation timing across all new components

ROADMAP.md: all Phase 3 tasks marked complete
docs/devlog/PHASE_3_STATISTICS_ACHIEVEMENTS.md: architecture decisions
```
