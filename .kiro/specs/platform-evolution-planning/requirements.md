# Requirements Document

## Introduction

This document defines the requirements for three major system evolutions of Comic Curated — a cinematic personal manga/manhwa reading showcase built on Next.js 16, React 19, Tailwind v4, Supabase, GSAP, Lenis, and Framer Motion. The evolutions cover: (1) migrating the media layer from local filesystem to Cloudflare R2 with Sharp processing and CDN delivery, (2) replacing the current `/admin` CMS with a cinematic `/studio` creative workspace, and (3) introducing a News/Editorial content system. All three evolutions must preserve compatibility with the existing architecture and maintain the cinematic, premium experience that defines the application.

## Glossary

- **Image_Pipeline**: The server-side system that receives uploaded images, processes them through Sharp (resize, format conversion, blur placeholder generation, dominant color extraction), stores variants in R2, and writes metadata to Supabase.
- **R2_Storage**: Cloudflare R2 object storage service used as the primary binary asset store for all media files (covers, banners, thumbnails, article images, OG assets, generated variants).
- **CDN_Layer**: Cloudflare CDN edge caching layer that serves R2-stored assets to end users with cache headers and geographic distribution.
- **Studio_CMS**: The `/studio` route group — a cinematic, owner-only internal creative workspace for managing all content (titles, media, articles, curation).
- **Article_System**: The subsystem responsible for creating, editing, publishing, and displaying editorial/news content including markdown rendering, metadata, and categorization.
- **Owner**: The single authenticated user (site creator) who has full read/write access to all Studio CMS functionality via Supabase Auth with magic link login.
- **Supabase_Auth**: Supabase's built-in authentication service providing magic link login, session management, and JWT tokens for RLS policy enforcement.
- **RLS_Policy**: Row Level Security policies in PostgreSQL that enforce access control at the database level, ensuring public users can only read published content and the Owner has full access.
- **Sharp_Processor**: The Node.js Sharp library used server-side to resize images, convert formats (AVIF/WebP), generate blur placeholders, and extract dominant colors.
- **Media_Metadata**: The relational data stored in Supabase PostgreSQL describing media assets — URLs, dimensions, MIME types, blur data URIs, dominant colors, and variant references. Never binary data.
- **Bucket_Structure**: The hierarchical folder organization within R2 that separates assets by type (covers, banners, articles, thumbnails, og-assets, variants).
- **Content_Hash**: A SHA-256 hash of the original uploaded file content used as part of the R2 object key to prevent naming collisions and enable deduplication.
- **Article**: A piece of editorial content (news, commentary, recommendation, opinion) with markdown body, metadata, tags, categories, and publication state.
- **Publication_State**: The lifecycle state of an Article — draft, scheduled, published, or archived.
- **Reading_Time**: An estimated reading duration for an Article calculated from word count at approximately 200 words per minute.

---

## Requirements

### Requirement 1: R2 Bucket Provisioning and Structure

**User Story:** As the Owner, I want media assets organized in a well-defined R2 bucket structure, so that assets are discoverable, cacheable, and collision-free.

#### Acceptance Criteria

1. THE Image_Pipeline SHALL store all processed media assets in R2_Storage using the bucket structure: `covers/{slug}/{content_hash}/{variant}.{format}`, `banners/{slug}/{content_hash}/{variant}.{format}`, `articles/{article_slug}/{content_hash}/{variant}.{format}`, `thumbnails/{slug}/{content_hash}/{size}.{format}`, `og-assets/{slug}/{content_hash}.{format}`, `variants/{slug}/{content_hash}/{descriptor}.{format}`
2. THE Image_Pipeline SHALL generate a Content_Hash (SHA-256 of the original file bytes, truncated to 12 hex characters) for each uploaded asset and include the Content_Hash in the R2 object key
3. THE Image_Pipeline SHALL reject an upload and return a descriptive error WHEN the uploaded file MIME type is not one of `image/jpeg`, `image/png`, `image/webp`, `image/avif`, or `image/gif`
4. THE Image_Pipeline SHALL enforce a maximum upload file size of 10 MB per source image
5. IF two uploads produce the same Content_Hash for the same slug and asset type, THEN THE Image_Pipeline SHALL overwrite the existing object rather than creating a duplicate path

