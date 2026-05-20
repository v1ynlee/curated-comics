# Studio Implementation Spec — Detailed Component Changes

## Date: 2026-05-17
## Purpose: Exact specifications for each file change in the Studio UI overhaul

---

## Phase 1: Layout Unification

### 1.1 Modify `src/components/layout/Navigation.tsx`

**Remove:** The early return `if (isStudio) return null;`

**Add:** Conditional nav items based on pathname.

```tsx
// Replace static NAV_ITEMS with a function:
const getNavItems = (isStudio: boolean) => {
  if (isStudio) {
    return [
      { href: '/studio',          label: 'Dashboard', exact: true },
      { href: '/studio/titles',   label: 'Titles' },
      { href: '/studio/articles', label: 'Articles' },
      { href: '/studio/media',    label: 'Media' },
      { href: '/studio/curation', label: 'Curation' },
    ];
  }
  return [
    { href: '/',         label: 'Home' },
    { href: '/library',  label: 'Library' },
    { href: '/discover', label: 'Discover' },
    { href: '/tiers',    label: 'Tiers' },
    { href: '/stats',    label: 'Stats' },
    { href: '/news',     label: 'News' },
  ];
};
```

**Logo adaptation:** When `isStudio`, render "CC Studio" instead of "CC". Add a subtle "← Site" link before the logo.

**Right actions:** When `isStudio`, replace Search link with a "Back to Site" link (→ `/`). Keep theme toggle.

**Active state logic:** For Studio items, use `exact` flag for Dashboard (exact match on `/studio`) and `startsWith` for others.

### 1.2 Modify `src/components/layout/MobileHeader.tsx`

**Remove:** The early return `if (isStudio) return null;`

**Adapt:** When `isStudio`:
- Logo text: "CC Studio" instead of "Comic Curated"
- Keep search + theme toggle in right actions

### 1.3 Modify `src/components/layout/MobileNav.tsx`

**Remove:** The early return `if (isStudio) return null;`

**Add:** Conditional nav items (same pattern as Navigation.tsx):
```tsx
const getMobileNavItems = (isStudio: boolean) => {
  if (isStudio) {
    return [
      { href: '/studio', label: 'Dashboard', icon: <DashboardIcon />, exact: true },
      { href: '/studio/titles', label: 'Titles', icon: <BookIcon /> },
      { href: '/studio/articles', label: 'Articles', icon: <FileTextIcon /> },
      { href: '/studio/media', label: 'Media', icon: <ImageIcon /> },
      { href: '/studio/curation', label: 'Curation', icon: <StarIcon /> },
    ];
  }
  return [...existing items...];
};
```

### 1.4 Modify `src/components/layout/MainContent.tsx`

**Remove:** The `!isStudio &&` guard on Footer rendering.
**Remove:** The `!isStudio &&` condition on padding classes (Studio pages will use the same offset system).

The Studio layout.tsx will handle any Studio-specific spacing.

### 1.5 Simplify `src/app/studio/layout.tsx`

**Remove:** `StudioShell` import and usage.

**New structure:**
```tsx
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable}`} style={{ fontFamily: 'var(--font-inter)' }}>
      <StudioPageTransition>
        {children}
      </StudioPageTransition>
    </div>
  );
}
```

Note: The skip-to-content link from StudioShell is already in the root layout. The auth check should move to individual pages (they already have `getServerUser()` checks).

### 1.6 Delete Files
- `src/components/studio/StudioHeader.tsx`
- `src/components/studio/StudioNav.tsx`
- `src/components/studio/StudioShell.tsx`

### 1.7 Update StudioPageTransition

Reduce motion to product-appropriate levels:
```tsx
const studioPageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.15, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: [0.4, 0.0, 1.0, 1.0] },
  },
};
```
Remove blur and x-offset. Product UI transitions should be 150-250ms, opacity only.

---

## Phase 2: Dashboard Redesign

### 2.1 Create `src/components/studio/SummaryBar.tsx`

```tsx
interface SummaryBarProps {
  stats: { label: string; value: number; href: string }[];
}
```

Renders as a single horizontal row of linked stats:
- `font-data` for numbers, `font-body` for labels
- Separated by `·` or thin vertical dividers
- Each stat is a link to its section
- Wraps on mobile (flex-wrap)
- No cards, no icons, no backgrounds

### 2.2 Redesign `src/app/studio/page.tsx`

**Remove:**
- OverviewCard imports and grid
- QuickActionCard component and grid

**Replace with:**
```
[SummaryBar — single row of linked stats]

[Command Row — 3 buttons: + New Title (primary), + New Article (secondary), Upload Media (secondary)]

[Two-column layout on desktop:]
  [Left 60%: Activity Feed (existing, keep as-is)]
  [Right 40%: Needs Attention panel]
    - Drafts older than 7 days
    - Scheduled posts within 24h
    - Recently updated titles without reviews
```

### 2.3 Create `src/components/studio/NeedsAttention.tsx`

A compact list of actionable items:
- Each item: icon + label + time indicator + link
- Grouped by urgency (overdue → upcoming → suggestions)
- Empty state: "All caught up" with a checkmark

### 2.4 Delete `src/components/studio/OverviewCard.tsx`

Dead code after dashboard redesign.

---

## Phase 3: Safety & Robustness

### 3.1 Create `src/components/studio/ConfirmAction.tsx`

Inline confirmation pattern (NOT a modal):

```tsx
interface ConfirmActionProps {
  trigger: React.ReactNode;        // The button that starts the flow
  message: string;                 // "Delete this article? This cannot be undone."
  confirmLabel: string;            // "Delete"
  confirmVariant: 'danger' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}
