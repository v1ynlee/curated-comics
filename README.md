<div align="center">

# Comic Curated

**A cinematic personal comic-reading showcase built with Next.js 16, Supabase, and a full animation stack.**

Comic Curated is a highly immersive, production-grade web application that functions as a personal reading archive, curated recommendation platform, and interactive showcase — all wrapped in a premium anime-inspired experience. It solves the problem of having no beautiful, personal home for your manhwa, manhua, and manga collection: instead of a spreadsheet or a generic tracker, you get a site that feels like stepping into a cinematic anime world, where every scroll tells a story and every interaction has weight.

[![CI](https://github.com/your-username/curated-comics/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/curated-comics/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://comic-curated.com) · [Report Bug](https://github.com/your-username/curated-comics/issues) · [Request Feature](https://github.com/your-username/curated-comics/issues)

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
- [Admin Interface](#admin-interface)
- [Image Pipeline](#image-pipeline)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Comic Curated is a **personal reading archive and showcase** for Korean manhwa, Chinese manhua, and Japanese manga. It is not a generic tracker or dashboard — it is an **interactive anime museum** designed to communicate deep passion for comics through every pixel, animation, and interaction.

### What it does

| Feature | Description |
|---------|-------------|
| **Reading Library** | Browse 300–500+ titles across 9 reading categories (reading, completed, dropped, etc.) |
| **Mood Discovery** | Find titles by vibe — 16 custom moods like "Aura Farming", "Brainrot", "Villainess Era" |
| **Tier List** | Visual SSS+ → F tier ranking with per-tier horizontal scroll |
| **Multi-Dimensional Ratings** | 6-axis rating system: overall, emotional, art, story, pacing, ending |
| **Statistics Dashboard** | Animated charts for genre distribution, reading timeline, yearly arc, streaks |
| **Achievement System** | 18 unlockable badges with rarity tiers, progress rings, and detail modals |
| **Admin CMS** | Full content management: add/edit/delete titles, upload images, write reviews |
| **Search** | Fuzzy full-text search across the entire archive |
| **PWA** | Installable with offline support via service worker |
| **RSS Feed** | Auto-generated feed of new additions at `/feed.xml` |
| **Dynamic OG Images** | Per-title social sharing cards generated at the edge |

---

## Features

### Public Site

- **Cinematic Hero** — Full-viewport landing with GSAP parallax, Framer Motion first-load sequence, and CSS-only particle field
- **Library Browse** — Responsive grid (2-col mobile → 6-col desktop), genre/mood filters, sort controls, category tabs with ARIA tablist
- **Title Detail** — Immersive hero with blurred cover backdrop, animated rating bars, spoiler-toggle review, quotable lines, related titles carousel
- **Discover** — Mood-based browsing with per-mood atmospheric backgrounds (gradient + particles) that transition with `AnimatePresence`
- **Tier List** — Visual tier rows with glow/gradient text effects and horizontal scroll carousels
- **Statistics** — Animated number counters, genre bar chart, monthly timeline, yearly arc, reading streak
- **Achievements** — Badge grid grouped by rarity, circular progress rings, detail modals with unlock dates
- **Search** — Debounced full-text search powered by PostgreSQL `websearch_to_tsquery`

### Interactions

- **Card tilt physics** — 3D perspective tilt on hover via mouse position (desktop only, reduced-motion safe)
- **Custom cursor** — Dot + lagged ring cursor using RAF loop (high-performance devices only)
- **Keyboard shortcuts** — `/` search, `g+h/l/d/t/s` navigation, `?` help modal
- **Easter egg** — Konami code (↑↑↓↓←→←→BA) triggers a celebration toast
- **Smooth scroll** — Lenis drives all scroll behavior, synced to GSAP's ticker (single RAF loop)

### Admin

- **Authentication** — Supabase Auth (email + password), session managed via `@supabase/ssr` cookies
- **Title CRUD** — 4-tab form: Basic info, Ratings, Review, External Links
- **Image upload** — Drag-and-drop with Sharp processing pipeline (AVIF + WebP at 4 sizes, LQIP blur placeholder, dominant color extraction)
- **Bulk operations** — Select multiple titles, bulk status update or delete
- **Route protection** — Next.js 16 Proxy guards all `/admin` routes

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

### Backend & Infrastructure

| Technology | Purpose |
|------------|---------|
| [Supabase](https://supabase.com) | PostgreSQL database, Auth, Row Level Security |
| [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side) | Cookie-based auth for Next.js App Router |
| [Sharp](https://sharp.pixelplumbing.com) | Server-side image processing (AVIF, WebP, LQIP) |
| [GitHub Actions](https://github.com/features/actions) | CI/CD: lint → build → migrate |
| [Vercel](https://vercel.com) | Hosting, edge deployment, CDN |

---

## Project Architecture

```
Browser Request
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│  Next.js 16 App Router                                   │
│                                                          │
│  src/proxy.ts ──── Auth guard for /admin routes          │
│                                                          │
│  Public Routes          Admin Routes                     │
│  /                      /admin                           │
│  /library               /admin/titles                    │
│  /title/[slug]          /admin/titles/new                │
│  /discover              /admin/titles/[slug]/edit        │
│  /tiers                 /admin/login                     │
│  /stats                                                  │
│  /search                API Routes                       │
│  /feed.xml              /api/admin/upload-image          │
└─────────────────────────────────────────────────────────┘
      │                           │
      ▼                           ▼
┌──────────────┐         ┌──────────────────┐
│  TanStack    │         │  Supabase        │
│  Query Cache │◄───────►│  PostgreSQL      │
│  (5min TTL)  │         │  + Auth + RLS    │
└──────────────┘         └──────────────────┘

Data Flow:
  Supabase → services/ → TanStack Query → Components
  User Action → Zustand Store → Reactive UI
  Scroll → Lenis → GSAP ScrollTrigger → Animation
  Route Change → Framer Motion → Page Transition
```

### Key Design Decisions

- **Tailwind v4** — CSS-first configuration via `@theme inline {}` in `globals.css`. No `tailwind.config.js`. All design tokens are CSS custom properties, usable in both Tailwind utilities and inline styles.
- **Single RAF loop** — Lenis drives all scroll behavior. GSAP's ticker drives Lenis (`gsap.ticker.add(() => lenis.raf(time * 1000))`). One `requestAnimationFrame` for everything.
- **Server + Client split** — Title detail pages use server components for SSR + `generateMetadata`. Interactive parts (animations, filters) are client components.
- **RLS security** — All database access is governed by Supabase Row Level Security. Public users get `SELECT` on non-hidden content. Authenticated users get full access.

---

## Folder Structure

```
curated-comics/
├── .github/
│   └── workflows/
│       └── ci.yml              # Lint → Build → DB migrate pipeline
├── docs/
│   ├── architecture/           # Component and content structure docs
│   ├── branding/               # Visual identity guidelines
│   ├── database/               # Schema planning
│   ├── design/                 # UI/UX, typography, mobile experience
│   ├── devlog/                 # Phase-by-phase implementation logs
│   ├── motion/                 # Animation system and guidelines
│   ├── performance/            # Performance strategy and image pipeline
│   ├── roadmap/                # ROADMAP.md and future features
│   └── MASTER_PRD.md           # Product requirements document
├── public/
│   ├── images/
│   │   └── covers/             # Processed cover images (gitignored, generated)
│   └── sw.js                   # PWA service worker
├── scripts/
│   └── generate-placeholders.js # Sharp-based placeholder image generator
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin CMS (auth-protected)
│   │   ├── api/                # Route handlers (image upload)
│   │   ├── discover/           # Mood-based discovery
│   │   ├── feed.xml/           # RSS feed
│   │   ├── library/            # Reading archive browse
│   │   ├── offline/            # PWA offline fallback
│   │   ├── search/             # Full-text search
│   │   ├── stats/              # Statistics + achievements
│   │   ├── tiers/              # Tier list
│   │   ├── title/[slug]/       # Title detail
│   │   ├── globals.css         # Design system (Tailwind v4 @theme)
│   │   ├── layout.tsx          # Root layout (fonts, providers, nav)
│   │   ├── manifest.ts         # PWA manifest
│   │   ├── not-found.tsx       # Cinematic 404
│   │   ├── opengraph-image.tsx # Default OG image (edge)
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── achievements/       # BadgeCard, BadgeGrid, ProgressRing
│   │   ├── admin/              # AdminNav, TitleForm, ImageUploader
│   │   ├── cinematic/          # Hero, AtmosphericBg, CustomCursor, EasterEgg
│   │   ├── discover/           # MoodCard, MoodSelector, DiscoveryGrid
│   │   ├── layout/             # Navigation, MobileNav, Footer, PageTransition
│   │   ├── library/            # TitleCard, LibraryGrid, CategoryTabs, FilterSheet
│   │   ├── providers/          # QueryProvider, LenisProvider, Providers
│   │   ├── stats/              # StatCard, GenreChart, TimelineChart
│   │   ├── tiers/              # TierLabel, TierRow
│   │   ├── title/              # RatingDisplay, ReviewSection, ExternalLinks
│   │   └── ui/                 # Button, Tag, Skeleton, ScrollReveal, etc.
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, animations, easings, constants
│   ├── services/               # Supabase data fetching layer
│   ├── stores/                 # Zustand state stores
│   ├── types/                  # TypeScript type definitions
│   └── proxy.ts                # Next.js 16 proxy (auth guard)
├── supabase/
│   ├── migrations/             # 14 numbered SQL migration files
│   └── seed.sql                # Genres, moods, achievements seed data
├── .env.local.example          # Environment variable template
├── next.config.ts              # Next.js configuration
└── package.json
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ 20 ([download](https://nodejs.org))
- **npm** ≥ 10 (comes with Node.js)
- **Supabase CLI** ([install guide](https://supabase.com/docs/guides/cli/getting-started))
- A **Supabase account** with a project created ([supabase.com](https://supabase.com))

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/curated-comics.git
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

Then edit `.env.local` with your values (see [Environment Variables](#environment-variables)).

### 4. Set up the database

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push --yes

# Seed genres, moods, and achievements
supabase db push --yes --include-seed
```

### 5. Generate placeholder images (development only)

```bash
node scripts/generate-placeholders.js
```

This creates placeholder cover images in `public/images/covers/` for development.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL (e.g. `https://abc.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Your Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Full URL of your site (e.g. `https://comic-curated.com`) |

### Finding your Supabase credentials

1. Go to [supabase.com](https://supabase.com) → your project
2. Navigate to **Settings → API**
3. Copy the **Project URL** and **anon public** key

> **Security:** Never commit `.env.local` to version control. The `.gitignore` already excludes it. Only `.env.local.example` (with no real values) is committed.

### CI/CD Secrets (GitHub Actions)

For the automated migration pipeline, add these secrets to your GitHub repository (**Settings → Secrets and variables → Actions**):

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Your Supabase personal access token |
| `SUPABASE_DB_PASSWORD` | Your Supabase database password |
| `SUPABASE_PROJECT_REF` | Your project reference ID (e.g. `abcdefghijklmnop`) |

---

## Database Setup

The database schema is managed via Supabase CLI migrations. All 14 migrations are in `supabase/migrations/`.

### Schema overview

| Table | Purpose |
|-------|---------|
| `titles` | Core entity — all title metadata, reading status, tier |
| `ratings` | 6-dimension ratings per title (1–10, half-point precision) |
| `reviews` | Personal reviews with structured sections and spoiler handling |
| `genres` | 23 predefined genres with colors |
| `moods` | 16 custom mood categories with atmosphere configs |
| `title_genres` | Many-to-many: titles ↔ genres |
| `title_moods` | Many-to-many: titles ↔ moods |
| `external_links` | Reading platform links per title |
| `title_tags` | Free-form tags per title |
| `achievements` | 18 unlockable badges with condition tracking |
| `reading_history` | Session-based reading log for timeline stats |

### Views

| View | Purpose |
|------|---------|
| `reading_statistics` | Aggregate stats (total titles, chapters, hours, completion rate) |
| `genre_distribution` | Title count and average rating per genre |
| `monthly_reading` | Chapters read per calendar month |

### Running migrations manually

```bash
# Push all pending migrations to remote
supabase db push --yes

# Check migration status
supabase migration list

# Create a new migration
supabase migration new your_migration_name
```

### Security model

- **Public (anon):** `SELECT` only on non-hidden content. Cannot read `reading_history`.
- **Authenticated (owner):** Full `INSERT`, `UPDATE`, `DELETE` on all tables.
- Row Level Security is enforced at the database level — even if the application layer is bypassed, unauthorized writes are rejected.

---

## Development

```bash
# Start development server with hot reload
npm run dev

# Run ESLint
npm run lint

# TypeScript type check (no emit)
npx tsc --noEmit

# Generate placeholder cover images
node scripts/generate-placeholders.js
```

The development server runs at [http://localhost:3000](http://localhost:3000).

### Development notes

- **Smooth scroll** (Lenis) is active in development. If you need to debug scroll behavior, temporarily disable it in `src/components/providers/LenisProvider.tsx`.
- **Service worker** is disabled in development (`process.env.NODE_ENV !== 'production'`). This prevents stale cache issues during development.
- **Placeholder images** are gitignored. Run `node scripts/generate-placeholders.js` after cloning to populate `public/images/covers/`.
- **Admin access** requires a Supabase Auth user. Create one via the Supabase dashboard (**Authentication → Users → Add user**), then sign in at `/admin/login`.

---

## Building for Production

```bash
# Create an optimized production build
npm run build

# Start the production server locally
npm start
```

The build output shows all routes with their rendering strategy:

| Symbol | Meaning |
|--------|---------|
| `○` | Static — prerendered at build time |
| `ƒ` | Dynamic — server-rendered on demand |
| `ƒ Proxy` | Next.js 16 Proxy (auth middleware) |

---

## Deployment

### Vercel (recommended)

1. Push your repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
4. Deploy

Vercel automatically detects Next.js and configures the build. The CI/CD pipeline in `.github/workflows/ci.yml` runs lint, build, and database migrations on every push to `main`.

### Manual deployment

```bash
# Build
npm run build

# Start (requires Node.js on the server)
npm start
```

### Environment-specific notes

- Set `NEXT_PUBLIC_SITE_URL` to your production domain for correct OG image URLs and RSS feed links
- The service worker (`public/sw.js`) only registers in production
- Dynamic OG images use the edge runtime — ensure your hosting supports edge functions

---

## Admin Interface

The admin interface at `/admin` allows the owner to manage all content without touching code.

### Accessing admin

1. Create a user in your Supabase project: **Authentication → Users → Add user**
2. Navigate to `/admin/login`
3. Sign in with your email and password

### Admin features

| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/admin` | Overview with quick action cards |
| Title list | `/admin/titles` | All titles with search, bulk operations |
| Add title | `/admin/titles/new` | 4-tab form: Basic, Ratings, Review, Links |
| Edit title | `/admin/titles/[slug]/edit` | Edit any field, upload new cover |
| Delete title | (button in edit) | Confirm dialog, cascades to all related data |

### Adding a title

1. Go to `/admin/titles/new`
2. Fill in the **Basic** tab: title, origin, reading status, genres, moods, tier
3. Upload a cover image (drag-and-drop, auto-processed to AVIF/WebP)
4. Optionally fill in **Ratings**, **Review**, and **Links** tabs
5. Click **Create Title**

---

## Image Pipeline

Cover images are processed server-side using Sharp when uploaded through the admin interface.

### Processing steps

For each uploaded image, the pipeline generates:

| Output | Size | Format | Quality |
|--------|------|--------|---------|
| Thumbnail | 320px wide | AVIF + WebP | 65 / 75 |
| Card | 480px wide | AVIF + WebP | 65 / 75 |
| Detail | 640px wide | AVIF + WebP | 65 / 75 |
| Hero | 1200px wide | AVIF + WebP | 65 / 75 |
| Blur placeholder | 20px wide | Base64 JPEG | 30 |
| Metadata | — | JSON | dominant color, aspect ratio |

### Generating development placeholders

```bash
node scripts/generate-placeholders.js
```

This generates branded placeholder covers for the 8 sample titles defined in the script. Add more titles to the `PLACEHOLDER_TITLES` array to generate additional placeholders.

---

## Keyboard Shortcuts

The site supports keyboard navigation for power users. Press `?` anywhere to see the full list.

| Shortcut | Action |
|----------|--------|
| `/` | Open search |
| `g` then `h` | Go to Home |
| `g` then `l` | Go to Library |
| `g` then `d` | Go to Discover |
| `g` then `t` | Go to Tiers |
| `g` then `s` | Go to Stats |
| `?` | Show keyboard shortcuts help |
| `Esc` | Close modal / blur input |
| `↑↑↓↓←→←→BA` | 🎮 |

Shortcuts are disabled when focus is inside an input, textarea, or select element.

---

## Contributing

This is a personal project, but contributions are welcome for bug fixes and improvements.

### Development workflow

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b fix/your-bug-description
   ```
3. **Make your changes** — follow the existing code style
4. **Run checks** before committing:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm run build
   ```
5. **Commit** with a conventional commit message:
   ```bash
   git commit -m "fix(library): correct filter reset on category change"
   ```
6. **Push** and open a Pull Request against `main`

### Commit message format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, chore
Scope: phase-0, library, title, discover, tiers, stats, admin, etc.
```

### Code style

- **TypeScript strict mode** — no `any` without explicit `eslint-disable` comment
- **No `setState` in effect bodies** — use the React 19 `useSyncExternalStore` pattern or derive values during render
- **GPU-safe animations only** — animate `transform`, `opacity`, `filter`. Never `width`, `height`, `top`, `left`
- **Reduced motion** — all animations must respect `prefers-reduced-motion`
- **Accessibility** — semantic HTML, ARIA labels, keyboard navigation, 44×44px touch targets

### Reporting issues

Please include:
- Browser and OS
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

This project is a personal portfolio piece. The design system, animation patterns, and architecture are original work. Comic cover images are not included in this repository.

---

<div align="center">

Built with passion for manhwa, manhua, and manga. 📚

**[⬆ Back to top](#comic-curated)**

</div>
