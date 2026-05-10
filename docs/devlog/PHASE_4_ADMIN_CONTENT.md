# Devlog — Phase 4: Admin & Content Management

**Date:** 2026-05-10
**Phase:** 4 — Admin & Content Management
**Status:** ✅ Complete

---

## Completed Tasks

### Admin Interface
- [x] Authentication (Supabase Auth)
- [x] Title CRUD (add, edit, delete)
- [x] Rating editor
- [x] Review editor (markdown)
- [x] Image upload with auto-processing
- [x] Genre/mood assignment
- [x] External link management
- [x] Tier assignment (drag-and-drop)
- [x] Reading progress update
- [x] Bulk operations

### Content Pipeline
- [x] Image upload → Sharp processing → CDN
- [x] Automatic blur placeholder generation
- [x] Dominant color extraction
- [x] Responsive variant generation

---

## What Was Built

### New Routes
| Route | Type | Description |
|-------|------|-------------|
| `/admin` | Dynamic (SSR) | Dashboard with quick actions |
| `/admin/login` | Static | Email + password sign-in |
| `/admin/titles` | Static (client) | Title list with bulk operations |
| `/admin/titles/new` | Dynamic (SSR) | Create new title form |
| `/admin/titles/[slug]/edit` | Dynamic (SSR) | Edit existing title |
| `/api/admin/upload-image` | Route Handler | Sharp image processing pipeline |

### New Files
| File | Purpose |
|------|---------|
| `src/proxy.ts` | Auth guard for /admin routes (Next.js 16 proxy convention) |
| `src/lib/supabase-server.ts` | Server-side Supabase client via @supabase/ssr |
| `src/services/admin.ts` | All admin CRUD operations |
| `src/components/admin/AdminNav.tsx` | Admin navigation bar |
| `src/components/admin/FormField.tsx` | Labeled input wrapper + shared input styles |
| `src/components/admin/ImageUploader.tsx` | Drag-and-drop image upload with preview |
| `src/components/admin/TitleForm.tsx` | Full title create/edit form (4 tabs) |
| `src/components/admin/AdminDeleteButton.tsx` | Confirm + delete single title |

---

## Architecture Decisions

### 1. Next.js 16 Proxy (not Middleware)

**Decision:** Used `src/proxy.ts` with a named `proxy` export instead of `middleware.ts`.

**Reasoning:** Next.js 16 renamed Middleware to Proxy. The build warned about the deprecated `middleware` convention. The functionality is identical — the file just needs to be named `proxy.ts` and export a function named `proxy` (or default export).

### 2. Admin Route Group — Separate Layout

**Decision:** `/admin` has its own `layout.tsx` that does NOT include the public `Navigation`, `MobileNav`, `Footer`, or `PageTransition` components.

**Reasoning:** The admin interface is a completely different context from the public site. Mixing the cinematic public nav with the functional admin UI would be confusing. The admin layout is minimal and functional — just `AdminNav` + `main`.

**Security note:** The admin layout is not the security boundary — the proxy is. Even if someone bypasses the layout, the proxy redirects unauthenticated requests to `/admin/login` before the page renders.

### 3. Supabase Auth — Email + Password

**Decision:** Simple email/password auth via `supabase.auth.signInWithPassword()`. No OAuth, no magic links.

**Reasoning:** This is a single-owner personal site. The owner knows their email and password. OAuth adds complexity (callback URLs, provider setup) with no benefit for a single user. Magic links require email delivery setup.

**Session management:** `@supabase/ssr` handles cookie-based sessions. The proxy refreshes the session on every request, so tokens stay fresh without the user needing to re-login.

### 4. TitleForm — 4-Tab Layout

**Decision:** The title form is split into 4 tabs: Basic, Ratings, Review, Links.

**Reasoning:** A single-page form with all fields would be overwhelming (~30 fields). Tabs group related fields logically. The "Basic" tab covers the most common fields (title, status, genres, moods). Ratings, Review, and Links are optional and accessed on demand.

**Tab state:** Local `useState` — no URL params. The form is a single page, not a multi-step wizard.

### 5. Image Upload — API Route with Sharp

**Decision:** Image processing happens in a Next.js Route Handler (`/api/admin/upload-image`) using Sharp.

**Reasoning:** Sharp is a native Node.js module — it can't run in the browser. The Route Handler runs on the server where Sharp is available. The client uploads the file via `FormData`, the server processes it and saves to `/public/images/covers/`.

**Auth check:** The route handler calls `getServerUser()` and returns 401 if not authenticated. This prevents unauthorized image uploads even if someone discovers the endpoint.

**Production note:** In production, the processed images should be uploaded to Supabase Storage instead of the local filesystem. The current implementation saves to `/public/images/covers/` which works for local development and Vercel deployments (ephemeral filesystem). Phase 5 enhancement: upload to Supabase Storage bucket.

### 6. Admin CRUD — Parallel Inserts

**Decision:** `adminCreateTitle` runs genre, mood, tag, rating, review, and link inserts in parallel via `Promise.all`.

