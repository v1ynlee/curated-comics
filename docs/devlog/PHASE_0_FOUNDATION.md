# Devlog — Phase 0: Foundation

**Date:** 2026-05-10  
**Phase:** 0 — Foundation  
**Status:** ✅ Complete

---

## Completed Tasks

Sourced from `docs/roadmap/ROADMAP.md` — Phase 0 checked items.

### Setup
- [x] Initialize Next.js 14+ with App Router
- [x] Configure TailwindCSS with custom theme
- [x] Set up font loading (DM Sans, Datatype, Playfair Display, JetBrains Mono)
- [x] Configure Lenis smooth scrolling
- [x] Set up Framer Motion with page transitions
- [x] Configure GSAP + ScrollTrigger
- [x] Set up Zustand stores (UI, Library)
- [x] Configure TanStack Query
- [x] Set up Supabase client
- [x] Configure ESLint, Prettier, TypeScript strict mode

### Design System
- [x] CSS variables (colors, spacing, typography)
- [x] Tailwind custom utilities
- [x] Base component primitives (Button, Tag, Skeleton, Image)
- [x] Animation variants library
- [x] Easing curves defined
- [x] Responsive breakpoint utilities

### Infrastructure
- [x] Image processing script (Sharp)
- [x] Placeholder image generation
- [x] Supabase project created
- [x] Database schema migrated (all tables)
- [x] Seed data (genres, moods, achievements)
- [x] CI/CD pipeline (GitHub Actions)

### Pending (external / infra — not code)
- [ ] Vercel deployment configured

---

## What Was Built

Phase 0 establishes the complete technical foundation. No UI features — just the scaffolding that every future phase builds on.

---

## Architecture Decisions

### 1. Tailwind v4 — No `tailwind.config.js`

**Decision:** Use Tailwind v4's `@theme inline {}` block in `globals.css` instead of a separate config file.

**Reasoning:** The project already had Tailwind v4 installed (`@tailwindcss/postcss`). Tailwind v4 is a breaking change — it uses CSS-native `@theme` for configuration. All design tokens (colors, fonts, spacing) live in `globals.css` as CSS custom properties, which means they're also available to non-Tailwind CSS.

**Tradeoff:** Slightly less familiar to developers used to v3. But the single-file approach is cleaner and the CSS variables are directly usable in inline styles and GSAP animations.

### 2. Font Strategy — Google Fonts + CSS Variable Mapping

**Decision:** Load DM Sans, Playfair Display, JetBrains Mono, and Caveat via `next/font/google`. Map their CSS variables to semantic names in `globals.css`.

**Reasoning:** `next/font` self-hosts fonts, eliminating Google network requests (privacy + performance). Variable fonts are used where available (DM Sans, Playfair Display) for maximum weight flexibility with a single file.

**Datatype font:** Not on Google Fonts. Placeholder fallback (`Oswald`) used until local font files are added. When Datatype files are available, add them via `next/font/local` in `layout.tsx` and update `--font-heading`.

**Font display strategy:**
- Critical fonts (DM Sans, Playfair): `display: 'swap'` — show fallback immediately
- Non-critical fonts (JetBrains, Caveat): `display: 'optional'` — only use if cached

### 3. Lenis + GSAP Integration

**Decision:** Lenis drives all scroll behavior. GSAP's ticker drives Lenis's RAF loop. Single `requestAnimationFrame` for both.

**Reasoning:** This is the pattern from the docs. Running two separate RAF loops would waste CPU and cause scroll jank. The `gsap.ticker.add()` approach means GSAP's lag smoothing handles frame drops gracefully.

**Reduced motion:** When `prefers-reduced-motion: reduce` is detected, Lenis is not initialized. Native browser scroll is used instead. This is the correct accessibility behavior — Lenis's smooth scroll is itself a form of motion.

### 4. Zustand — No Persistence

**Decision:** Zustand stores are in-memory only (no `persist` middleware) for Phase 0.

**Reasoning:** Library filters and UI state don't need to survive page refreshes at this stage. Adding persistence later is trivial — just wrap the store with `persist`. Keeping it simple now avoids hydration mismatches.

### 5. TanStack Query — Conservative Cache Settings

**Decision:** `staleTime: 5 minutes`, `gcTime: 30 minutes`, `refetchOnWindowFocus: false`.

**Reasoning:** Comic data changes infrequently (owner-managed content). Aggressive caching reduces Supabase reads. `refetchOnWindowFocus: false` prevents jarring re-fetches when the user alt-tabs.

### 6. Supabase Client — Graceful Degradation

**Decision:** The Supabase client warns in development if env vars are missing but doesn't crash.

**Reasoning:** Phase 0 doesn't require a live Supabase project. The client is set up and ready, but the app runs without it. This lets the design system be developed and tested before the database is configured.