```

Behavior:
1. User clicks trigger → trigger is replaced by confirmation UI (inline, same position)
2. Confirmation shows: message + [Confirm] + [Cancel]
3. Confirm executes action; Cancel restores trigger
4. Auto-cancel after 10 seconds (timeout)
5. Escape key cancels

### 3.2 Create `src/components/ui/Toast.tsx`

Lightweight toast notification:
```tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: { label: string; onClick: () => void }; // For "Undo" button
  duration?: number; // Default 5000ms
}
```

- Fixed position bottom-right (desktop) or bottom-center (mobile)
- Stack up to 3 toasts
- Auto-dismiss after duration
- Manual dismiss via X button
- `aria-live="polite"` for screen readers

### 3.3 Add Skeleton Loading States

Create `src/components/studio/Skeleton.tsx` with variants:
- `SkeletonRow` — for list items (articles, activity)
- `SkeletonCard` — for grid items (titles, media)
- `SkeletonText` — for text blocks

Use React Suspense boundaries in Studio pages:
```tsx
<Suspense fallback={<ArticleListSkeleton />}>
  <ArticleList />
</Suspense>
```

---

## Phase 4: Articles Page Enhancement

### 4.1 Add Search + Filters to Articles

Match the Titles page pattern:
- Search input (full-width, with Search icon)
- State filter: All / Draft / Scheduled / Published / Archived (as pill buttons, not a select)
- Sort: Newest / Oldest / A-Z / Z-A (dropdown)

### 4.2 Create `src/components/studio/OverflowMenu.tsx`

For article row actions:
```tsx
interface OverflowMenuProps {
  items: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }[];
}
```

Renders as a "..." button that opens a dropdown (Radix DropdownMenu).
Destructive items shown in red with confirmation via ConfirmAction.

### 4.3 Bulk Actions

- Add checkbox to each article row
- When any checkbox is selected, show a floating BulkActionBar:
  ```
  [3 selected]  [Publish]  [Archive]  [Delete]  [× Clear]
  ```
- Bulk delete requires confirmation
- Select all / deselect all toggle

---

## Phase 5: Cross-Page Polish

### 5.1 Typography Fix

Replace all instances of `font-display` in Studio pages with `font-heading`:
- `src/app/studio/page.tsx` — h1
- `src/app/studio/titles/page.tsx` — h1
- `src/app/studio/articles/page.tsx` — h1
- `src/app/studio/media/page.tsx` — h1
- `src/app/studio/curation/page.tsx` — h1

### 5.2 Breadcrumbs

Create `src/components/studio/Breadcrumbs.tsx`:
```tsx
interface BreadcrumbItem {
  label: string;
  href?: string; // Last item has no href (current page)
}
```

Add to nested routes:
- `/studio/titles/[slug]` → Studio > Titles > [Title Name]
- `/studio/titles/new` → Studio > Titles > New Title
- `/studio/articles/[slug]` → Studio > Articles > [Article Title]
- `/studio/articles/new` → Studio > Articles > New Article

### 5.3 Max-Width Variation

| Page | Current | Target | Reason |
|------|---------|--------|--------|
| Dashboard | max-w-5xl | max-w-6xl | Two-column layout needs width |
| Titles | max-w-6xl | max-w-7xl | 5-col grid needs room |
| Articles | max-w-5xl | max-w-5xl | Text-heavy, keep focused |
| Media | max-w-5xl | max-w-7xl | Gallery needs width |
| Curation | max-w-6xl | max-w-6xl | Keep as-is |
| Title Editor | — | max-w-4xl | Form-focused, narrow is better |
| Article Editor | — | max-w-4xl | Writing-focused |

### 5.4 Keyboard Shortcuts

Add via a global keyboard listener in Studio layout:
- `Cmd+K` / `Ctrl+K` — Open command palette (future feature, placeholder)
- `Cmd+N` / `Ctrl+N` — New item (context-dependent: new title on /titles, new article on /articles)
- `Escape` — Close any open dropdown/confirmation

---

## Testing Checklist

After implementation, verify:

- [ ] All Studio pages render with global header + footer
- [ ] Navigation shows Studio items on `/studio/*`
- [ ] Navigation shows public items on other routes
- [ ] MobileNav shows Studio items on `/studio/*`
- [ ] "Back to Site" link works from Studio
- [ ] Dashboard has no hero-metric cards
- [ ] Dashboard summary bar links to correct pages
- [ ] Delete on Articles shows inline confirmation
- [ ] Delete confirmation can be cancelled
- [ ] Toast appears on successful delete with Undo option
- [ ] Articles page has search + state filter
- [ ] Titles page filters work without full reload
- [ ] All pages responsive at 320px, 768px, 1024px, 1440px
- [ ] No `font-display` in Studio UI
- [ ] Breadcrumbs show on nested routes
- [ ] Page transitions are 150ms opacity-only
- [ ] Touch targets ≥ 44px on mobile
- [ ] Screen reader can navigate all Studio pages
- [ ] Keyboard can reach all interactive elements
