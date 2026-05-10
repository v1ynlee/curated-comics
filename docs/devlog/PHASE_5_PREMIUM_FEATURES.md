# Devlog — Phase 5: Premium Features

**Date:** 2026-05-10
**Phase:** 5 — Premium Features
**Status:** ✅ Complete (implemented features)

---

## Completed Tasks

### Implemented
- [x] RSS feed for new additions
- [x] Social sharing cards (dynamic OG images)
- [x] PWA with offline support
- [x] Search with fuzzy matching
- [x] Keyboard shortcuts
- [x] Custom 404 page (cinematic) ← completed in Phase 3
- [x] Easter eggs and hidden interactions

### Deferred (no assets/dependencies available)
- [ ] WebGL background effects (React Three Fiber) — heavy dep, no design assets
- [ ] Custom shader backgrounds — requires GLSL expertise + assets
- [ ] Audio micro-interactions — no audio assets
- [ ] Seasonal theme variants — no seasonal design assets
- [ ] Reading progress sync — requires user accounts (Phase 4+ scope)
- [ ] Newsletter integration — requires third-party service setup

---

## What Was Built

### New Routes
| Route | Type | Description |
|-------|------|-------------|
| `/search` | Static (client) | Fuzzy title search with debounced input |
| `/feed.xml` | Static (ISR 1h) | RSS 2.0 feed of recent titles |
| `/offline` | Static | PWA offline fallback page |
| `/opengraph-image` | Edge | Default site OG image |
| `/title/[slug]/opengraph-image` | Edge | Per-title dynamic OG image |
| `/manifest.webmanifest` | Static | PWA web app manifest |

### New Files
| File | Purpose |
|------|---------|
| `src/app/opengraph-image.tsx` | Default OG image (gradient + site title) |
| `src/app/title/[slug]/opengraph-image.tsx` | Per-title OG (dominant color + title + rating + tier) |
| `src/app/feed.xml/route.ts` | RSS 2.0 feed, 1h revalidation |
| `src/app/search/page.tsx` | Search page with debounced Supabase full-text search |
| `src/app/manifest.ts` | PWA manifest with shortcuts |
| `src/app/offline/page.tsx` | Offline fallback page |
| `public/sw.js` | Service worker (cache-first static, network-first HTML) |
| `src/hooks/useKeyboardShortcuts.ts` | Global keyboard shortcuts (/, g+h/l/d/t/s, ?) |
| `src/hooks/useKonamiCode.ts` | Konami code detector |
| `src/components/ui/KeyboardShortcutsHelp.tsx` | Shortcuts help modal (triggered by ?) |
| `src/components/cinematic/EasterEgg.tsx` | Konami code celebration toast |
| `src/components/providers/KeyboardShortcutsProvider.tsx` | Client wrapper for keyboard shortcuts hook |
| `src/components/providers/ServiceWorkerRegistration.tsx` | PWA SW registration (production only) |

### Modified Files
| File | Change |
|------|--------|
| `src/app/layout.tsx` | Added RSS link, PWA meta, EasterEgg, KeyboardShortcutsHelp, ServiceWorkerRegistration |
| `src/components/providers/Providers.tsx` | Added KeyboardShortcutsProvider |
| `src/components/layout/Navigation.tsx` | Added search icon button |

---

## Architecture Decisions

### 1. Dynamic OG Images — Next.js ImageResponse (Edge Runtime)

**Decision:** Used Next.js built-in `ImageResponse` from `next/og` with `runtime = 'edge'`.

**Reasoning:** No external service needed. `ImageResponse` renders JSX to a PNG using Satori (built into Next.js). The edge runtime means it runs at the CDN edge — fast globally. The per-title OG image uses the title's dominant color as the background, creating a unique image for every title.

**Tradeoff:** Edge runtime disables static generation for the OG image route (build warning). This is expected and correct — OG images are generated on-demand and cached by the CDN.

### 2. RSS Feed — Route Handler with ISR

**Decision:** `/feed.xml` is a Route Handler with `export const revalidate = 3600` (1 hour ISR).

**Reasoning:** RSS feeds should be fresh but don't need real-time updates. 1-hour revalidation means new titles appear in the feed within an hour of being added. The feed is cached by Next.js and served from the CDN.

**Format:** RSS 2.0 (not Atom) for maximum reader compatibility. Includes title, link, description, categories (genres), and rating.

### 3. Search — Supabase Full-Text Search

**Decision:** Reused the existing `useTitles` hook with `filters.search` — no new search infrastructure.

**Reasoning:** Supabase's `textSearch` with `type: 'websearch'` supports fuzzy matching via PostgreSQL's `websearch_to_tsquery`. The GIN index on `titles` (created in Phase 0 migration 003) makes this fast. The search page debounces input by 300ms to avoid excessive queries.

**Limitation:** Full-text search only covers `title_english`, `title_original`, `synopsis`, and `vibe_check` (the GIN index columns). Genre names and mood names are not searchable. Phase 5+ enhancement: add a separate search endpoint that queries across all fields.

### 4. Keyboard Shortcuts — Two-Key Sequences

**Decision:** Implemented "g + X" navigation shortcuts (vim-style) using a `pendingKey` ref with a 1-second timeout.

