# Implementation Plan: Platform Evolution Planning

## Overview

This plan implements three major system evolutions for Comic Curated: (1) Media Layer Migration to Cloudflare R2 with Sharp processing and CDN delivery, (2) Studio CMS replacing the `/admin` route group with a cinematic creative workspace, and (3) News/Editorial System with full article publishing workflow. Tasks are ordered to build foundational infrastructure first, then layer features on top, ensuring no orphaned code at any step.

## Tasks

- [x] 1. Set up project infrastructure and shared types
  - [x] 1.1 Install new dependencies and configure test infrastructure
    - Install `@aws-sdk/client-s3`, `fast-check`, `vitest`, `@testing-library/react`, `msw`, `@dnd-kit/core`, `@dnd-kit/sortable`, `react-markdown`, `remark-gfm`, `rehype-highlight`
    - Create `vitest.config.ts` with path aliases matching `tsconfig.json`
    - Create test directory structure: `src/__tests__/unit/`, `src/__tests__/integration/`
    - Add `"test": "vitest --run"` script to `package.json`
    - _Requirements: 17.1, 17.4, 17.5_

  - [x] 1.2 Create shared TypeScript types for media and articles
    - Create `src/types/media.ts` with `MediaAsset`, `MediaVariant`, `AssetType`, `ProcessedVariant`, `ProcessingResult` interfaces
    - Create `src/types/article.ts` with `Article`, `ArticleSummary`, `ArticleCategory`, `ArticleTag`, `ArticleFormData`, `PublicationState` types
    - Create `src/types/studio.ts` with `StudioError`, `TitleFormData`, `StudioArticleRow`, `AdminTitleRow`, `TierLevel` types
    - _Requirements: 5.1, 12.1, 12.2, 12.3, 12.4_

  - [x] 1.3 Add R2 environment variables to `.env.example` and `.env.local.example`
    - Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` placeholders
    - Document expected values in comments
    - _Requirements: 4.1, 4.2_

- [x] 2. Implement R2 client and image processing core
  - [ ] 2.1 Implement R2 client module (`src/lib/r2-client.ts`)
    - Implement `validateR2Config()` that checks all required env vars and throws with missing variable names if any are absent
    - Implement `createR2Client()` using `@aws-sdk/client-s3` with S3-compatible endpoint (`https://{accountId}.r2.cloudflarestorage.com`)
    - Implement `uploadToR2(key, body, contentType)` using `PutObjectCommand`
    - Implement `deleteFromR2(key)` using `DeleteObjectCommand`
    - Implement `deleteR2Prefix(prefix)` using `ListObjectsV2Command` + batch delete
    - Implement `getR2PublicUrl(key)` returning CDN URL from `R2_PUBLIC_URL` env var
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.2 Implement image processor (`src/lib/image-processor.ts`)
    - Implement `generateContentHash(buffer)` — SHA-256 of buffer, truncated to 12 hex characters
    - Implement `validateUpload(file)` — reject if MIME not in `[image/jpeg, image/png, image/webp, image/avif, image/gif]` or size > 10MB
    - Implement `processImage(buffer, assetType)` — resize to variant widths, encode AVIF (quality 65) and WebP (quality 75), generate LQIP (20px width, Gaussian blur sigma 3, JPEG quality 30, base64 data URI), extract dominant color hex via Sharp stats, extract original dimensions and aspect ratio
    - Define width constants: `COVER_WIDTHS = [320, 480, 640, 1200]`, `BANNER_WIDTHS = [768, 1200, 1920]`, `ARTICLE_WIDTHS = [480, 768, 1200]`
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.3 Implement R2 key path builder (`src/lib/r2-paths.ts`)
    - Implement `buildR2Key(assetType, slug, contentHash, descriptor, format)` returning path like `covers/{slug}/{contentHash}/{descriptor}.{format}`
    - Implement `buildR2Prefix(assetType, slug, contentHash)` for deletion/listing
    - Ensure all path segments are URL-safe
    - _Requirements: 1.1, 1.5_

  - [x]* 2.4 Write unit tests for R2 client, image processor, and path builder
    - Test `validateR2Config()` throws with descriptive error for missing vars
    - Test `generateContentHash()` produces 12 hex chars deterministically
    - Test `validateUpload()` rejects invalid MIME types and oversized files
    - Test `buildR2Key()` produces correct path structure
    - _Requirements: 1.2, 1.3, 1.4, 4.3_