---

### Requirement 2: Sharp Image Processing Pipeline

**User Story:** As the Owner, I want uploaded images automatically processed into optimized responsive variants with blur placeholders and color data, so that the public site delivers fast, visually rich image experiences.

#### Acceptance Criteria

1. WHEN a source image is uploaded, THE Sharp_Processor SHALL generate responsive variants at widths 320px, 480px, 640px, and 1200px for cover images, and 768px, 1200px, and 1920px for banner images
2. WHEN a source image is uploaded, THE Sharp_Processor SHALL encode each variant in both AVIF (quality 65) and WebP (quality 75) formats
3. WHEN a source image is uploaded, THE Sharp_Processor SHALL generate a Low Quality Image Placeholder (LQIP) by resizing to 20px width, applying Gaussian blur with sigma 3, encoding as JPEG at quality 30, and converting to a base64 data URI
4. WHEN a source image is uploaded, THE Sharp_Processor SHALL extract the dominant color as a hex string using Sharp's stats method
5. WHEN a source image is uploaded, THE Sharp_Processor SHALL extract and record the original dimensions (width and height in pixels), aspect ratio, and MIME type
6. WHEN all variants are generated and uploaded to R2_Storage, THE Image_Pipeline SHALL write Media_Metadata to Supabase containing: the R2 public URL for each variant, original dimensions, aspect ratio, MIME type, blur data URI, dominant color hex, Content_Hash, and file sizes per variant
7. THE Image_Pipeline SHALL store zero binary image data in Supabase — only URLs, dimensions, MIME types, blur data URIs, dominant colors, and reference metadata

---

### Requirement 3: CDN Caching and Delivery

**User Story:** As a visitor, I want images served from edge locations with aggressive caching, so that pages load quickly regardless of geographic location.

#### Acceptance Criteria

1. THE CDN_Layer SHALL serve all R2-stored assets with the HTTP header `Cache-Control: public, max-age=31536000, immutable`
2. THE CDN_Layer SHALL serve assets with the correct `Content-Type` header matching the stored format (e.g., `image/avif`, `image/webp`)
3. WHEN an asset is updated (same slug, new Content_Hash), THE Image_Pipeline SHALL generate a new R2 object key containing the new Content_Hash, ensuring CDN cache invalidation through URL change rather than purge requests
4. THE CDN_Layer SHALL support custom domain configuration (e.g., `cdn.comic-curated.com`) for serving assets

---

### Requirement 4: R2 Environment and Security Configuration

**User Story:** As the Owner, I want R2 credentials securely managed and never exposed to the client, so that the storage layer remains protected.

#### Acceptance Criteria

