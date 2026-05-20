# Studio Technical Audit — Findings & Recommendations

## Date: 2026-05-17
## Target: `/studio/*` routes (all pages)
## Score: 16/40 (Poor — major UX overhaul required)

---

## 1. Accessibility Audit

### What's Good
- ✅ Skip-to-content link present in StudioShell
- ✅ `aria-current="page"` on active nav items
- ✅ `aria-label` on icon-only buttons
- ✅ `aria-hidden="true"` on decorative icons
- ✅ Focus-visible outlines using accent-primary
- ✅ `role="navigation"` with descriptive `aria-label`
- ✅ Proper heading hierarchy (h1 per page, h2 for sections)
- ✅ `prefers-reduced-motion` respected in StudioPageTransition

### Issues Found

| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| P1 | Delete button has no `aria-describedby` warning about destructive nature | Articles page | Add `aria-describedby` pointing to a visually-hidden warning text |
| P1 | Navigation only discoverable via avatar icon (poor screen reader UX) | StudioHeader | Replace with visible nav (Phase 1 fixes this) |
| P2 | Filter `<select>` elements have no visible label (only `aria-label`) | Titles page | Add visible `<label>` elements or fieldset legend |
| P2 | Activity feed images use `unoptimized` prop — no explicit width/height causes CLS | ActivityFeed | Add explicit dimensions or aspect-ratio container |
| P2 | No `aria-live` region for dynamic content updates (filter results, toast messages) | Multiple pages | Add `aria-live="polite"` to results container |
| P3 | Color-only state indication on series status dots | Titles page | Add text label alongside dot (already present, but dot alone is insufficient for color-blind users) |

### WCAG 2.1 AA Compliance Summary
- **Perceivable:** Mostly compliant. Color contrast meets AA on dark theme. Missing alt text on some media thumbnails.
- **Operable:** Keyboard navigation works for most flows. Missing keyboard shortcuts for efficiency.
- **Understandable:** Language is clear. Error prevention is critically lacking (no confirmation on delete).
- **Robust:** Semantic HTML is well-structured. ARIA usage is above average.

---

## 2. Performance Audit

### Current State
- Studio pages are Server Components (good — no client JS for initial render)
- `StudioShell` and `StudioPageTransition` are client components (necessary for auth check + animation)
- Images in ActivityFeed use `unoptimized` (bypasses Next.js image optimization)
- No lazy loading on below-fold content
- Titles page loads ALL titles at once (no pagination)

### Recommendations

| Priority | Issue | Impact | Fix |
|----------|-------|--------|-----|
| P1 | Titles page loads all titles without pagination | Slow on 300+ titles | Add cursor-based pagination (load 50 at a time) |
| P2 | ActivityFeed images bypass optimization | Larger payloads, no responsive sizing | Remove `unoptimized` prop, use proper `sizes` attribute |
| P2 | No skeleton loading states | Perceived slowness on data fetch | Add Suspense boundaries with skeleton fallbacks |
| P3 | Media page loads all assets then slices to 20 | Unnecessary data transfer | Limit query to 20 per section with "Load more" |
| P3 | Filters on Titles page cause full page reload | Slow filter interaction | Convert to client-side filtering with URL sync |

### Bundle Size Concerns
- `framer-motion` loaded for StudioPageTransition (acceptable — shared with public site)
- `@radix-ui/react-dropdown-menu` for user menu (small, tree-shakeable)
- `@tiptap/react` + `@tiptap/starter-kit` for article editor (heavy — ensure code-split)
- `lucide-react` icons (tree-shakeable, no concern)

---

## 3. Responsive Audit

### Current Breakpoint Behavior

| Page | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|------|-----------------|---------------------|-------------------|
| Dashboard | ✅ Stacks correctly | ⚠️ 2-col grid but cramped | ✅ 3-col grid |
| Titles | ✅ 2-col grid | ✅ 3-col grid | ✅ 5-col grid |
| Articles | ✅ Stacks card content | ⚠️ Actions row wraps awkwardly | ✅ Inline layout |
| Media | ✅ 2-col thumbnails | ✅ 3-col | ✅ 5-col |
| Curation | ❓ Depends on CurationInterface | ❓ | ❓ |

### Issues

| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| P1 | Mobile navigation is a hamburger drawer (StudioNav) that won't exist after overhaul | Mobile | Phase 1 activates MobileNav with Studio items |
| P2 | Article action buttons (Edit/Archive/Delete) crowd on mobile | Articles | Move to overflow menu on mobile |
| P2 | Filter selects on Titles page don't wrap well on narrow screens | Titles | Use a collapsible filter panel on mobile |
| P3 | Dashboard stat cards at tablet width (2-col) leave odd spacing | Dashboard | Phase 2 replaces with summary bar (no grid) |

### Touch Target Compliance
- ✅ Most buttons meet 44×44px minimum (explicit `min-h-[44px] min-w-[44px]` on mobile header)
- ⚠️ Article action buttons are `px-3 py-1.5` — likely under 44px height on mobile
- ⚠️ Filter select elements have `py-2` — borderline at ~36px

---

## 4. Design Pattern Violations

### Banned Patterns Found

| Pattern | Location | Severity | Fix |
|---------|----------|----------|-----|
| Hero-metric template (big number + small label × 6) | Dashboard OverviewCard | P1 | Replace with compact summary bar |
| Identical card grids (same-sized cards repeated) | Dashboard Quick Actions | P2 | Replace with button row |
| Identical card grids (same-sized cards repeated) | Dashboard Overview | P1 | Replace with summary bar |
| `font-display` (Playfair serif) in UI headings | All Studio pages (`font-display text-3xl`) | P2 | Switch to `font-heading` |

### Product Register Violations

| Rule | Violation | Location | Fix |
|------|-----------|----------|-----|
| "No orchestrated page-load sequences" | StudioPageTransition adds blur+slide on every navigation | All pages | Reduce to opacity-only, 150ms max |
| "Display fonts in UI labels" | Playfair Display used for page h1 headings | All pages | Use font-heading (Datatype/Oswald) |
| "Decorative motion that doesn't convey state" | Page transition blur effect is decorative | StudioPageTransition | Simplify to instant or 150ms opacity |
| "Inconsistent component vocabulary" | StudioNav exists but isn't used; StudioHeader has its own nav | Components | Remove dead code (Phase 1) |

---

## 5. Information Architecture

### Current IA
```
Studio (Dashboard)
├── Titles (grid + filters)
│   ├── New Title (editor)
│   └── [slug] (editor)
├── Articles (flat list)
│   ├── New Article (editor)
│   └── [slug] (editor)
├── Media (section-based gallery)
└── Curation (interactive interface)
```

### Issues
- No breadcrumbs — user loses context in nested routes
- No global search across Studio content
- No way to jump between related items (e.g., from a title to its articles)
- Dashboard doesn't surface actionable items (drafts needing review, scheduled posts about to publish)

### Recommended IA Enhancements
1. Add breadcrumbs: `Studio > Titles > [Title Name]`
2. Add a command palette (Cmd+K) for quick navigation
3. Dashboard should show "needs attention" items (drafts older than 7 days, scheduled posts within 24h)
4. Cross-link related content (title → its articles, article → mentioned titles)

---

## 6. State Management Audit

### Current Approach
- Server Components for data fetching (good)
- Server Actions for mutations (good)
- No client-side state management in Studio (no Zustand usage)
- URL-based state for Titles filters (good pattern, but causes full reload)

### Issues
- Server Actions redirect on success — no way to show success feedback
- No optimistic updates — user waits for server round-trip
- No error state handling — failures are silent
- No form state preservation on error

### Recommendations
1. Use `useFormState` / `useActionState` for server action feedback
2. Add toast notifications for success/error states
3. Implement optimistic updates for common mutations (archive, feature toggle)
4. Preserve form data in sessionStorage as draft recovery

---

## 7. Recommended Action Plan (Commands)

Based on all findings, here's the prioritized command sequence:

1. **`/impeccable layout`** — Restructure navigation, unify with global header/footer, vary page widths, fix spacing rhythm
2. **`/impeccable harden`** — Add confirmation dialogs, error handling, loading states, form preservation
3. **`/impeccable distill`** — Kill hero-metric cards, simplify dashboard to summary bar + command row
4. **`/impeccable adapt`** — Fix responsive issues (touch targets, filter collapse, action overflow)
5. **`/impeccable typeset`** — Fix font-display usage, ensure heading hierarchy uses correct fonts
6. **`/impeccable polish`** — Final pass: dead code removal, consistency check, performance fixes

Re-run `/impeccable critique` after fixes to track score improvement (target: 28+/40).