- [x] 3. Implement database schema and migrations
  - [x] 3.1 Create Supabase migration for `media_assets` table
    - Create migration file in `supabase/migrations/` with `media_assets` table: `id` UUID PK, `slug` text NOT NULL, `asset_type` text CHECK in ('cover','banner','article-image','thumbnail','og-asset'), `content_hash` text NOT NULL, `original_width` int, `original_height` int, `aspect_ratio` numeric, `mime_type` text, `dominant_color` text, `blur_data_uri` text, `variants` JSONB, `r2_base_path` text, `created_at` timestamptz, `updated_at` timestamptz
    - Add unique constraint on (`slug`, `asset_type`, `content_hash`)
    - Add RLS policies: public SELECT, owner-only INSERT/UPDATE/DELETE
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.2 Create Supabase migration for article tables
    - Create `article_categories` table: `id` UUID PK, `name` text UNIQUE NOT NULL, `slug` text UNIQUE NOT NULL, `description` text, `color` text, `sort_order` int
    - Create `article_tags` table: `id` UUID PK, `name` text UNIQUE NOT NULL, `slug` text UNIQUE NOT NULL
    - Create `articles` table with all columns per Requirement 12.1 including `publication_state` CHECK constraint, foreign keys to `media_assets` and `article_categories`
    - Create `article_tag_assignments` junction table with composite PK
    - Add RLS policies: public SELECT on published articles only (state='published' AND publish_date <= NOW()), owner full access; public SELECT on categories/tags, owner full access
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 3.3 Create seed migration for default article categories
    - Seed `article_categories` with: Hiatus News, Axed Series, Release Announcements, Industry Commentary, Recommendations, Editorials, Curated Opinions
    - Generate slugs (kebab-case) and assign sequential sort_order
    - _Requirements: 14.1_

  - [x] 3.4 Create Supabase cron job for scheduled publishing
    - Add `pg_cron` extension and schedule running every 5 minutes
    - SQL: UPDATE articles SET publication_state='published', publish_date=scheduled_date, updated_at=NOW() WHERE publication_state='scheduled' AND scheduled_date <= NOW()
    - _Requirements: 19.1, 19.2, 19.4_

- [x] 4. Checkpoint - Ensure infrastructure and schema are correct
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement media upload and delete API routes
  - [x] 5.1 Implement atomic upload helper (`src/lib/atomic-upload.ts`)
    - Implement `atomicUploadVariants(variants)` that uploads all variant buffers to R2
    - If any upload fails, delete all previously uploaded keys in that batch (rollback)
    - Return array of uploaded keys on success
    - _Requirements: 18.4_

  - [x] 5.2 Implement media upload API route (`src/app/api/media/upload/route.ts`)
    - Validate Supabase auth session (return 401 if unauthenticated)
    - Validate MIME type (return 415 with descriptive error if invalid)
    - Validate file size (return 413 if > 10MB)
    - Process image through Sharp processor (return 422 if processing fails)
    - Upload variants atomically to R2 (return 503 if R2 unreachable)
    - UPSERT `media_assets` row in Supabase with all metadata (URLs, dimensions, blur URI, dominant color, content hash, file sizes)
    - Return processed asset data on success
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.6, 2.7, 18.1, 18.2, 18.3, 18.4_

  - [x] 5.3 Implement media delete API route (`src/app/api/media/delete/route.ts`)
    - Validate auth session
    - Verify asset exists in `media_assets`
    - Delete R2 objects by prefix using `deleteR2Prefix()`
    - Remove `media_assets` row from Supabase
    - _Requirements: 5.4_

  - [x]* 5.4 Write unit tests for media upload and delete routes
    - Test auth validation returns 401
    - Test MIME validation returns 415 for invalid types
    - Test size validation returns 413 for oversized files
    - Test successful upload creates media_assets row
    - Test delete removes R2 objects and database row
    - Mock R2 client and Supabase for isolation
    - _Requirements: 1.3, 1.4, 5.4, 18.1, 18.2, 18.3_

