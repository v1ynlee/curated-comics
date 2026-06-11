# Comic Curated

Comic Curated is a cinematic comic archive and editorial platform for manga, manhwa, and manhua collections. It combines a public reading showcase with a protected Studio workspace for managing titles, creators, articles, media, curation, QA, tasks, AI-assisted metadata, and editorial activity.

[Live site](https://platform.curated-comics.cyou) · [Setup](./SETUP.md) · [Studio guide](./STUDIO.md) · [Showcase](./SHOWCASE.md) · [Database guide](./DATABASE.md)

## What This Project Includes

| Area | Summary |
| --- | --- |
| Public showcase | Home, library, title detail, discover, tiers, stats, creators, news, search, RSS, PWA, dynamic Open Graph images. |
| Studio CMS | Auth-protected operational workspace for titles, creators, articles, curation, media, QA, task queue, drafts, AI, and audit logs. |
| Editorial workflow | Article publication state plus separate editorial state, review checklist validation, scheduled publishing, and activity logging. |
| Curation tooling | Featured titles, featured creators, mood themes, tier definitions, and narrative collections. |
| Media pipeline | Cloudflare R2 uploads, Sharp variants, blur placeholders, dominant colors, and local fallback images. |
| Database | Supabase PostgreSQL migrations, RLS policies, seed data, public views, scheduled article cron, and Studio support tables. |

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, CSS custom properties, local fonts |
| Motion | Framer Motion, GSAP, Lenis |
| Data | Supabase PostgreSQL, Supabase Auth, `@supabase/ssr`, TanStack Query |
| Media | Cloudflare R2, AWS SDK v3, Sharp |
| Editor | Tiptap, React Markdown, remark-gfm, rehype-highlight |
| AI | Google Gemini via `@google/genai` |
| Testing | Vitest, Testing Library, ESLint, TypeScript |

## Documentation

| Document | Use It For |
| --- | --- |
| [SETUP.md](./SETUP.md) | Local setup, environment variables, Supabase Auth, R2, Gemini, development commands, deployment notes. |
| [DATABASE.md](./DATABASE.md) | Database setup, migration order, schema overview, RLS, seed data, cron, and operational notes. |
| [STUDIO.md](./STUDIO.md) | How to use the Studio dashboard, titles, creators, articles, curation, QA, tasks, activity, drafts, and AI tools. |
| [SHOWCASE.md](./SHOWCASE.md) | Public-site routes and features, including library, discovery, creators, news, search, RSS, and PWA behavior. |
| [docs/](./docs) | Product notes, design direction, motion system, performance strategy, older implementation specs, and devlogs. |

## Quick Start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The app needs Supabase credentials in `.env.local` for real data. Full database and auth setup is documented in [SETUP.md](./SETUP.md) and [DATABASE.md](./DATABASE.md).

## Main Routes

### Public

| Route | Purpose |
| --- | --- |
| `/` | Cinematic landing page and featured sections. |
| `/library` | Full title archive with filters and sorting. |
| `/title/[slug]` | Title detail page with ratings, review, metadata, links, and related content. |
| `/discover` and `/discover/[vibe]` | Mood and vibe-based discovery. |
| `/tiers` | Ranked tier list. |
| `/stats` | Reading statistics and achievements. |
| `/creators` and `/creators/[slug]` | Public creator profiles. |
| `/news` and `/news/[slug]` | Editorial article index and detail pages. |
| `/search` | Site-wide title search. |
| `/feed.xml` | RSS feed. |

### Studio

| Route | Purpose |
| --- | --- |
| `/studio/login` | Magic link login. |
| `/studio` | Operational dashboard. |
| `/studio/tasks` | Unified work queue. |
| `/studio/titles` | Title management. |
| `/studio/creators` | Creator management. |
| `/studio/articles` | Article management and workflow states. |
| `/studio/media` | Media asset library. |
| `/studio/curation` | Featured content, mood themes, narratives, and tiers. |
| `/studio/qa` | Content health checks and quick fixes. |
| `/studio/activity` | Editorial audit log. |

## Development Commands

```bash
npm run dev          # Start local development server
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript check
npm run test         # Run Vitest tests
npm run build        # Production build
npm start            # Start production server after build
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key used by browser/server clients. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Absolute site URL for metadata and OG output. |
| `R2_ACCOUNT_ID` | For uploads | Cloudflare account ID. |
| `R2_ACCESS_KEY_ID` | For uploads | R2 API token access key. |
| `R2_SECRET_ACCESS_KEY` | For uploads | R2 API token secret. |
| `R2_BUCKET_NAME` | For uploads | R2 bucket name. |
| `R2_PUBLIC_URL` | For uploads | Public CDN/base URL for uploaded assets. |
| `GEMINI_API_KEY` | For AI autofill | Gemini API key. |
| `GEMINI_MODEL` | For AI autofill | Gemini model, currently `gemini-2.5-flash`. |

## Repository Structure

```text
curated-comics/
|-- src/app/                 # Next.js routes, route handlers, layouts
|-- src/components/          # Public, Studio, layout, and UI components
|-- src/services/            # Public and Studio data services
|-- src/lib/                 # Supabase, R2, media, utility helpers
|-- src/hooks/               # Client hooks for Studio drafts, AI, UI behavior
|-- src/types/               # Shared TypeScript types
|-- supabase/migrations/     # Database schema, seed, RLS, cron, Studio tables
|-- scripts/                 # Seed, placeholder, article asset, and R2 migration helpers
|-- docs/                    # Extended planning, design, performance, and devlog docs
```

## Quality Checklist

Before shipping changes, run:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

For focused changes, run ESLint against the edited files with `--max-warnings=0`.

## License

MIT. See [LICENSE](./LICENSE).