1. THE Image_Pipeline SHALL authenticate to R2_Storage using server-side environment variables: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL`
2. THE Image_Pipeline SHALL access R2 credentials exclusively from server-side code (API routes, server actions) and never expose credentials to client-side bundles
3. IF any required R2 environment variable is missing at server startup, THEN THE Image_Pipeline SHALL log a descriptive error message identifying the missing variable and refuse to process uploads
4. THE Image_Pipeline SHALL use the S3-compatible API provided by Cloudflare R2 for all object operations (put, get, delete, list)

---

### Requirement 5: Media Metadata Database Schema

**User Story:** As the Owner, I want a structured database schema for media metadata, so that the application can efficiently query image URLs, dimensions, and placeholder data without storing binary content.

#### Acceptance Criteria

1. THE Supabase database SHALL contain a `media_assets` table with columns: `id` (UUID primary key), `slug` (text, not null), `asset_type` (text, constrained to 'cover', 'banner', 'article-image', 'thumbnail', 'og-asset'), `content_hash` (text, not null), `original_width` (integer), `original_height` (integer), `aspect_ratio` (numeric), `mime_type` (text), `dominant_color` (text), `blur_data_uri` (text), `variants` (JSONB containing URL, width, format, and file size per variant), `r2_base_path` (text), `created_at` (timestamptz), `updated_at` (timestamptz)
2. THE `media_assets` table SHALL have a unique constraint on the combination of `slug`, `asset_type`, and `content_hash`
3. THE `media_assets` table SHALL have RLS_Policy enabling public SELECT access and Owner-only INSERT, UPDATE, and DELETE access
4. WHEN a media asset is deleted from the Studio_CMS, THE Image_Pipeline SHALL delete the corresponding R2 objects and remove the `media_assets` row from Supabase

---

### Requirement 6: Migration from Local Filesystem to R2

**User Story:** As the Owner, I want existing local filesystem images migrated to R2 without breaking current URLs or requiring manual re-upload, so that the transition is seamless.

#### Acceptance Criteria

1. THE Image_Pipeline SHALL provide a migration script that reads all existing processed images from `public/images/covers/` and `public/images/banners/`, uploads them to R2_Storage with the defined bucket structure, and creates corresponding `media_assets` rows in Supabase
2. WHILE the migration is in progress, THE application SHALL continue serving images from the local filesystem for any asset not yet migrated to R2
3. WHEN a title's media has been migrated to R2, THE application SHALL serve that title's images from the CDN_Layer URL stored in `media_assets.variants`
4. THE migration script SHALL generate a report listing: total assets processed, successful uploads, failed uploads with error details, and total R2 storage consumed

---

### Requirement 7: Studio CMS Route Architecture

**User Story:** As the Owner, I want the admin interface replaced with a cinematic `/studio` creative workspace, so that content management feels premium and immersive rather than utilitarian.

#### Acceptance Criteria

1. THE Studio_CMS SHALL be accessible exclusively at the `/studio` route group, replacing the current `/admin` route group entirely
2. THE Studio_CMS SHALL remove the current email/password login and authenticate the Owner exclusively via Supabase_Auth magic link login
3. WHEN an unauthenticated user navigates to any `/studio` route, THE Studio_CMS SHALL redirect the user to the `/studio/login` page
4. WHEN the Owner completes magic link authentication, THE Studio_CMS SHALL establish a session and redirect to the `/studio` dashboard
5. THE Studio_CMS SHALL protect all `/studio` routes using the Next.js 16 proxy pattern (in `src/proxy.ts`) verifying the Supabase session JWT on each request
6. IF the Owner's session expires or becomes invalid, THEN THE Studio_CMS SHALL redirect to `/studio/login` with a session expiration message

---

### Requirement 8: Studio CMS Title Management

**User Story:** As the Owner, I want to create, edit, and manage manga/manhwa titles through a cinematic interface with drag-and-drop tier management, so that curating the collection feels creative rather than administrative.

#### Acceptance Criteria

1. THE Studio_CMS SHALL provide a title creation form supporting all fields: English title, original title, alternative titles, origin, series status, reading status, chapters read, total chapters, dates, tier, synopsis, vibe check, quotable lines, featured flag, and hidden flag
2. THE Studio_CMS SHALL provide a title editing interface that loads existing title data and allows modification of all fields
3. THE Studio_CMS SHALL provide a drag-and-drop tier management interface where the Owner can visually move titles between tier levels (SSS+, S, A, B, C, D, F)
4. THE Studio_CMS SHALL provide media upload functionality integrated with the Image_Pipeline for assigning cover images and banner images to titles
5. THE Studio_CMS SHALL provide genre and mood assignment interfaces allowing the Owner to tag titles with multiple genres and moods from the existing taxonomy
6. THE Studio_CMS SHALL provide a markdown review editor with live preview for writing and editing title reviews
7. THE Studio_CMS SHALL provide a homepage curation interface for selecting featured titles and controlling their display order

---

### Requirement 9: Studio CMS Visual Experience

**User Story:** As the Owner, I want the Studio CMS to feel cinematic, premium, and immersive — matching the public site's aesthetic — so that the creative workflow is inspiring rather than tedious.

#### Acceptance Criteria

1. THE Studio_CMS SHALL use the same design system (colors, typography, spacing, motion) defined in `globals.css` as the public-facing site
2. THE Studio_CMS SHALL incorporate motion design (Framer Motion transitions, subtle GSAP scroll effects) consistent with the application's animation guidelines
3. THE Studio_CMS SHALL present content management interfaces using card-based layouts, rich previews, and visual hierarchy rather than table-based spreadsheet layouts
4. THE Studio_CMS SHALL provide a live preview capability allowing the Owner to see how content appears on the public site before publishing changes
5. THE Studio_CMS SHALL use dark theme as the default interface appearance, consistent with the cinematic aesthetic of the public site

---

### Requirement 10: Studio CMS Gallery and Character Management

**User Story:** As the Owner, I want to manage gallery images and character profiles for each title through the Studio, so that rich visual content can be curated without direct database manipulation.

#### Acceptance Criteria

1. THE Studio_CMS SHALL provide a gallery management interface for each title, allowing the Owner to upload images, assign categories (best-scene, romantic-scene, funny-scene, general, cover), add captions, and reorder via drag-and-drop
2. THE Studio_CMS SHALL provide a character management interface for each title, allowing the Owner to add characters with name, role (main, supporting, antagonist, side), description, and sort order
3. WHEN gallery images are uploaded through the Studio_CMS, THE Image_Pipeline SHALL process them through Sharp and store variants in R2_Storage
4. THE Studio_CMS SHALL provide a reading URL management interface for each title, allowing the Owner to add, edit, and remove external reading links with platform and label

---

### Requirement 11: News/Editorial Navigation and Public Display

**User Story:** As a visitor, I want a "News" section accessible from the top-level navigation alongside Stats, so that I can discover editorial content, industry commentary, and curated recommendations.

#### Acceptance Criteria

1. THE application SHALL add a "News" navigation item to the top-level navigation bar, positioned adjacent to the existing "Stats" item
2. THE application SHALL display the News landing page at the `/news` route showing a grid of published articles sorted by publication date (newest first)
3. THE application SHALL display individual articles at `/news/{article-slug}` with full markdown rendering, featured image, author attribution, publication date, Reading_Time estimate, tags, and category
4. THE application SHALL render articles with editorial typography treatment inspired by premium magazine layouts — generous whitespace, readable line lengths (60-75 characters), and typographic hierarchy
5. THE application SHALL display a "Featured" section on the News landing page highlighting editorially selected articles with larger cards and prominent imagery
6. WHEN an article has a `scheduled` Publication_State with a future publish date, THE application SHALL not display the article to public visitors until the publish date has passed

---

### Requirement 12: Article Database Schema

**User Story:** As the Owner, I want a structured database schema for articles, tags, and categories, so that editorial content is queryable, filterable, and supports rich metadata.

#### Acceptance Criteria

1. THE Supabase database SHALL contain an `articles` table with columns: `id` (UUID primary key), `slug` (text, unique, not null), `title` (text, not null), `subtitle` (text), `body` (text, not null, markdown content), `excerpt` (text, max 300 characters), `featured_image_id` (UUID, references `media_assets`), `category_id` (UUID, references `article_categories`), `publication_state` (text, constrained to 'draft', 'scheduled', 'published', 'archived'), `publish_date` (timestamptz), `scheduled_date` (timestamptz), `featured` (boolean, default false), `seo_title` (text), `seo_description` (text, max 160 characters), `word_count` (integer), `reading_time_minutes` (integer), `created_at` (timestamptz), `updated_at` (timestamptz)
2. THE Supabase database SHALL contain an `article_categories` table with columns: `id` (UUID primary key), `name` (text, unique, not null), `slug` (text, unique, not null), `description` (text), `color` (text), `sort_order` (integer)
3. THE Supabase database SHALL contain an `article_tags` table with columns: `id` (UUID primary key), `name` (text, unique, not null), `slug` (text, unique, not null)
4. THE Supabase database SHALL contain an `article_tag_assignments` junction table with columns: `article_id` (UUID, references `articles`), `tag_id` (UUID, references `article_tags`), with a composite primary key on both columns
5. THE `articles` table SHALL have RLS_Policy enabling public SELECT access only for rows where `publication_state = 'published'` AND (`publish_date IS NULL` OR `publish_date <= NOW()`), and Owner-only access for all operations
6. THE `article_categories` and `article_tags` tables SHALL have RLS_Policy enabling public SELECT access and Owner-only INSERT, UPDATE, and DELETE access

---

### Requirement 13: Article Publishing Workflow in Studio CMS

**User Story:** As the Owner, I want to write, preview, schedule, and publish articles through the Studio CMS with a markdown editor, so that editorial content creation is streamlined and professional.

#### Acceptance Criteria

1. THE Studio_CMS SHALL provide an article creation interface with fields for: title, subtitle, markdown body, excerpt, featured image upload, category selection, tag assignment, SEO title, SEO description, and publication state
2. THE Studio_CMS SHALL provide a markdown editor with syntax highlighting, toolbar shortcuts (headings, bold, italic, links, images, code blocks), and split-pane live preview
3. THE Studio_CMS SHALL automatically calculate and display word count and Reading_Time (at 200 words per minute) as the Owner types
4. THE Studio_CMS SHALL provide a full-width preview mode showing the article exactly as it will appear on the public `/news/{slug}` page
5. WHEN the Owner sets Publication_State to 'scheduled' and provides a scheduled_date, THE Article_System SHALL automatically transition the article to 'published' state when the scheduled_date is reached
6. THE Studio_CMS SHALL provide an article listing interface showing all articles with their Publication_State, publish date, category, word count, and a visual indicator of draft vs published status
7. THE Studio_CMS SHALL allow the Owner to archive published articles, removing them from public display while preserving the content in the database

---

### Requirement 14: Article Content Types and Categories

**User Story:** As the Owner, I want predefined article categories covering the editorial scope (hiatus news, axed series, release announcements, industry commentary, recommendations, editorials, curated opinions), so that content is organized and discoverable by visitors.

#### Acceptance Criteria

1. THE Article_System SHALL support the following default categories seeded into `article_categories`: Hiatus News, Axed Series, Release Announcements, Industry Commentary, Recommendations, Editorials, and Curated Opinions
2. THE Studio_CMS SHALL allow the Owner to create additional custom categories beyond the defaults
3. THE Studio_CMS SHALL allow the Owner to assign exactly one category per article
4. THE application SHALL display category-based filtering on the News landing page, allowing visitors to browse articles by category
5. THE application SHALL display tag-based filtering on the News landing page, allowing visitors to browse articles by tag

---

### Requirement 15: Article SEO and Social Sharing

**User Story:** As the Owner, I want articles to have proper SEO metadata and social sharing cards, so that editorial content is discoverable via search engines and shareable on social platforms.

#### Acceptance Criteria

1. WHEN an article is published, THE application SHALL generate an HTML page with `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, and `<meta property="og:type" content="article">` tags populated from the article's SEO fields and featured image
2. WHEN an article has no custom SEO title, THE application SHALL use the article title as the SEO title
3. WHEN an article has no custom SEO description, THE application SHALL use the article excerpt as the SEO description
4. THE application SHALL generate a dynamic Open Graph image for each published article using the Next.js OG image generation route, incorporating the article title, category, and featured image
5. THE application SHALL include structured data (JSON-LD) with `@type: "Article"` schema on each published article page, including headline, datePublished, dateModified, author, and image