- [x] 6. Implement media service and CoverImage component update
  - [ ] 6.1 Implement media service (`src/services/media.ts`)
    - Implement `fetchMediaAsset(slug, assetType)` — query `media_assets` table by slug and type
    - Implement `fetchMediaVariants(slug)` — return all variant URLs for a slug
    - Implement `getImageUrl(slug, width, format)` — resolve CDN URL from variants if media_assets row exists, fall back to local `/images/covers/{slug}-{width}w.{format}` otherwise
    - _Requirements: 6.2, 6.3_

  - [x] 6.2 Update CoverImage component for R2/local dual support
    - Accept optional `mediaAsset` prop with variant data
    - If `mediaAsset` provided, build `srcset` from CDN URLs in variants JSONB
    - If no `mediaAsset`, fall back to existing local filesystem paths
    - Set `aspect-ratio` CSS from asset dimensions and `background-color` from dominant color
    - Ensure `loading="lazy"` for non-priority images, `priority` flag for above-fold
    - Use blur data URI as placeholder during load
    - _Requirements: 6.2, 6.3, 20.1, 20.2, 20.5_

  - [x]* 6.3 Write unit tests for media service and CoverImage
    - Test CDN URL resolution when media_assets row exists
    - Test local fallback when no media_assets row
    - Test CoverImage renders srcset with CDN URLs
    - Test CoverImage renders lazy loading attribute
    - Test blur placeholder is displayed
    - _Requirements: 6.2, 6.3, 20.1, 20.5_

- [ ] 7. Checkpoint - Ensure media pipeline tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Studio CMS authentication and route protection
  - [x] 8.1 Update proxy (`src/proxy.ts`) for Studio route protection
    - Add `/studio` route group detection (excluding `/studio/login`)
    - Redirect unauthenticated users to `/studio/login` with `redirectTo` query param preserving original path
    - Add `reason=session_expired` param when session is invalid/expired
    - Redirect authenticated users away from `/studio/login` to `/studio` dashboard
    - Add legacy `/admin` redirect to `/studio`
    - _Requirements: 7.1, 7.3, 7.5, 7.6, 17.2_

  - [x] 8.2 Implement Studio login page (`src/app/studio/login/page.tsx`)
    - Magic link login form with email input field
    - Call Supabase `signInWithOtp({ email })` on form submit
    - Display success message after magic link is sent
    - Handle `redirectTo` query param for post-auth redirect to original destination
    - Display session expiration message when `reason=session_expired` is present
    - Style with dark theme matching cinematic aesthetic
    - _Requirements: 7.2, 7.4, 7.6_

  - [x]* 8.3 Write unit tests for Studio route protection
    - Test unauthenticated requests to `/studio/titles` redirect to `/studio/login`
    - Test `redirectTo` param is preserved in redirect
    - Test authenticated users accessing `/studio/login` redirect to `/studio`
    - Test `/admin` redirects to `/studio`
    - _Requirements: 7.3, 7.5, 7.6_

- [x] 9. Implement Studio CMS layout and navigation
  - [x] 9.1 Create Studio layout (`src/app/studio/layout.tsx`)
    - Isolated layout with no public nav/footer (Studio-only chrome)
    - Dark theme default using existing design tokens from `globals.css`
    - Include `StudioNav` sidebar component
    - Framer Motion page transitions between Studio routes
    - Respect `prefers-reduced-motion` for transitions
    - _Requirements: 9.1, 9.2, 9.5, 17.7_

  - [x] 9.2 Implement Studio navigation sidebar (`src/components/studio/StudioNav.tsx`)
    - Navigation sections: Dashboard, Titles, Articles, Media, Curation
    - Animated active state indicators with Framer Motion
    - Collapsible on mobile viewports
    - Session status indicator showing logged-in state
    - Card-based visual style consistent with cinematic aesthetic
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 9.3 Implement Studio dashboard page (`src/app/studio/page.tsx`)
    - Overview cards: total titles count, published articles count, media assets count
    - Recent activity feed showing latest changes
    - Quick action buttons: New Title, New Article, Upload Media
    - Card-based layout with visual hierarchy (not table/spreadsheet)
    - _Requirements: 7.4, 9.3_

