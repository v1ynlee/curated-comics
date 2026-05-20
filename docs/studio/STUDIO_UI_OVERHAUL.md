# Studio UI Overhaul — Planning Document

## Version: 2.0.0
## Status: Complete
## Date: 2026-05-18
## Scope: Full visual and structural overhaul of `/studio/*` routes

---

## 1. Executive Summary

The Studio CMS dashboard currently operates as an isolated layout with its own header, no footer, and navigation buried inside a user avatar dropdown. This overhaul unifies the Studio with the main site's layout system (shared global header and footer) while adapting the content area for professional CMS workflows. The goal: minimal, professional, feature-rich, responsive.

**Key decisions from critique:**
- Studio shares the global header/footer (adapted with Studio-specific branding/icons)
- Remove the isolated `StudioShell` + `StudioHeader` pattern
- Remove the unused `StudioNav` sidebar component
- Kill the hero-metric overview cards (banned pattern)
- Add confirmation dialogs for destructive actions
- Add search/filtering to Articles page
- Vary layout density per page type
- No cinematic effects, no heavy backgrounds; this is a tool for one person

---

## 2. Architecture Changes

### 2.1 Layout Unification

**Current state:**
```
RootLayout
├── Navigation (hidden on /studio)
├── MobileHeader (hidden on /studio)
├── PageTransition
│   └── MainContent (no footer on /studio)
│       └── StudioLayout
│           └── StudioShell
│               ├── StudioHeader (isolated)
│               └── StudioPageTransition → children
├── MobileNav (hidden on /studio)
└── Footer (hidden on /studio)
```

**Target state:**
```
RootLayout
├── Navigation (visible on /studio, adapted)
├── MobileHeader (visible on /studio, adapted)
├── PageTransition
│   └── MainContent (with footer on /studio)
│       └── StudioLayout
│           └── StudioPageTransition → children
├── MobileNav (visible on /studio, adapted)
└── Footer (visible on /studio)
```

### 2.2 Components to Remove
- `src/components/studio/StudioHeader.tsx` — replaced by global Navigation
- `src/components/studio/StudioNav.tsx` — unused sidebar, dead code
- `src/components/studio/StudioShell.tsx` — replaced by direct layout

### 2.3 Components to Modify
- `src/components/layout/Navigation.tsx` — remove `if (isStudio) return null`; add Studio-specific nav items when on `/studio/*`
- `src/components/layout/MobileHeader.tsx` — remove `if (isStudio) return null`; adapt branding for Studio
- `src/components/layout/MobileNav.tsx` — remove `if (isStudio) return null`; show Studio nav items when on `/studio/*`
- `src/components/layout/MainContent.tsx` — remove footer suppression for `/studio/*`
- `src/components/layout/Footer.tsx` — no changes needed (already generic)
- `src/app/studio/layout.tsx` — simplify to just font loading + metadata; remove StudioShell wrapper

### 2.4 Navigation Adaptation for Studio

When `pathname.startsWith('/studio')`, the global Navigation should:
- Replace the "CC" logo text with "CC Studio" or a Studio-specific icon variant
- Replace NAV_ITEMS with Studio-specific items:
  ```
  Dashboard  → /studio
  Titles     → /studio/titles
  Articles   → /studio/articles
  Media      → /studio/media
  Curation   → /studio/curation
  ```
- Keep the theme toggle and search icon (search could link to a future Studio search)
- Add a "Back to Site" link (→ `/`) as a subtle escape hatch
- On mobile: MobileNav bottom tabs show Studio items; MobileHeader shows "CC Studio" branding

---

## 3. Page-by-Page Redesign

### 3.1 Dashboard (`/studio`)

**Problems:**
- Hero-metric template (6 identical stat cards) — banned pattern
- Identical Quick Action cards (icon + title + description × 3)
- Flat stacked layout with no spatial variation

**Redesign:**

Replace the overview cards with a **compact summary bar** (single row, inline):
```
┌─────────────────────────────────────────────────────────────────┐
│  97 Titles  ·  12 Articles  ·  340 Media  ·  8 Artists  ·  ...  │
└─────────────────────────────────────────────────────────────────┘
```
Each stat is a clickable link to its section. No icons, no cards, no big numbers.