---

### Requirement 16: Responsive Image Delivery for Articles

**User Story:** As a visitor reading an article, I want inline images to load quickly with blur-up placeholders and responsive sizing, so that the reading experience is smooth on all devices.

#### Acceptance Criteria

1. WHEN an image is embedded in article markdown, THE application SHALL render the image using responsive `srcset` attributes with AVIF and WebP variants at appropriate breakpoints
2. WHEN an article's featured image is displayed, THE application SHALL show the blur placeholder (LQIP) immediately and transition to the full image on load
3. THE application SHALL lazy-load article body images that are below the viewport fold
4. THE application SHALL display the featured image above the article body at full content width with the dominant color as the background placeholder

---

### Requirement 17: Existing Architecture Compatibility

**User Story:** As the Owner, I want all three evolutions to integrate cleanly with the existing Next.js 16, Supabase, GSAP, Lenis, and Framer Motion architecture, so that no existing functionality is broken.

#### Acceptance Criteria

1. THE Studio_CMS SHALL use the existing Supabase client configuration (`@supabase/ssr` and `@supabase/supabase-js`) without introducing additional authentication providers
2. THE application SHALL continue using the Next.js 16 proxy pattern (`src/proxy.ts`) for route protection, extending it to cover `/studio` routes
3. THE application SHALL continue using GSAP exclusively via dynamic imports (`getGSAP()` inside `useEffect`) as established in the architecture rules
4. THE application SHALL continue using Tailwind v4 with `@theme inline {}` in `globals.css` for all design tokens — no `tailwind.config.js` file shall be introduced
5. THE application SHALL continue using TanStack Query for all public data fetching and Zustand for client-side UI state
6. THE application SHALL maintain Lighthouse Performance scores above 85 and Accessibility scores above 90 after all three evolutions are implemented
7. THE application SHALL continue respecting `prefers-reduced-motion` for all new animations introduced in the Studio CMS and News sections