- [x] 10. Implement Studio Title Management
  - [x] 10.1 Implement title listing page (`src/app/studio/titles/page.tsx`)
    - Card-based layout with cover thumbnails, tier badges, reading/series status indicators
    - Search input and filter controls (by tier, status, origin)
    - Links to edit and create pages
    - _Requirements: 8.1, 8.2, 9.3_

  - [x] 10.2 Implement title editor component (`src/components/studio/TitleEditor.tsx`)
    - Form supporting all title fields: English title, original title, alternative titles, origin, series status, reading status, chapters read, total chapters, dates, tier, synopsis, vibe check, quotable lines, featured flag, hidden flag
    - Integrated `ImageUploader` component for cover and banner image upload
    - Genre/mood multi-select from existing taxonomy tables
    - Markdown review editor with split-pane live preview
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6_

  - [x] 10.3 Implement title create/edit pages (`src/app/studio/titles/new/page.tsx`, `src/app/studio/titles/[slug]/page.tsx`)
    - Create page renders `TitleEditor` in create mode
    - Edit page loads existing title data from Supabase and renders `TitleEditor` in edit mode
    - Server actions for create and update operations
    - _Requirements: 8.1, 8.2_

  - [x] 10.4 Implement tier manager component (`src/components/studio/TierManager.tsx`)
    - Drag-and-drop columns for each tier level (SSS+, S, A, B, C, D, F) using `@dnd-kit/core` and `@dnd-kit/sortable`
    - Title cards with cover thumbnails in each tier column
    - Server action for persisting tier changes on drop
    - _Requirements: 8.3_

  - [x] 10.5 Implement homepage curation interface (`src/app/studio/curation/page.tsx`)
    - Select featured titles and control their display order
    - Drag-and-drop reordering of featured titles
    - Live preview showing how homepage will appear with current selection
    - _Requirements: 8.7, 9.4_

- [x] 11. Implement Studio Gallery and Character Management
  - [x] 11.1 Implement gallery manager component (`src/components/studio/GalleryManager.tsx`)
    - Per-title gallery image management interface
    - Drag-and-drop reordering with `@dnd-kit`
    - Category assignment dropdown (best-scene, romantic-scene, funny-scene, general, cover)
    - Inline caption editing
    - Upload integration with Image Pipeline (`/api/media/upload`)
    - _Requirements: 10.1, 10.3_

  - [x] 11.2 Implement character manager component (`src/components/studio/CharacterManager.tsx`)
    - Add characters with name, role (main, supporting, antagonist, side), description, and sort order
    - Inline editing of character fields
    - Drag-and-drop reordering
    - _Requirements: 10.2_

  - [x] 11.3 Implement reading URL manager component (`src/components/studio/ReadingUrlManager.tsx`)
    - Add, edit, and remove external reading links
    - Fields: URL, platform name, display label
    - _Requirements: 10.4_

- [x] 12. Implement Studio image uploader component
  - [x] 12.1 Implement image uploader (`src/components/studio/ImageUploader.tsx`)
    - Drag-and-drop file upload zone with visual feedback
    - Progress indicator during upload processing
    - Preview of processed image after successful upload
    - Error display with actionable guidance (e.g., "Try a smaller file", "Check your connection")
    - Integration with `/api/media/upload` endpoint
    - _Requirements: 8.4, 18.5_

- [x] 13. Checkpoint - Ensure Studio CMS core tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement article services and publishing logic
  - [x] 14.1 Implement public article service (`src/services/articles.ts`)
    - `fetchPublishedArticles(options)` — query published articles with optional category/tag filters, pagination, sorted by publish_date DESC
    - `fetchArticleBySlug(slug)` — single article with joined category, tags, and featured image media asset
    - `fetchFeaturedArticles()` — articles where `featured = true` and state is published
    - `fetchArticleCategories()` — all categories sorted by sort_order
    - `fetchArticleTags()` — all tags
    - _Requirements: 11.2, 11.5, 11.6, 14.4, 14.5_

  - [x] 14.2 Implement studio article service (`src/services/studio-articles.ts`)
    - `studioFetchAllArticles()` — all articles regardless of publication state, with category and tag data
    - `studioCreateArticle(data)` — create article with auto-generated slug, calculated word count and reading time
    - `studioUpdateArticle(id, data)` — partial update with recalculated word count/reading time if body changed
    - `studioArchiveArticle(id)` — set publication_state to 'archived'
    - `studioDeleteArticle(id)` — hard delete article and tag assignments
    - `calculateReadingTime(body)` — `Math.ceil(wordCount / 200)` where wordCount is whitespace-separated non-empty tokens
    - _Requirements: 13.1, 13.3, 13.5, 13.7_

  - [x]* 14.3 Write unit tests for article services
    - Test `fetchPublishedArticles` returns only published articles sorted by date DESC
    - Test `fetchArticleBySlug` returns null for non-existent slug
    - Test `calculateReadingTime` returns correct values (e.g., 200 words = 1 min, 401 words = 3 min)
    - Test category and tag filtering logic
    - _Requirements: 11.2, 11.6, 13.3, 14.4, 14.5_