Replace Quick Actions with a **command row** (horizontal button group):
```
[+ New Title]  [+ New Article]  [Upload Media]
```
Simple buttons in a row, not cards. Primary action (New Title) gets accent styling.

**Activity Feed** stays but gets a two-column layout on desktop:
- Left column (60%): Recent Activity (keep current implementation, it's good)
- Right column (40%): Quick stats summary + any system notices

**Max-width:** `max-w-6xl` (wider than current 5xl to use space better)

### 3.2 Titles (`/studio/titles`)

**Current state:** Good. Has search + filters + grid. Minor issues only.

**Improvements:**
- Filters should work client-side (no full page reload) — convert to client component with URL sync
- Add a "list view" toggle (grid vs compact list) for power users
- Max-width: `max-w-7xl` (media-heavy page needs width)

### 3.3 Articles (`/studio/articles`)

**Problems:**
- No search or filtering
- Delete button adjacent to Edit with same styling
- No bulk actions

**Redesign:**
- Add search input + state filter (Draft / Scheduled / Published / Archived) matching Titles pattern
- Move destructive actions (Archive, Delete) into a "..." overflow menu per row
- Add bulk selection checkboxes + bulk action bar (Publish, Archive, Delete selected)
- Add sorting: by date, by title, by state
- Max-width: `max-w-5xl` (text-heavy, doesn't need extreme width)

### 3.4 Media (`/studio/media`)

**Current state:** Reasonable section-based layout. Upload button is disabled.

**Improvements:**
- Enable the Upload button or remove it (disabled buttons with no explanation are confusing)
- Add a "total storage used" indicator
- Add drag-and-drop upload zone
- Max-width: `max-w-7xl` (gallery needs width)

### 3.5 Curation (`/studio/curation`)

**Current state:** Functional with CurationInterface client component.

**Improvements:**
- Add breadcrumbs when editing a specific collection
- Max-width: `max-w-6xl`

---

## 4. Safety & Robustness

### 4.1 Destructive Action Confirmation

Every destructive action (Delete, Archive) must:
1. Show an inline confirmation state (not a modal) — the row expands to show "Are you sure? This cannot be undone." with [Confirm Delete] and [Cancel] buttons
2. On success: show a toast notification with "Undo" option (soft-delete with 10s grace period)
3. On failure: show a toast with the error message

**Implementation:**
- Create `src/components/studio/ConfirmAction.tsx` — inline confirmation pattern
- Create `src/components/studio/Toast.tsx` — lightweight toast system (or use existing if available)
- Modify server actions to support soft-delete (add `deleted_at` column, filter in queries)

### 4.2 Loading States

Every page that fetches data should show:
- Skeleton loading states (not spinners) during initial load
- Optimistic UI for mutations (show the change immediately, revert on error)

### 4.3 Error Handling

- Server action failures should return structured errors
- Client should display errors inline near the action that failed
- Forms should preserve user input on error (no data loss)

---

## 5. Responsive Behavior

### 5.1 Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| < 640px (mobile) | Single column, stacked cards, bottom nav, compact stat bar wraps |
| 640–1024px (tablet) | Two-column grids, side-by-side stat bar |
| > 1024px (desktop) | Full layouts, multi-column grids, inline filters |

### 5.2 Mobile-Specific Adaptations

- Bottom MobileNav shows Studio items (Dashboard, Titles, Articles, Media, Curation)
- Article actions collapse into a single "..." button
- Filters collapse into a "Filter" button that opens a sheet/drawer
- Stat summary bar wraps to 2 lines on narrow screens

---

## 6. Typography & Spacing

### 6.1 Font Usage in Studio

- **Page headings:** `font-heading` (Datatype/Oswald) — NOT `font-display` (Playfair). Serif display fonts are banned in product UI labels.
- **Body text:** `font-body` (DM Sans/Inter) — already correct
- **Data/numbers:** `font-data` (JetBrains Mono) — already correct for stats
- **Labels/badges:** `font-heading` at small sizes — already correct

### 6.2 Spacing Rhythm

- Page top padding: `pt-8` (32px) on desktop, `pt-6` (24px) on mobile
- Section gaps: `gap-8` (32px) between major sections
- Card internal padding: `p-5` (20px) standard, `p-4` (16px) compact
- Between header and content: `mb-6` (24px)

---

## 7. Visual Identity

### 7.1 Color Strategy: Restrained

The Studio uses the **Restrained** color strategy:
- Tinted neutrals (the existing bg-deep/bg-mid/bg-surface system)
- One accent (accent-primary / violet) for primary actions and active states only
- Semantic colors for states (success/warning/danger/info) — already defined
- No decorative color, no gradients, no atmospheric effects

### 7.2 Component Vocabulary

All interactive components must have consistent states:
- Default → Hover → Focus → Active → Disabled → Loading → Error
- Buttons: primary (accent-primary bg), secondary (white/5 bg), destructive (red on hover only)
- Inputs: consistent border treatment, focus ring, error state
- Cards: subtle border (white/5), hover lift (white/10 border), no shadows

---

## 8. Implementation Order

### Phase 1: Layout Unification (Priority: Layout)
1. Remove `isStudio` guards from Navigation, MobileHeader, MobileNav, MainContent
2. Add Studio-specific nav items (conditional on pathname)
3. Remove StudioShell, StudioHeader, StudioNav components
4. Simplify studio/layout.tsx
5. Add "Back to Site" link in Studio nav
6. Test: all Studio pages render with global header/footer

### Phase 2: Dashboard Redesign
1. Replace OverviewCard grid with compact summary bar
2. Replace QuickActionCard grid with command button row
3. Add two-column layout (activity + sidebar)
4. Remove OverviewCard component (dead code after this)

### Phase 3: Safety & Robustness
1. Create ConfirmAction inline confirmation component
2. Create Toast notification system
3. Add confirmation to Delete/Archive on Articles
4. Add soft-delete support (deleted_at column + migration)
5. Add loading skeletons to all listing pages

### Phase 4: Articles Page Enhancement
1. Add search input + state filter
2. Move destructive actions to overflow menu
3. Add bulk selection + bulk action bar
4. Add sorting controls
5. Convert to client-side filtering with URL sync

### Phase 5: Cross-Page Polish
1. Fix typography (font-display → font-heading for page titles)
2. Vary max-width per page type
3. Add breadcrumbs to nested routes (title edit, article edit)
4. Fix disabled Upload Media button (enable or explain)
5. Add keyboard shortcuts for common actions (Cmd+N for new, Cmd+K for search)

---

## 9. Files Affected

### Remove:
- `src/components/studio/StudioHeader.tsx`
- `src/components/studio/StudioNav.tsx`
- `src/components/studio/StudioShell.tsx`
- `src/components/studio/OverviewCard.tsx` (after Phase 2)

### Create:
- `src/components/studio/ConfirmAction.tsx`
- `src/components/studio/Toast.tsx` (or `src/components/ui/Toast.tsx`)
- `src/components/studio/SummaryBar.tsx`
- `src/components/studio/BulkActionBar.tsx`
- `src/components/studio/OverflowMenu.tsx`

### Modify:
- `src/components/layout/Navigation.tsx`
- `src/components/layout/MobileHeader.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/MainContent.tsx`
- `src/app/studio/layout.tsx`
- `src/app/studio/page.tsx`
- `src/app/studio/articles/page.tsx`
- `src/app/studio/titles/page.tsx`
- `src/app/studio/media/page.tsx`
- `src/app/studio/curation/page.tsx`

---

## 10. Success Criteria

1. Studio pages render with the same global header and footer as public pages
2. Navigation shows Studio-specific items when on `/studio/*`
3. No hero-metric cards anywhere in the Studio
4. Delete actions require confirmation and offer undo
5. Articles page has search + filtering
6. Each page uses appropriate max-width for its content type
7. All pages are responsive down to 320px
8. No `font-display` (Playfair) used in Studio UI labels or headings
9. Score on re-critique: target 28+/40 (from current 16/40)