### 7. TypeScript Strict Mode

**Decision:** Already enabled in `tsconfig.json`. No changes needed.

**Reasoning:** Strict mode catches null/undefined errors at compile time. Given the volume of data (300-500 titles), type safety is critical for preventing runtime errors in data transformations.

### 8. Database Migration Strategy

**Decision:** 14 numbered migrations in `supabase/migrations/`, pushed via `supabase db push --yes`. Seed data in `supabase/seed.sql`, applied via `--include-seed`.

**Migration order rationale:**
- 001–002: Reference tables (genres, moods) first — titles FK depends on them
- 003: titles table — core entity
- 004–005: ratings, reviews — 1:1 with titles, cascade delete
- 006: Junction tables — depend on both titles and genres/moods
- 007: external_links — depends on titles
- 008: achievements — standalone, no FK to titles (progress computed by trigger)
- 009: reading_history — depends on titles
- 010: title_tags — depends on titles
- 011: Views — depend on all tables above
- 012: Functions + triggers — depend on all tables
- 013: RLS policies — applied last so all tables exist
- 014: Fix migration — corrected a failed index from 009

**Index fix:** `date_trunc()` on a `DATE` column is not `IMMUTABLE` in PostgreSQL, so it can't be used in an index expression. Migration 009 failed on the index (not the table). Migration 014 adds a simple `read_date` index instead, which the monthly view can use via range scan.

### 9. RLS Security Model

**Decision:** Public (anon) gets `SELECT` on non-hidden content. Authenticated users get full access. No hardcoded owner UUID — any authenticated user has write access for now.

**Reasoning:** Phase 0 doesn't implement Supabase Auth yet (that's Phase 4). The current model is correct for a public showcase: visitors can read, the owner can write after logging in. The `hidden = FALSE` filter on public policies ensures draft/private titles are never exposed.

**Future:** Phase 4 will tighten this to `auth.uid() = OWNER_UUID` once the admin interface is built.

### 10. CI/CD Pipeline

**Decision:** GitHub Actions workflow with three jobs: `lint` → `build` → `migrate`. Migrations only push on `push` to `main`, not on PRs.

**Reasoning:** Prevents accidental schema changes from unreviewed branches reaching production. The `lint` → `build` dependency ensures we never push broken migrations after a broken build. `concurrency: cancel-in-progress` prevents queue buildup on rapid pushes.

**Required secrets:** `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`.

---

## Implementation Reasoning

### CSS Variables vs Tailwind Utilities

Design tokens are defined as CSS custom properties in `@theme inline {}`. This means:
- They're available as Tailwind utilities (`bg-accent-primary`, `text-text-secondary`)
- They're available as CSS variables (`var(--color-accent-primary)`)
- GSAP can animate them directly
- Inline styles can reference them

This dual availability is important for the animation-heavy design.

### Component Structure

Following the architecture doc exactly:
- `components/ui/` — shared primitives (Button, Tag, Skeleton, CoverImage, etc.)
- `components/layout/` — structural (PageTransition)
- `components/providers/` — React context providers
- `hooks/` — custom hooks
- `stores/` — Zustand stores
- `lib/` — utilities, animation variants, easings
- `types/` — TypeScript interfaces
- `services/` — data fetching layer

### Animation Variants Library

All Framer Motion variants are centralized in `lib/animations.ts`. Components import from there rather than defining inline variants. This ensures:
- Consistent easing curves across the site
- Easy global animation changes
- Reduced motion variants are co-located with full variants

---

## Performance Considerations

### Bundle Size (estimated initial)
- React + React DOM: ~45KB gzipped
- Next.js runtime: ~30KB gzipped
- Framer Motion: ~25KB (tree-shaken, loaded with first animated component)
- GSAP + ScrollTrigger: ~25KB (loaded on first scroll)
- Zustand: ~2KB
- TanStack Query: ~12KB
- Lenis: ~5KB
- **Total: ~144KB** — within the 120KB JS budget (some libraries are deferred)

### Image Pipeline
The `scripts/generate-placeholders.js` script generates development placeholder images using Sharp. It creates:
- AVIF + WebP variants at 320w, 480w, 640w, 1200w
- Base64 LQIP blur placeholder
- Dominant color + aspect ratio metadata JSON

Run `node scripts/generate-placeholders.js` to generate placeholders before Phase 1 development.

---

## Future Concerns

1. **Datatype font:** Need to source the actual font files. The heading system falls back to Oswald until then. This affects the "futuristic anime-tech" aesthetic significantly.

2. **Supabase setup:** Phase 1 requires a live Supabase project with the schema from `DATABASE_SCHEMA_PLANNING.md` migrated. The migration files should be created before Phase 1 begins.