- [x] 15. Implement Studio Article Editor
  - [x] 15.1 Implement article editor component (`src/components/studio/ArticleEditor.tsx`)
    - Markdown editor textarea with toolbar shortcuts (headings, bold, italic, links, images, code blocks)
    - Split-pane live preview using `MarkdownRenderer` component
    - Auto-calculated word count and reading time displayed as user types
    - Full-width preview mode toggle
    - Fields: title, subtitle, markdown body, excerpt (max 300 chars), featured image upload, category select, tag multi-select, SEO title, SEO description (max 160 chars), publication state, scheduled date
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 15.2 Implement article listing page (`src/app/studio/articles/page.tsx`)
    - List all articles with publication state badges (draft/scheduled/published/archived)
    - Display publish date, category, word count for each article
    - Visual distinction between states (color-coded badges)
    - Actions: edit, archive, delete
    - _Requirements: 13.6_

  - [x] 15.3 Implement article create/edit pages (`src/app/studio/articles/new/page.tsx`, `src/app/studio/articles/[slug]/page.tsx`)
    - Create page renders `ArticleEditor` in create mode
    - Edit page loads existing article data and renders `ArticleEditor` in edit mode
    - Server actions for save (draft), publish, and schedule operations
    - Scheduled publishing: set publication_state='scheduled' with scheduled_date
    - _Requirements: 13.1, 13.5_

  - [x] 15.4 Implement scheduled publishing countdown in Studio
    - Display "Publishes in X hours/minutes" indicator for articles in 'scheduled' state
    - Visual countdown on article cards in listing page
    - _Requirements: 19.3_

- [ ] 16. Implement News/Editorial public pages
  - [x] 16.1 Implement markdown renderer (`src/components/news/MarkdownRenderer.tsx`)
    - Render markdown to React components using `react-markdown` + `remark-gfm`
    - Custom image component: render with responsive `srcset` from `media_assets` variants when available
    - Code block syntax highlighting with `rehype-highlight`
    - Editorial typography: max-width for 60-75 character line length, generous whitespace, typographic hierarchy
    - _Requirements: 11.4, 16.1_

  - [x] 16.2 Implement article card component (`src/components/news/ArticleCard.tsx`)
    - Featured image with blur placeholder and dominant color background
    - Title, excerpt, category badge, publication date, reading time
    - Hover animation with Framer Motion (subtle scale + shadow)
    - Featured variant: larger card layout with prominent imagery
    - Respect `prefers-reduced-motion`
    - _Requirements: 11.2, 11.5, 17.7_

  - [x] 16.3 Implement news landing page (`src/app/news/page.tsx`)
    - Server component fetching published articles via `fetchPublishedArticles()`
    - Featured section at top with large cards for editorially selected articles
    - Grid of recent articles below
    - Category filter controls and tag filter controls
    - Sorted by publish_date DESC
    - _Requirements: 11.1, 11.2, 11.5, 14.4, 14.5_

  - [x] 16.4 Implement article detail page (`src/app/news/[slug]/page.tsx`)
    - Server component fetching article by slug
    - Featured image displayed full content width with blur-up transition and dominant color background
    - Editorial typography layout with `MarkdownRenderer`
    - Display publication date, reading time, category badge, tags
    - Lazy-load body images below fold
    - _Requirements: 11.3, 11.4, 16.2, 16.3, 16.4_

  - [x] 16.5 Add "News" to top-level navigation
    - Add News navigation item adjacent to existing Stats item in the navigation bar
    - _Requirements: 11.1_