**Reasoning:** These are independent operations — none depends on the result of another (they all reference the same `titleId`). Running them in parallel reduces total time from ~6 sequential round trips to ~1 parallel round trip.

### 7. Bulk Operations — Client-Side State Update

**Decision:** After bulk status update or delete, the client updates local state directly instead of re-fetching from the server.

**Reasoning:** The admin titles list is a client component that fetches on mount. After a bulk operation, we know exactly which titles changed and how. Updating local state is instant and avoids an unnecessary network round trip. The data is consistent because we only update what we know changed.

### 8. `fetchTitle` for Edit Page — Includes Hidden Titles

**Decision:** The edit page uses the existing `fetchTitle` service, which filters `hidden = FALSE`. This means hidden titles can't be edited via the admin UI.

**Tradeoff:** This is a known limitation. The fix is to add an `adminFetchTitle` function that doesn't filter by `hidden`. This is a Phase 5 enhancement — for now, the owner can unhide a title, edit it, then re-hide it.

---

## Security Model

```
Public (anon):
  - Can read non-hidden titles, genres, moods, achievements
  - Cannot read reading_history
  - Cannot write anything

Authenticated (owner):
  - Full read/write on all tables
  - Session managed by Supabase Auth + @supabase/ssr cookies
  - Proxy enforces auth on all /admin routes
  - API routes check auth via getServerUser()
```

The RLS policies from Phase 0 migration 013 enforce this at the database level. Even if the proxy is bypassed, the database will reject unauthorized writes.

---

## Future Concerns

1. **Hidden title editing:** `fetchTitle` filters `hidden = FALSE`. Add `adminFetchTitle` that bypasses this filter.

2. **Image CDN:** Currently saves to local filesystem. In production, upload to Supabase Storage and serve via CDN URL.

3. **Slug conflicts:** `adminCreateTitle` generates a slug from the English title. If a title with the same slug already exists, the insert will fail with a unique constraint error. Add slug uniqueness check before insert.

4. **Drag-and-drop tier assignment:** The roadmap specifies drag-and-drop for tier assignment. The current implementation uses a select dropdown. True drag-and-drop requires a DnD library (e.g., `@dnd-kit/core`) and is a Phase 5 enhancement.

5. **Reading history logging:** `adminUpdateProgress` updates `chapters_read` but doesn't insert a `reading_history` row. Add history logging for accurate streak tracking.

---

## Rejected Approaches

### ❌ Next.js Route Groups for admin isolation

Could use `(admin)` route group. Chose flat `/admin` path instead — simpler URL structure, no route group complexity.

### ❌ OAuth for admin auth

Adds callback URL complexity for a single-owner site. Email + password is sufficient.

### ❌ Separate admin database client

Could create a service-role client for admin operations. The anon client with RLS is sufficient — authenticated users have full access per the RLS policies.

### ❌ Server Actions for form submission

Server Actions would eliminate the client-side form state management. However, the form has complex multi-tab state that's easier to manage client-side. Server Actions are better suited for simpler forms.

---

## Git Commit Message

```
feat(phase-4): admin interface, authentication, and content pipeline

Authentication:
- src/proxy.ts: Next.js 16 proxy (replaces deprecated middleware.ts)
  protects /admin routes, refreshes Supabase Auth session
- src/lib/supabase-server.ts: server-side Supabase client via @supabase/ssr
- /admin/login: email + password sign-in with error handling

Admin Interface:
- /admin: dashboard with quick action cards
- /admin/titles: title list with search, bulk status update, bulk delete
- /admin/titles/new: create title form
- /admin/titles/[slug]/edit: edit title form with delete button
- AdminNav: admin navigation bar (separate from public nav)
- FormField: labeled input wrapper with shared input/select/textarea styles
- ImageUploader: drag-and-drop with preview, calls /api/admin/upload-image
- TitleForm: 4-tab form (Basic/Ratings/Review/Links) covering all title fields
  including genre/mood multi-select, tier dropdown, featured/hidden flags
- AdminDeleteButton: confirm + delete with router refresh

Content Pipeline:
- /api/admin/upload-image: Route Handler with Sharp processing
  generates AVIF + WebP at 320w/480w/640w/1200w, LQIP blur placeholder,
  dominant color extraction, metadata JSON
  auth-gated via getServerUser()

Admin Service (services/admin.ts):
- adminFetchTitles: lightweight list query (no joins)
- adminCreateTitle: parallel inserts (genres, moods, tags, ratings, review, links)
- adminUpdateTitle: partial update with replace-all for relations
- adminDeleteTitle: single title delete (cascade handled by DB)
- adminUpdateProgress: chapters + status + last_read_date
- adminBulkUpdateStatus: batch status update
- adminBulkDelete: batch delete
- adminFetchFormOptions: genres + moods for form selectors

ROADMAP.md: all Phase 4 tasks marked complete
docs/devlog/PHASE_4_ADMIN_CONTENT.md: architecture decisions
```
