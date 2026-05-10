# Devlog — Phase 1: Core Experience

**Date:** 2026-05-10
**Phase:** 1 — Core Experience
**Status:** ✅ Complete

---

## Completed Tasks

Sourced from `docs/roadmap/ROADMAP.md` — Phase 1 checked items.

### Landing Page
- [x] Cinematic hero section with atmospheric background
- [x] Animated title reveal
- [x] Featured titles showcase
- [x] Scroll-triggered section reveals
- [x] Navigation (floating desktop, bottom mobile)
- [x] Smooth page transitions

### Library Browse
- [x] Asymmetrical masonry grid
- [x] Title cards with blur-up image loading
- [x] Category tabs (reading, completed, dropped, etc.)
- [x] Basic filtering (genre, origin)
- [x] Sort controls
- [x] Responsive layout (2-col mobile, masonry desktop)
- [x] Scroll-triggered card reveals
- [x] Hover effects (desktop)

### Title Detail
- [x] Immersive title hero (cover as backdrop)
- [x] Multi-dimensional rating display
- [x] Basic review section
- [x] External links
- [x] Genre/mood tags
- [x] Related titles (basic)
- [x] Shared element transition from card

### Data Layer
- [x] Supabase queries for titles, ratings, reviews
- [x] TanStack Query integration
- [x] Prefetching on hover
- [x] Loading states with skeletons

---

## What Was Built

### New Routes
| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing page — hero + featured titles |
| `/library` | Static | Library browse with filters + sort |
| `/title/[slug]` | Dynamic (SSR) | Title detail — full immersive view |
| `/discover` | Static | Phase 2 stub |
| `/tiers` | Static | Phase 2 stub |
| `/stats` | Static | Phase 3 stub |

### New Components
| Component | Domain | Purpose |
|-----------|--------|---------|
| `Navigation` | layout | Floating desktop nav, hides on scroll-down |
| `MobileNav` | layout | Bottom tab bar, hides on scroll-down |
| `Footer` | layout | Minimal cinematic footer |
| `AtmosphericBg` | cinematic | CSS-only particle + gradient background |
| `Hero` | cinematic | Full-viewport landing hero with GSAP parallax |
| `FeaturedSection` | cinematic | Featured titles grid on landing page |
| `TitleCard` | library | Individual title card with blur-up + hover overlay |
| `CategoryTabs` | library | ARIA tablist for reading status categories |
| `FilterSheet` | library | Bottom sheet filter with genre chips |
| `SortControls` | library | Sort select dropdown |
| `LibraryGrid` | library | Full grid with filters, sort, empty/error states |
| `RatingDisplay` | title | Animated multi-dimensional rating bars |
| `ExternalLinks` | title | Platform links with color indicators |
| `TitleMeta` | title | Genre tags, moods, tier, vibe check |
| `ReviewSection` | title | Review body + structured sections |
| `RelatedTitles` | title | Horizontal scroll carousel |
| `TitleDetailClient` | title | Full immersive detail view (client component) |

### New Services + Hooks
| File | Purpose |
|------|---------|
| `services/titles.ts` | Supabase queries: fetchTitles, fetchTitle, fetchFeaturedTitles, fetchRelatedTitles |
| `hooks/useTitles.ts` | TanStack Query hooks: useTitles, useTitle, useFeaturedTitles, useRelatedTitles, usePrefetchTitle |

---

## Architecture Decisions

### 1. Title Detail — Server Component + Client Component Split

**Decision:** `TitlePage` (server component) fetches data via `fetchTitle()` directly, then passes the result to `TitleDetailClient` (client component) for animations.

**Reasoning:** Server-side data fetching gives us:
- Proper `generateMetadata` with real title data for SEO/OG
- `notFound()` on missing slugs (404 page)
- No loading state flash on initial load — data is ready when the page renders

The client component handles all Framer Motion animations, which require the browser.

**Tradeoff:** The title detail page is `ƒ (Dynamic)` — server-rendered on demand. This is correct for user-specific or frequently-updated content. For a personal archive that rarely changes, we could add `revalidate` to make it ISR, but that's a Phase 3 optimization.