**Reasoning:** Single-key shortcuts conflict with browser defaults and text input. Two-key sequences (g+h for "go home") are a well-established pattern (GitHub, Gmail) that avoids conflicts. The 1-second timeout prevents accidental activation.

**Accessibility:** Shortcuts are disabled when focus is inside an input/textarea/select. Escape always blurs the focused element. The `?` key opens a help modal listing all shortcuts.

### 5. PWA — Manual Service Worker (No next-pwa)

**Decision:** Wrote a manual `public/sw.js` instead of using `next-pwa`.

**Reasoning:** `next-pwa` adds ~50KB to the bundle and has complex configuration. The manual service worker is ~80 lines and does exactly what's needed: cache-first for static assets, network-first for HTML pages, network-only for API/Supabase calls.

**Registration:** Only registers in production (`process.env.NODE_ENV === 'production'`). In development, the service worker would cache stale Next.js chunks and cause confusing behavior.

### 6. Easter Egg — Konami Code

**Decision:** Classic Konami code (↑↑↓↓←→←→BA) triggers a toast notification with a random message.

**Reasoning:** The Konami code is universally recognized by gamers — the target audience for a manhwa/manga site. It's a fun reward for curious visitors. The implementation is ~30 lines with no dependencies.

**Reduced motion:** The particle burst animation is disabled when `prefers-reduced-motion` is active. The toast itself still appears (it's just opacity, not motion).

---

## Performance Considerations

### OG Images
- Edge runtime: generated at CDN edge, cached by CDN
- No external image service needed
- Per-title images use dominant color from the database (no image processing at OG time)

### RSS Feed
- 1-hour ISR: cached by Next.js, served from CDN
- Fetches 50 titles max — lightweight query
- XML escaping prevents injection

### Search
- 300ms debounce prevents excessive Supabase queries
- GIN index on titles table makes full-text search fast
- `keepPreviousData` prevents grid flash during typing

### Service Worker
- Only caches static assets and HTML pages
- Never caches Supabase API calls (dynamic data)
- Cache-first for `/_next/static/` (immutable hashes)
- Network-first for HTML (always fresh content)

---

## Future Concerns

1. **WebGL backgrounds:** React Three Fiber + custom shaders would add ~200KB to the bundle. Worth implementing if the site gets significant traffic and the visual impact justifies the cost.

2. **Search across all fields:** Current search only covers title text fields. A proper search would include genres, moods, tags, and review text. Requires a Supabase Edge Function or a dedicated search service (Algolia, Typesense).

3. **PWA icon assets:** The manifest references `/icons/icon-192.png` and `/icons/icon-512.png` which don't exist yet. Need to create these from the CC monogram logo.

4. **Seasonal themes:** Would require CSS variable overrides per season. The `@theme inline` approach makes this straightforward — just swap the color variables. No implementation without design assets.

5. **Newsletter:** Would require Mailchimp/ConvertKit integration. Out of scope without a service account.

---

## Rejected Approaches

### ❌ next-pwa for service worker

Adds ~50KB bundle overhead and complex configuration for what is essentially 80 lines of vanilla JS. Manual service worker is simpler and more controllable.

### ❌ Algolia for search

Requires a paid service account and API key management. Supabase full-text search is sufficient for a personal archive of 300-500 titles.

### ❌ React Three Fiber for WebGL

Adds ~200KB to the bundle. The CSS-only particle system already achieves the atmospheric effect. R3F is worth adding only if custom shaders are designed.

---

## Git Commit Message

```
feat(phase-5): premium features — OG images, RSS, search, PWA, shortcuts, easter egg

Dynamic OG Images:
- /opengraph-image: default site OG (gradient + title, edge runtime)
- /title/[slug]/opengraph-image: per-title OG with dominant color backdrop,
  title name, rating, tier badge (edge runtime, cached by CDN)

RSS Feed:
- /feed.xml: RSS 2.0 route handler, 1h ISR revalidation
  includes title, link, description, genre categories, rating

Search:
- /search: fuzzy title search using Supabase full-text (websearch mode)
  300ms debounced input, AnimatePresence transitions, empty/loading states

PWA:
- /manifest.webmanifest: web app manifest with shortcuts (library, discover, stats)
- public/sw.js: manual service worker (cache-first static, network-first HTML,
  network-only for Supabase/API, production-only registration)
- /offline: offline fallback page

Keyboard Shortcuts:
- useKeyboardShortcuts: / (search), g+h/l/d/t/s (navigation), ? (help)
  disabled in inputs, 1s timeout for two-key sequences
- KeyboardShortcutsHelp: modal listing all shortcuts, triggered by ?
- KeyboardShortcutsProvider: client wrapper in Providers tree

Easter Egg:
- useKonamiCode: ↑↑↓↓←→←→BA detector
- EasterEgg: toast notification with random message + particle burst
  reduced-motion safe (particles disabled, toast still shows)

Navigation:
- Added search icon button to desktop Navigation
- Added RSS link + PWA meta to root layout head
- Added EasterEgg, KeyboardShortcutsHelp, ServiceWorkerRegistration to layout

ROADMAP.md: implemented Phase 5 tasks marked complete
docs/devlog/PHASE_5_PREMIUM_FEATURES.md: architecture decisions
```
