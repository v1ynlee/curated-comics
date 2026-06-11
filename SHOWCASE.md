# Public Showcase Guide

The public site is the reader-facing experience for the collection. It is designed as a polished editorial showcase rather than a generic tracker.

## Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and curated entry points. |
| `/library` | Complete title archive. |
| `/title/[slug]` | Individual title details. |
| `/discover` | Mood and vibe discovery hub. |
| `/discover/[vibe]` | Titles matching a specific mood. |
| `/tiers` | Tier-ranked title browsing. |
| `/stats` | Collection statistics and achievements. |
| `/creators` | Public creator directory. |
| `/creators/[slug]` | Creator profile with related work. |
| `/news` | Editorial article index. |
| `/news/[slug]` | Article detail page. |
| `/search` | Site search. |
| `/feed.xml` | RSS feed. |
| `/offline` | PWA fallback page. |

## Home

The home page presents the collection through curated editorial modules.

Typical content sources:

- Featured titles.
- Featured creators.
- Curated narratives.
- Mood-driven discovery sections.
- Recently updated or editorially selected content.

Most homepage content is configured from Studio curation tools.

## Library

The library is the complete searchable/browsable archive.

Users can explore by:

- Reading category.
- Genre.
- Mood.
- Tier.
- Status.
- Search text.
- Sorting controls.

Title cards connect to `/title/[slug]` detail pages.

## Title Detail Pages

Title detail pages combine structured catalog data with editorial review content.

Common sections:

- Cover and hero media.
- English/original/alternative titles.
- Origin, tier, reading status, release status, and dates.
- Synopsis and vibe check.
- Genres and moods.
- Creator relationships.
- Reading URLs.
- Ratings and review content.
- Quotable lines.
- Gallery assets.
- Related or curated content.

Visibility is controlled by Studio title settings. Hidden titles should not appear publicly.

## Discover

Discover organizes titles by mood and vibe rather than strict taxonomy.

Examples:

- Action-heavy progression stories.
- Villainess or regression arcs.
- Comedy and chaotic reads.
- Atmospheric or emotional works.

Mood metadata is stored in the database and can be seeded or curated.

## Tiers

The tier page presents ranked title groups.

Supported tiers include:

- `SSS+`
- `S`
- `A`
- `B`
- `C`
- `D`
- `F`

Tier definitions and ordering can be maintained from Studio curation tools.

## Stats

The stats page summarizes collection activity and structure.

Typical displays include:

- Collection totals.
- Genre distribution.
- Reading status breakdowns.
- Timeline or yearly arc views.
- Achievement-style progress indicators.

Stats are derived from title, review, rating, and reading metadata.

## Creators

The creators section exposes public profiles for authors, artists, and studios.

Creator profiles can include:

- Name and slug.
- Profile image.
- Creator type.
- Biography.
- Related titles.

Studio controls creator creation, profile images, title relationships, archive state, and featured creator placement.

## News

The news system is the public editorial layer.

Features:

- Article index.
- Category filters.
- Tag filters.
- Featured images.
- Reading time.
- SEO metadata.
- Dynamic article Open Graph images.
- Markdown rendering with code and GFM support.

Default categories include:

- Release Announcements.
- Hiatus News.
- Axed Series.
- Industry Commentary.
- Recommendations.
- Editorials.
- Curated Opinions.

Only published articles should appear publicly.

## Search

Search provides a fast way to find titles across the catalog. It is intended for title discovery rather than Studio content editing.

## RSS and PWA

| Feature | Route / Behavior |
| --- | --- |
| RSS | `/feed.xml` exposes a feed for new or updated public content. |
| PWA manifest | `/manifest.webmanifest` supports installability. |
| Service worker | Provides offline behavior where supported. |
| Offline page | `/offline` is the fallback page. |

## Open Graph Images

The app generates dynamic social images for article and title sharing.

Examples:

- `/api/og/article?slug=article-slug`
- `/title/[slug]/opengraph-image`

These depend on public metadata, title/article images, and `NEXT_PUBLIC_SITE_URL`.

## Content Publishing Flow

Recommended flow from Studio to public site:

1. Create or update titles in Studio.
2. Attach covers, banners, creators, genres, moods, reviews, and reading URLs.
3. Review title completion score.
4. Use QA to resolve missing or broken content.
5. Curate homepage sections and narratives.
6. Create editorial articles and move them through review workflow.
7. Publish or schedule articles.
8. Check public routes and Open Graph output.