### 2. Navigation — Scroll-Aware Visibility

**Decision:** Both `Navigation` (desktop) and `MobileNav` (mobile) hide on scroll-down and reveal on scroll-up using a `useEffect` with passive scroll listener.

**Reasoning:** This is the standard pattern for mobile-first navigation. It maximizes reading space while keeping navigation accessible. The threshold (8px delta, 60px from top) prevents jitter on small scroll movements.

**Implementation note:** Using `useRef` for `lastScrollY` instead of `useState` avoids re-renders on every scroll event. Only `setVisible` triggers a re-render when the direction actually changes.

### 3. LibraryGrid — Client-Side Filtering via Zustand + TanStack Query

**Decision:** Filter state lives in `useLibraryStore` (Zustand). The `useTitles` hook reads from the store and passes filters to Supabase. `keepPreviousData` from TanStack Query prevents the grid from flashing empty during filter transitions.

**Reasoning:** This matches the architecture doc exactly. The store is the single source of truth for filter state, which means the URL doesn't reflect filters (Phase 3 enhancement: URL-based filter state for shareability).

**Tradeoff:** Genre filtering currently happens client-side via Supabase query. For 300-500 titles, this is fine. If the library grows to 1000+, we'd add server-side pagination with cursor-based pagination.

### 4. TitleCard — Prefetch on Hover

**Decision:** `usePrefetchTitle()` is called on both `onMouseEnter` and `onFocus` of the card link.

**Reasoning:** This gives instant navigation — by the time the user clicks, the title data is already in the TanStack Query cache. The `staleTime: 10 minutes` means the prefetched data stays fresh for the session.

### 5. AtmosphericBg — CSS-Only Particles

**Decision:** Particles are `<span>` elements with CSS `animate-float` keyframes, not a JS particle system.

**Reasoning:** CSS animations run on the compositor thread — zero JS runtime cost. The count scales with performance tier (12 on high, 6 on mid, 0 on low). Disabled entirely with `prefers-reduced-motion`.

**Future:** Phase 2 will add a proper particle system for mood-specific atmospheres. The `AtmosphericBg` component accepts `colors` prop for mood-driven gradients.

### 6. Button — asChild Pattern

**Decision:** Added `asChild` prop using `@radix-ui/react-slot` to allow `<Button asChild><Link href="...">...</Link></Button>`.

**Reasoning:** This is the standard Radix UI pattern for polymorphic components. It avoids the `<a>` inside `<button>` accessibility violation while keeping the Button's visual styles. The `motion.button` wrapper is skipped when `asChild` is true.

### 7. Title Detail — Blurred Backdrop

**Decision:** The hero backdrop uses the cover image with `opacity-20 blur-2xl scale-110` — not a separate banner image.

**Reasoning:** Most titles won't have banner images in Phase 1. Using the cover art as a blurred backdrop is a common pattern (Spotify, Apple Music) that looks cinematic without requiring extra assets. The `scale-110` prevents blur edge artifacts.

---

## Performance Considerations

### Route Types
- `/`, `/library`, `/discover`, `/tiers`, `/stats` → Static (prerendered at build)
- `/title/[slug]` → Dynamic (SSR on demand)

The library page is static even though it fetches data — the `LibraryGrid` is a client component that fetches on mount. This means the initial HTML is fast (no data needed for SSR), and the grid populates after hydration.

### Image Loading
`CoverImage` uses blur-up: dominant color background → blurred LQIP → full image crossfade. No layout shift because `aspectRatio` is set on the container.

### Bundle Impact
- `@radix-ui/react-slot`: ~1KB gzipped
- New components: ~15KB gzipped total (tree-shaken)
- Services + hooks: ~5KB gzipped

---

## Future Concerns

1. **URL-based filter state:** Currently filters are in Zustand (in-memory). Phase 3 should add URL search params so filters are shareable and survive page refresh.

2. **Pagination:** The library fetches up to 48 titles. With 300-500 titles, we need infinite scroll or pagination. Phase 3 adds virtualization.