---

### Requirement 18: Error Handling and Resilience

**User Story:** As the Owner, I want clear error feedback when uploads fail, R2 is unreachable, or processing encounters issues, so that problems are diagnosable and recoverable.

#### Acceptance Criteria

1. IF the R2_Storage service is unreachable during an upload, THEN THE Image_Pipeline SHALL return an error response with HTTP status 503 and a message indicating the storage service is unavailable
2. IF Sharp_Processor fails to process an image (corrupt file, unsupported internal format), THEN THE Image_Pipeline SHALL return an error response with HTTP status 422 and a message describing the processing failure
3. IF an upload exceeds the 10 MB size limit, THEN THE Image_Pipeline SHALL reject the upload before processing with HTTP status 413 and a message stating the maximum allowed size
4. WHEN an error occurs during image processing, THE Image_Pipeline SHALL not leave partial variants in R2_Storage — either all variants are uploaded successfully or none are persisted (atomic operation)
5. THE Studio_CMS SHALL display user-friendly error messages in the interface when upload or processing operations fail, including actionable guidance (e.g., "Try a smaller file" or "Check your connection")

---

### Requirement 19: Scheduled Publishing Automation

**User Story:** As the Owner, I want scheduled articles to publish automatically at the designated time without manual intervention, so that content can be prepared in advance and released on a predictable cadence.