- [x] 17. Implement SEO and Open Graph for articles
  - [x] 17.1 Implement article page metadata and JSON-LD (`src/app/news/[slug]/page.tsx`)
    - Export `generateMetadata()` producing `<title>`, `<meta description>`, OG tags from article SEO fields
    - Fallback logic: use article title if no seo_title, use excerpt if no seo_description
    - Include JSON-LD structured data with `@type: "Article"`, headline, datePublished, dateModified, author, image
    - _Requirements: 15.1, 15.2, 15.3, 15.5_

  - [x] 17.2 Implement dynamic OG image generation (`src/app/api/og/article/route.tsx`)
    - Generate Open Graph image using Next.js `ImageResponse` API
    - Incorporate article title, category name, and featured image
    - Output 1200x630 image
    - _Requirements: 15.4_

  - [x]* 17.3 Write unit tests for SEO metadata generation
    - Test fallback: seo_title defaults to article title
    - Test fallback: seo_description defaults to excerpt
    - Test JSON-LD includes all required fields for published articles
    - Test OG image route returns valid image response
    - _Requirements: 15.1, 15.2, 15.3, 15.5_

- [x] 18. Checkpoint - Ensure news/editorial tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Implement migration script and final integration
  - [x] 19.1 Implement local-to-R2 migration script (`scripts/migrate-to-r2.ts`)
    - Read all existing processed images from `public/images/covers/` and `public/images/banners/`
    - Process each through Sharp pipeline (generate content hash, create variants if needed)
    - Upload to R2 with proper bucket structure
    - Create corresponding `media_assets` rows in Supabase
    - Generate migration report: total assets processed, successful uploads, failed uploads with error details, total R2 storage consumed
    - _Requirements: 6.1, 6.4_

  - [x] 19.2 Ensure `prefers-reduced-motion` respect for all new animations
    - Audit all Framer Motion and GSAP animations in Studio and News sections
    - Wrap animations in `useReducedMotion()` checks or `@media (prefers-reduced-motion: reduce)` queries
    - Provide static alternatives when motion is reduced
    - _Requirements: 17.7_

  - [x] 19.3 Performance audit for image-heavy pages
    - Verify all below-fold images use `loading="lazy"` or Intersection Observer
    - Verify above-fold hero/featured images use `priority` flag or `<link rel="preload">`
    - Verify CDN URLs are served (HTTP/2+ multiplexing handled by Cloudflare)
    - Verify initial page load transfer size < 500KB for library and news listing pages
    - Verify CLS < 0.1 with blur placeholders and aspect-ratio containers
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The tech stack is TypeScript throughout: Next.js 16, React 19, Tailwind v4, Supabase, GSAP, Framer Motion, Sharp, Cloudflare R2, TanStack Query, Zustand
- All Studio CMS routes use the existing proxy pattern (`src/proxy.ts`) for auth
- No `tailwind.config.js` — all tokens remain in `globals.css` with `@theme inline {}`
- GSAP usage follows existing pattern: dynamic imports via `getGSAP()` inside `useEffect`
- `@dnd-kit` is used for all drag-and-drop interactions (tier manager, gallery, curation)
- `react-markdown` + `remark-gfm` + `rehype-highlight` for article rendering
- No design.md exists for this spec — tasks are derived directly from requirements.md

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["2.4", "3.1", "3.2", "3.3", "3.4"] },
    { "id": 2, "tasks": ["5.1", "5.2", "5.3", "8.1", "8.2"] },
    { "id": 3, "tasks": ["5.4", "6.1", "6.2", "8.3"] },
    { "id": 4, "tasks": ["6.3", "9.1", "9.2", "9.3"] },
    { "id": 5, "tasks": ["10.1", "10.2", "12.1", "14.1", "14.2"] },
    { "id": 6, "tasks": ["10.3", "10.4", "10.5", "11.1", "11.2", "11.3", "14.3"] },
    { "id": 7, "tasks": ["15.1", "15.2", "15.3", "15.4", "16.1", "16.2"] },
    { "id": 8, "tasks": ["16.3", "16.4", "16.5", "17.1", "17.2"] },
    { "id": 9, "tasks": ["17.3", "19.1", "19.2", "19.3"] }
  ]
}
```