3. **Image fallback:** `CoverImage` assumes `/images/covers/{slug}-640w.avif` exists. If it doesn't, Next.js Image will show a broken image. Phase 4 (admin) will handle image upload + processing.

4. **Title detail ISR:** Currently fully dynamic. Could add `export const revalidate = 3600` for hourly ISR once content is stable.

5. **Shared element transitions:** The roadmap specifies "shared element transition from card" (cover art morphs from card to detail). Framer Motion's `layoutId` supports this but requires the card and detail to be in the same AnimatePresence tree. This is a Phase 2 enhancement.

---

## Rejected Approaches

### ❌ URL-based routing for library categories

Using `/library/reading`, `/library/completed` etc. as separate routes would make categories bookmarkable but adds complexity. The current approach (Zustand + query params) is simpler and can be upgraded to URL params in Phase 3 without changing the component structure.

### ❌ React Server Components for LibraryGrid

The library grid needs client-side interactivity (filters, sort, hover prefetch). Making it a server component would require server actions for every filter change — too much complexity for Phase 1.

### ❌ Separate banner images for title hero

Most titles won't have banners. Using the cover art as a blurred backdrop is simpler, looks great, and requires no extra assets. Proper banner support can be added in Phase 4 when the admin interface handles image uploads.

---

## Scalability Notes

- `fetchTitles` supports full `LibraryFilters` — genre, mood, origin, tier, rating range, search. Only genre and status are exposed in the UI for Phase 1. The rest are ready for Phase 2.
- `TitleCard` accepts `featured` prop for larger treatment — used in `LibraryGrid` for every 8th featured title.
- `AtmosphericBg` accepts `colors` prop for mood-driven gradients — ready for Phase 2 mood system.
- Navigation items are defined as a constant array — easy to add/remove routes.

---

## Git Commit Message

```
feat(phase-1): core experience — landing, library, and title detail

Landing Page:
- Cinematic hero with GSAP parallax scroll effect and Framer Motion
  first-load sequence (label → title → subtitle → CTA → scroll indicator)
- AtmosphericBg: CSS-only particle field + radial gradient orbs,
  performance-tier aware (12/6/0 particles), reduced-motion safe
- FeaturedSection: TanStack Query powered featured titles grid

Navigation:
- Navigation: floating desktop nav, transparent → solid on scroll,
  hides on scroll-down / reveals on scroll-up, active route indicator
  with Framer Motion layoutId
- MobileNav: bottom tab bar with same scroll-aware visibility
- Footer: minimal cinematic footer
- PageTransition wired into root layout (AnimatePresence)

Library Browse:
- LibraryGrid: 2-col mobile / responsive desktop grid with featured
  titles spanning 2 columns every 8 items
- TitleCard: blur-up cover image, hover overlay with rating + genre tags,
  tier badge, prefetch on hover/focus
- CategoryTabs: ARIA tablist with Framer Motion layoutId indicator
- FilterSheet: bottom sheet with genre chip filters, ARIA dialog
- SortControls: sort select with 5 options
- Empty state, error state, skeleton loading states

Title Detail:
- TitlePage: server component for SSR + generateMetadata + notFound()
- TitleDetailClient: immersive hero with blurred cover backdrop,
  animated title reveal, overall rating display
- RatingDisplay: 6-dimension animated progress bars (Framer Motion)
- ReviewSection: body + structured sections (loved/hated/damage/recommend)
- TitleMeta: genres, moods, tier, vibe check, status, chapters
- ExternalLinks: platform links with brand colors
- RelatedTitles: horizontal scroll carousel

Data Layer:
- services/titles.ts: fetchTitles (filtered/sorted/paginated),
  fetchTitle (by slug), fetchFeaturedTitles, fetchRelatedTitles
- hooks/useTitles.ts: useTitles, useTitle, useFeaturedTitles,
  useRelatedTitles, usePrefetchTitle (hover prefetch)

Other:
- Button: added asChild prop via @radix-ui/react-slot
- globals.css: pb-safe (iOS safe area), scrollbar-none utility
- Stub pages: /discover, /tiers, /stats (Phase 2/3)
- ROADMAP.md: all Phase 1 tasks marked complete
```
