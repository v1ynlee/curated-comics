<div align="center">

# Comic Curated

**A cinematic personal comic-reading showcase with a full Studio CMS, R2 media pipeline, and editorial news system.**

Comic Curated is a production-grade web application that functions as a personal reading archive, curated recommendation platform, and interactive showcase — wrapped in a premium anime-inspired experience. It solves the problem of having no beautiful, personal home for your manhwa, manhua, and manga collection: instead of a spreadsheet or a generic tracker, you get a site that feels like stepping into a cinematic anime world, where every scroll tells a story and every interaction has weight.

[![CI](https://github.com/v1ynlee/curated-comics/actions/workflows/ci.yml/badge.svg)](https://github.com/v1ynlee/curated-comics/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://comic-curated.com) · [Report Bug](https://github.com/v1ynlee/curated-comics/issues) · [Request Feature](https://github.com/v1ynlee/curated-comics/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Studio CMS](#studio-cms)
- [Media Pipeline (Cloudflare R2)](#media-pipeline-cloudflare-r2)
- [News & Editorial System](#news--editorial-system)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Comic Curated is a **personal reading archive and showcase** for Korean manhwa, Chinese manhua, and Japanese manga. It is not a generic tracker or dashboard — it is an **interactive anime museum** designed to communicate deep passion for comics through every pixel, animation, and interaction.

### What it does

| Feature | Description |
|---------|-------------|
| **Reading Library** | Browse 300–500+ titles across 9 reading categories |
| **Mood Discovery** | Find titles by vibe — 16 custom moods like "Aura Farming", "Brainrot", "Villainess Era" |
| **Tier List** | Visual SSS+ → F tier ranking with per-tier horizontal scroll |
| **Multi-Dimensional Ratings** | 6-axis rating system: overall, emotional, art, story, pacing, ending |
| **Statistics Dashboard** | Animated charts for genre distribution, reading timeline, yearly arc, streaks |
| **Achievement System** | 18 unlockable badges with rarity tiers, progress rings, and detail modals |
| **Studio CMS** | Cinematic owner-only workspace: manage titles, articles, media, and curation |
| **News / Editorial** | Full article publishing system with markdown, categories, tags, and SEO |
| **R2 Media Pipeline** | Cloudflare R2 storage with Sharp processing, CDN delivery, and blur placeholders |
| **Search** | Fuzzy full-text search across the entire archive |
| **PWA** | Installable with offline support via service worker |
| **RSS Feed** | Auto-generated feed of new additions at `/feed.xml` |
| **Dynamic OG Images** | Per-title and per-article social sharing cards generated at the edge |

---

## Features

### Public Site

- **Cinematic Hero** — Full-viewport landing with GSAP parallax, Framer Motion first-load sequence, and CSS-only particle field
- **Library Browse** — Responsive grid (2-col mobile → 6-col desktop), genre/mood filters, sort controls, category tabs with ARIA tablist
- **Title Detail** — Immersive hero with blurred cover backdrop, animated rating bars, spoiler-toggle review, quotable lines, related titles carousel
- **Discover** — Mood-based browsing with per-mood atmospheric backgrounds that transition with `AnimatePresence`
- **Tier List** — Visual tier rows with glow/gradient text effects and horizontal scroll carousels
- **Statistics** — Animated number counters, genre bar chart, monthly timeline, yearly arc, reading streak
- **Achievements** — Badge grid grouped by rarity, circular progress rings, detail modals with unlock dates
- **Search** — Debounced full-text search powered by PostgreSQL `websearch_to_tsquery`
- **News** — Editorial articles with markdown rendering, category/tag filters, featured section, and reading time estimates

### Studio CMS

- **Magic Link Auth** — Passwordless login via Supabase OTP; session managed with `@supabase/ssr` cookies
- **Title Management** — Full CRUD with all fields: tier, genres, moods, synopsis, vibe check, quotable lines, review (markdown with live preview), featured/hidden flags
- **Drag-and-Drop Tier Manager** — Visual columns for SSS+/S/A/B/C/D/F using `@dnd-kit`; drag titles between tiers
- **Gallery Manager** — Per-title gallery with drag-and-drop reordering, category assignment, and inline caption editing
- **Character Manager** — Add/edit/reorder characters with role badges (main, supporting, antagonist, side)
- **Reading URL Manager** — Add/edit/remove external reading links with platform and label
- **Article Editor** — Markdown editor with toolbar shortcuts, split-pane live preview, word count, reading time, SEO fields, and scheduled publishing
- **Homepage Curation** — Select featured titles and control display order with live preview
- **Image Uploader** — Drag-and-drop upload with progress indicator, preview, and actionable error messages
- **Route Protection** — Next.js 16 Proxy guards all `/studio` routes; unauthenticated users redirected to login

### Media Pipeline

- **Cloudflare R2 Storage** — S3-compatible object storage with zero egress fees and native CDN integration
- **Sharp Processing** — AVIF (quality 65) + WebP (quality 75) at 4 responsive widths; LQIP blur placeholder; dominant color extraction
- **Content-Hash Keys** — SHA-256 content hash in R2 object keys for cache invalidation via URL change
- **Atomic Uploads** — All variants upload or none persist (rollback on failure)
- **Dual-Source CoverImage** — Serves from R2 CDN when available, falls back to local filesystem
- **Migration Script** — `scripts/migrate-to-r2.ts` migrates existing local images to R2 with a full report

### News & Editorial

- **Markdown Rendering** — `react-markdown` + `remark-gfm` + `rehype-highlight` with editorial typography (60–75 char line length)
- **Article Cards** — Blur-up featured images, category badges, reading time, Framer Motion hover animations
- **Category & Tag Filters** — URL-based filtering on the news landing page
- **Scheduled Publishing** — Set a future date; Supabase `pg_cron` auto-publishes every 5 minutes
- **SEO & JSON-LD** — `generateMetadata()` with fallbacks, Open Graph tags, `@type: Article` structured data
- **Dynamic OG Images** — 1200×630 article OG images via Next.js `ImageResponse`

### Interactions

- **Card tilt physics** — 3D perspective tilt on hover via mouse position (desktop only, reduced-motion safe)
- **Custom cursor** — Dot + lagged ring cursor using RAF loop (high-performance devices only)
- **Keyboard shortcuts** — `/` search, `g+h/l/d/t/s/n` navigation, `?` help modal
- **Easter egg** — Konami code (↑↑↓↓←→←→BA) triggers a celebration toast
- **Smooth scroll** — Lenis drives all scroll behavior, synced to GSAP's ticker (single RAF loop)
- **Theme toggle** — Light/dark mode with View Transition API crossfade

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org) | 16.2 | Framework, App Router, SSR, image optimization |
| [React](https://react.dev) | 19 | UI library with React Compiler enabled |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety (strict mode) |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Utility-first styling via `@theme inline` (no config file) |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Page transitions, layout animations, scroll reveals |
| [GSAP + ScrollTrigger](https://gsap.com) | 3.15 | Complex scroll-linked animations, parallax timelines |
| [Lenis](https://lenis.darkroom.engineering) | 1.3 | Smooth scroll (synced to GSAP ticker) |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | Client state (UI store, Library store) |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state, caching, prefetching |
| [@dnd-kit](https://dndkit.com) | 6 | Accessible drag-and-drop (tier manager, gallery, curation) |
| [react-markdown](https://github.com/remarkjs/react-markdown) | 9 | Markdown rendering for articles and reviews |

### Backend & Infrastructure

| Technology | Purpose |
|------------|---------|
| [Supabase](https://supabase.com) | PostgreSQL database, Auth (magic link), Row Level Security, pg_cron |
| [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side) | Cookie-based auth for Next.js App Router |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | S3-compatible object storage for media assets |
| [Sharp](https://sharp.pixelplumbing.com) | Server-side image processing (AVIF, WebP, LQIP, dominant color) |
| [AWS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) | S3-compatible R2 client (`@aws-sdk/client-s3`) |
| [Vitest](https://vitest.dev) | Unit and integration testing |
| [GitHub Actions](https://github.com/features/actions) | CI/CD: lint → build → migrate |
| [Vercel](https://vercel.com) | Hosting, edge deployment, CDN |

---

## Project Architecture

```
Browser Request
      |
      v
+-------------------------------------------------------------+
|  Next.js 16 App Router                                       |
|                                                              |
|  src/proxy.ts ---- Auth guard for /studio routes            |
|                                                              |
|  Public Routes          Studio Routes (protected)           |
|  /                      /studio                             |
|  /library               /studio/titles                      |
|  /title/[slug]          /studio/titles/new                  |
|  /discover              /studio/titles/[slug]               |
|  /tiers                 /studio/articles                    |
|  /stats                 /studio/articles/new                |
|  /news                  /studio/articles/[slug]             |
|  /news/[slug]           /studio/media                       |
|  /search                /studio/curation                    |
|  /feed.xml              /studio/login                       |
|                                                              |
|  API Routes                                                  |
|  /api/media/upload      /api/media/delete                   |
|  /api/og/article        /auth/callback                      |
+-------------------------------------------------------------+
      |                           |                    |
      v                           v                    v
+--------------+         +------------------+  +--------------+
|  TanStack    |         |  Supabase        |  |  Cloudflare  |
|  Query Cache |<------->|  PostgreSQL      |  |  R2 Storage  |
|  (5min TTL)  |         |  + Auth + RLS    |  |  + CDN       |
+--------------+         +------------------+  +--------------+

Data Flow:
  Supabase -> services/ -> TanStack Query -> Components
  Upload -> Sharp -> R2 -> media_assets (Supabase) -> CDN URLs
  User Action -> Zustand Store -> Reactive UI
  Scroll -> Lenis -> GSAP ScrollTrigger -> Animation
  Route Change -> Framer Motion -> Page Transition
  Magic Link -> /auth/callback -> Session Cookies -> /studio
```

### Key Design Decisions

- **Tailwind v4** - CSS-first configuration via `@theme inline {}` in `globals.css`. No `tailwind.config.js`. All design tokens are CSS custom properties.
- **Single RAF loop** - Lenis drives all scroll behavior. GSAP ticker drives Lenis. One `requestAnimationFrame` for everything.
- **R2 over Supabase Storage** - S3-compatible API, zero egress fees, native CDN integration, content-hash keys for cache invalidation.
- **Magic link auth** - No passwords. Supabase OTP sends a link; `/auth/callback` exchanges the code for session cookies.
- **Server + Client split** - Title/article detail pages use server components for SSR + `generateMetadata`. Interactive parts are client components.
- **RLS security** - All database access governed by Supabase Row Level Security. Public users get SELECT on non-hidden/published content. Authenticated owner has full access.
- **Atomic media uploads** - Either all Sharp-processed variants upload to R2 or none persist (rollback on failure).

---

## Folder Structure

```
curated-comics/
+-- .github/workflows/ci.yml          # Lint -> Build -> DB migrate pipeline
+-- docs/                             # Architecture, design, and devlog docs
+-- public/images/covers/             # Local cover images (fallback before R2)
+-- scripts/
|   +-- generate-placeholders.js      # Sharp-based placeholder image generator
|   +-- migrate-to-r2.ts              # Migrate local images to Cloudflare R2
+-- src/
|   +-- app/
|   |   +-- auth/callback/            # Magic link token exchange route
|   |   +-- api/media/upload/         # Authenticated image upload endpoint
|   |   +-- api/media/delete/         # Authenticated image delete endpoint
|   |   +-- api/og/article/           # Dynamic OG image generation (1200x630)
|   |   +-- news/                     # News landing page + article detail
|   |   +-- studio/                   # Studio CMS (auth-protected)
|   |   |   +-- login/                # Magic link login page
|   |   |   +-- titles/               # Title listing, create, edit
|   |   |   +-- articles/             # Article listing, create, edit
|   |   |   +-- curation/             # Homepage featured title curation
|   |   |   +-- page.tsx              # Studio dashboard
|   |   +-- discover/                 # Mood-based discovery
|   |   +-- library/                  # Reading archive browse
|   |   +-- stats/                    # Statistics + achievements
|   |   +-- tiers/                    # Tier list
|   |   +-- title/[slug]/             # Title detail
|   |   +-- globals.css               # Design system (Tailwind v4 @theme)
|   |   +-- layout.tsx                # Root layout (fonts, providers, nav)
|   +-- components/
|   |   +-- news/                     # MarkdownRenderer, ArticleCard, NewsFilters
|   |   +-- studio/                   # TitleEditor, ArticleEditor, TierManager,
|   |   |                             # GalleryManager, CharacterManager,
|   |   |                             # ImageUploader, ScheduledCountdown, etc.
|   |   +-- layout/                   # Navigation (with News), MobileNav, Footer
|   |   +-- ui/                       # CoverImage (R2/local dual-source), etc.
|   +-- lib/
|   |   +-- r2-client.ts              # Cloudflare R2 S3-compatible client
|   |   +-- image-processor.ts        # Sharp processing pipeline
|   |   +-- r2-paths.ts               # R2 key path builder
|   |   +-- atomic-upload.ts          # Atomic multi-variant upload with rollback
|   +-- services/
|   |   +-- articles.ts               # Public article queries
|   |   +-- media.ts                  # Media asset queries + URL resolution
|   |   +-- studio-articles.ts        # Studio article CRUD
|   +-- types/
|   |   +-- media.ts                  # MediaAsset, MediaVariant, AssetType
|   |   +-- article.ts                # Article, ArticleSummary, ArticleFormData
|   |   +-- studio.ts                 # TitleFormData, StudioArticleRow
|   +-- proxy.ts                      # Next.js 16 proxy (auth guard for /studio)
+-- supabase/migrations/              # 23 numbered SQL migration files
+-- .env.local.example                # Detailed environment variable template
+-- vitest.config.ts                  # Test configuration
+-- package.json
```

---

## Prerequisites

- **Node.js** >= 20 ([download](https://nodejs.org))
- **npm** >= 10 (comes with Node.js)
- **Supabase CLI** ([install guide](https://supabase.com/docs/guides/cli/getting-started))
- A **Supabase account** with a project created ([supabase.com](https://supabase.com))
- A **Cloudflare account** with an R2 bucket (optional for local dev)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/v1ynlee/curated-comics.git
cd curated-comics
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values (see [Environment Variables](#environment-variables)).

### 4. Set up the database

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push --yes
```

### 5. Generate placeholder images (development only)

```bash
node scripts/generate-placeholders.js
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL of your site |
| `R2_ACCOUNT_ID` | For uploads | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | For uploads | R2 API token access key ID |
| `R2_SECRET_ACCESS_KEY` | For uploads | R2 API token secret access key |
| `R2_BUCKET_NAME` | For uploads | Name of your R2 bucket |
| `R2_PUBLIC_URL` | For uploads | Public CDN URL (e.g. `https://cdn.your-domain.com`) |

> R2 variables are **server-side only** and never exposed to client bundles.

### Supabase Auth - Magic Link Redirect URL

For magic link login to work, add the callback URL to your Supabase project:

1. Go to **Supabase Dashboard -> Authentication -> URL Configuration**
2. Add to **Redirect URLs**: `http://localhost:3000/auth/callback`
3. Add your production URL: `https://your-domain.com/auth/callback`

### CI/CD Secrets (GitHub Actions)

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Your Supabase personal access token |
| `SUPABASE_DB_PASSWORD` | Your Supabase database password |
| `SUPABASE_PROJECT_REF` | Your project reference ID |

---

## Database Setup

All 23 migrations are in `supabase/migrations/`.

| Table | Purpose |
|-------|---------|
| `titles` | Core entity - all title metadata, reading status, tier, featured order |
| `ratings` | 6-dimension ratings per title |
| `reviews` | Personal reviews with spoiler handling |
| `genres` | 23 predefined genres |
| `moods` | 16 custom mood categories |
| `title_genres` | Many-to-many: titles <-> genres |
| `title_moods` | Many-to-many: titles <-> moods |
| `external_links` | Reading platform links per title |
| `achievements` | 18 unlockable badges |
| `media_assets` | R2 media metadata: URLs, dimensions, blur URI, dominant color, variants JSONB |
| `articles` | Editorial articles with publication state and SEO fields |
| `article_categories` | 7 default categories |
| `article_tags` | Free-form article tags |
| `article_tag_assignments` | Many-to-many: articles <-> tags |

The `pg_cron` migration installs a job that runs every 5 minutes to auto-publish scheduled articles. Enable the `pg_cron` extension in **Supabase Dashboard -> Database -> Extensions**.

---

## Development

```bash
npm run dev          # Start development server
npm run test         # Run all tests (Vitest)
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript type check

# One-time setup
node scripts/generate-placeholders.js   # Generate dev placeholder images
npx tsx scripts/migrate-to-r2.ts        # Migrate local images to R2
```

**Notes:**
- R2 is not required locally - the app falls back to `public/images/covers/` when no `media_assets` row exists
- Studio access: go to `/studio/login`, enter your email, click the magic link
- Service worker is disabled in development

---

## Building for Production

```bash
npm run build
npm start
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables
4. Deploy

**Important:** Add `https://your-domain.com/auth/callback` to Supabase Auth redirect URLs before deploying.

---

## Studio CMS

The Studio CMS at `/studio` is the owner-only creative workspace.

### Accessing Studio

1. Navigate to `/studio/login`
2. Enter your email address
3. Click the magic link sent to your inbox
4. You are redirected to the Studio dashboard

> Requires `/auth/callback` in your Supabase Auth redirect URLs.

### Studio features

| Section | Route | Description |
|---------|-------|-------------|
| Dashboard | `/studio` | Overview counts, quick actions, recent activity |
| Titles | `/studio/titles` | Card grid with search and filters |
| New Title | `/studio/titles/new` | Full form with cover/banner upload, genres, moods, markdown review |
| Edit Title | `/studio/titles/[slug]` | Edit all fields; gallery, character, and reading URL managers |
| Tier Manager | (within titles) | Drag-and-drop tier columns (SSS+/S/A/B/C/D/F) |
| Articles | `/studio/articles` | List with state badges (draft/scheduled/published/archived) |
| New Article | `/studio/articles/new` | Markdown editor with toolbar, live preview, SEO fields |
| Edit Article | `/studio/articles/[slug]` | Edit content, change publication state, reschedule |
| Curation | `/studio/curation` | Select featured titles and drag to reorder |

---

## Media Pipeline (Cloudflare R2)

### Upload flow

```
Studio Upload -> /api/media/upload
  -> Validate (MIME type, 10MB max)
  -> Sharp: resize to variants, encode AVIF + WebP
  -> Generate LQIP (20px, blur sigma 3, JPEG q30, base64)
  -> Extract dominant color (hex)
  -> Atomic upload to R2 (rollback on failure)
  -> UPSERT media_assets row in Supabase
  -> Return CDN URLs + metadata
```

### Variant sizes

| Asset Type | Widths | Formats |
|------------|--------|---------|
| Cover | 320, 480, 640, 1200px | AVIF (q65) + WebP (q75) |
| Banner | 768, 1200, 1920px | AVIF (q65) + WebP (q75) |
| Article image | 480, 768, 1200px | AVIF (q65) + WebP (q75) |

### Migrating existing local images

```bash
npx tsx scripts/migrate-to-r2.ts
```

---

## News & Editorial System

The News section at `/news` provides a full editorial publishing workflow.

### Default article categories

Hiatus News, Axed Series, Release Announcements, Industry Commentary, Recommendations, Editorials, Curated Opinions.

### Article lifecycle

```
Draft -> Scheduled -> Published -> Archived
```

- **Draft** - Not visible to public
- **Scheduled** - Auto-publishes at the set date via pg_cron
- **Published** - Visible at `/news/[slug]`
- **Archived** - Hidden from public, preserved in database

Each published article gets full SEO metadata, Open Graph tags, JSON-LD structured data, and a dynamic OG image at `/api/og/article?slug={slug}`.

---

## Keyboard Shortcuts

Press `?` anywhere to see the full list.

| Shortcut | Action |
|----------|--------|
| `/` | Open search |
| `g` then `h` | Go to Home |
| `g` then `l` | Go to Library |
| `g` then `d` | Go to Discover |
| `g` then `t` | Go to Tiers |
| `g` then `s` | Go to Stats |
| `g` then `n` | Go to News |
| `?` | Show keyboard shortcuts help |
| `Esc` | Close modal / blur input |
| up up down down left right left right B A | Easter egg |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b fix/your-description`
3. Run checks: `npm run lint && npx tsc --noEmit && npm run test && npm run build`
4. Commit: `git commit -m "fix(studio): correct tier drag-and-drop on mobile"`
5. Push and open a Pull Request against `main`

### Commit message format

```
<type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, perf, test, chore
Scopes: library, title, studio, news, media, db, auth, etc.
```

### Code style

- TypeScript strict mode - no `any` without explicit `eslint-disable`
- GPU-safe animations only - animate `transform`, `opacity`, `filter`
- All animations must respect `prefers-reduced-motion`
- Semantic HTML, ARIA labels, keyboard navigation, 44x44px touch targets
- No `tailwind.config.js` - all tokens in `globals.css` via `@theme inline {}`

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with passion for manhwa, manhua, and manga.

**[Back to top](#comic-curated)**

</div>