#### Acceptance Criteria

1. WHEN the current time reaches or exceeds an article's `scheduled_date`, THE Article_System SHALL transition the article's Publication_State from 'scheduled' to 'published' and set `publish_date` to the `scheduled_date` value
2. THE Article_System SHALL check for scheduled articles that are due for publication at a frequency of no less than once every 5 minutes
3. THE Studio_CMS SHALL display a visual countdown or "Publishes in X hours" indicator for articles in 'scheduled' state
4. IF the scheduled publishing mechanism fails to transition an article on time, THEN THE Article_System SHALL log the failure and retry on the next check cycle without losing the article content

---

### Requirement 20: Performance Constraints for Image-Heavy Pages

**User Story:** As a visitor browsing the library or news pages, I want pages with many images to remain performant and responsive, so that the cinematic experience is not degraded by media load times.

#### Acceptance Criteria

1. THE application SHALL lazy-load all images below the initial viewport fold using native `loading="lazy"` or Intersection Observer
2. THE application SHALL preload above-the-fold hero and featured images using `priority` flag or `<link rel="preload">`
3. THE application SHALL serve images from the CDN_Layer with HTTP/2 or HTTP/3 multiplexing to enable parallel asset downloads
4. THE application SHALL limit the total transfer size of the initial page load (HTML + critical CSS + above-fold images) to under 500 KB for library and news listing pages
5. WHILE images are loading, THE application SHALL display the blur placeholder with dominant color background to prevent layout shift (Cumulative Layout Shift below 0.1)