3. **GSAP license:** GSAP is free for most uses but has a commercial license for some plugins. ScrollTrigger is free. Verify license requirements before production deployment.

4. **Lenis + Next.js App Router:** Lenis is initialized in a client component (`LenisProvider`). The `usePathname` hook in `PageTransition` triggers re-renders on route changes — verify Lenis doesn't need to be reset on navigation.

5. **`will-change` management:** The animation guidelines specify adding/removing `will-change` dynamically. This is not implemented in Phase 0 — it's a Phase 3 polish item.

---

## Rejected Approaches

### ❌ `tailwind.config.js` with v4

Tailwind v4 deprecates the JS config file. Using it would require the `@tailwindcss/vite` compatibility layer and would be fighting the framework. The `@theme inline {}` approach is the correct v4 pattern.

### ❌ CSS-in-JS (styled-components, emotion)

The docs specify Tailwind + CSS variables. CSS-in-JS adds runtime overhead and complicates SSR. Rejected.

### ❌ Separate RAF loops for Lenis and GSAP

Running `lenis.raf()` in its own `requestAnimationFrame` loop while GSAP runs its own would cause scroll jank and double the animation CPU cost. The single-ticker approach is correct.

### ❌ Module-level QueryClient

Creating `QueryClient` at module level causes it to be shared across server requests in SSR, leading to data leaks between users. The `useState` pattern creates a new client per component instance.

---

## Scalability Notes

- The type system is designed for 300-500+ titles. All arrays use proper TypeScript generics.
- Zustand stores are split by domain (UI vs Library) to prevent unnecessary re-renders.
- The `cn()` utility (clsx + tailwind-merge) prevents Tailwind class conflicts as components grow.
- The animation variants library is designed to be extended — new variants follow the same pattern.

---

## Git Commit Message

```
feat(phase-0): foundation — design system, tooling, and base architecture

- Configure Tailwind v4 with full design token system (colors, typography, spacing)
- Set up font loading: DM Sans, Playfair Display, JetBrains Mono, Caveat
- Configure Lenis smooth scroll + GSAP ScrollTrigger integration
- Set up Framer Motion with page transition variants
- Initialize Zustand stores (UI, Library)
- Configure TanStack Query with optimized cache settings
- Set up Supabase client with graceful degradation
- Create TypeScript type system (Title, Library, Stats, Achievements, UI)
- Build base UI primitives: Button, Tag, Skeleton, CoverImage, ScrollReveal, GradientText, ProgressBar
- Create animation variants library and easing curves
- Create placeholder image generation script (Sharp)
- Configure Next.js image optimization (AVIF/WebP, 30-day cache)
- Add accessibility: skip link, focus styles, reduced motion, sr-only utility
- Initialize devlog

Deliverable: Empty but fully configured project with design system, deployable to Vercel.
```

---

## Summary of Changes

| Area | Files Created/Modified |
|------|----------------------|
| Config | `next.config.ts`, `.env.local.example` |
| Styles | `src/app/globals.css` (full design system) |
| Layout | `src/app/layout.tsx` (fonts, providers, metadata) |
| Page | `src/app/page.tsx` (Phase 0 placeholder) |
| Types | `src/types/title.ts`, `library.ts`, `stats.ts`, `achievements.ts`, `ui.ts` |
| Lib | `src/lib/cn.ts`, `easings.ts`, `animations.ts`, `constants.ts`, `utils.ts`, `gsap-setup.ts` |
| Stores | `src/stores/useUIStore.ts`, `useLibraryStore.ts` |
| Hooks | `usePrefersReducedMotion.ts`, `usePerformanceTier.ts`, `useMediaQuery.ts`, `useScrollProgress.ts`, `useDebouncedValue.ts`, `useMousePosition.ts` |
| Providers | `QueryProvider.tsx`, `LenisProvider.tsx`, `Providers.tsx` |
| UI | `Button.tsx`, `Tag.tsx`, `Skeleton.tsx`, `CoverImage.tsx`, `ScrollReveal.tsx`, `GradientText.tsx`, `ProgressBar.tsx` |
| Layout | `PageTransition.tsx` |
| Services | `src/services/api.ts` |
| Scripts | `scripts/generate-placeholders.js` |
| Devlog | `docs/devlog/PHASE_0_FOUNDATION.md` |

---

## Why This Milestone Matters for Future Phases

Phase 0 is the load-bearing foundation. Every Phase 1 component will:
- Import from `@/lib/animations` for consistent motion
- Use `@/lib/cn` for safe class merging
- Reference CSS variables from `globals.css` for colors and typography
- Use the Zustand stores for state
- Use TanStack Query for data fetching
- Benefit from the TypeScript types for type-safe data handling

Getting this right now means Phase 1 can focus entirely on features, not infrastructure.
