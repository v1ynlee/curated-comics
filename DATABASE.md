# Database Guide

Comic Curated uses Supabase PostgreSQL for public content, Studio CMS data, authentication, editorial audit logs, QA/task ignore records, and scheduled publishing.

## Setup Summary

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push --yes
```

Run migrations against the correct project. `supabase db push --yes` applies all local migrations that Supabase has not yet recorded for that project.

## Migration Groups

| Group | Migration Files | Purpose |
| --- | --- | --- |
| Core taxonomy | `create_genres`, `create_moods`, `create_titles`, `create_junction_tables` | Base title catalog and genre/mood relationships. |
| Reviews and ratings | `create_ratings`, `create_reviews` | Rating dimensions and long-form review content. |
| Links and history | `create_external_links`, `create_reading_history` | Reading URLs and historical progress records. |
| Achievements and views | `create_achievements`, `create_views`, `create_functions` | Derived public data and achievement support. |
| Security | `create_rls_policies` | Public read policies and authenticated Studio access. |
| Title extensions | `create_title_tags`, `add_alternative_titles`, `create_gallery_characters` | Tags, alternate names, gallery, and character support. |
| Articles | `create_article_tables`, `seed_article_categories`, `fix_articles_table`, `improve_article_editorial_workflow`, `add_article_editorial_state` | Editorial content, categories, tags, publication state, editorial state, and validation support. |
| Media | `create_media_assets` | R2/CDN asset metadata and variants. |
| Scheduling | `create_scheduled_publishing_cron` | `pg_cron` job for scheduled article publishing. |
| Curation | `add_featured_order`, `create_curated_collections_and_mood_curations`, `create_editorial_curation_system` | Featured content, mood themes, narratives, creators, and tier definitions. |
| Creators | `create_creators`, `add_creator_status` | Public creator profiles and archive/restore support. |
| Studio operations | `create_editorial_activity_log`, `create_editorial_qa_ignores`, `create_editorial_task_ignores` | Audit trail and persistent QA/task ignore records. |
| Seed data | `seed_dummy_titles`, `seed_missing_ratings`, `seed_mood_discovery_metadata`, `seed_articles` | Development/demo content. |

## Core Tables

| Table | Purpose |
| --- | --- |
| `titles` | Primary title records: slug, names, synopsis, tier, reading status, visibility, featured state, cover/banner references. |
| `ratings` | Multi-dimensional rating values for each title. |
| `reviews` | Review markdown/HTML, spoiler flags, and review status. |
| `genres`, `moods` | Controlled taxonomy for filtering and discovery. |
| `title_genres`, `title_moods` | Many-to-many title taxonomy relationships. |
| `external_links` | Reading platform links. |
| `reading_history` | Reading history and progress events. |
| `title_gallery` | Title gallery media relationships. |
| `characters` | Title character records. |
| `media_assets` | Uploaded media metadata, variants, blur URI, dominant color, and public URLs. |
| `creators` | Authors, artists, studios, images, biographies, status, and public profile metadata. |
| `title_creators` | Relationships between titles and creators. |

## Article Tables

| Table | Purpose |
| --- | --- |
| `articles` | Editorial articles with body, excerpt, SEO fields, publication state, editorial state, schedule dates, counts, category, and media. |
| `article_categories` | Controlled article categories such as Release Announcements, Hiatus News, and Axed Series. |
| `article_tags` | Free-form article tags. |
| `article_tag_assignments` | Many-to-many article tag relationships. |

Article state is split into two concepts:

| Field | Values | Purpose |
| --- | --- | --- |
| `publication_state` | `draft`, `scheduled`, `published`, `archived` | Public visibility and publishing mechanics. |
| `editorial_state` | `draft`, `needs_edit`, `ready_for_review`, `approved`, `scheduled`, `published`, `archived` | Editorial workflow and review readiness. |

The Studio editor validates title, excerpt, cover, category, tags, content length, reading time, empty content, broken images, broken embeds, and metadata before review-ready states.

## Curation Tables

| Table | Purpose |
| --- | --- |
| `curation_settings` | Site-level curation configuration. |
| `featured_narratives` | Narrative collections with ordered title slug references. |
| `featured_creators` | Public featured creator placements. |
| `tier_definitions` | Studio-editable tier metadata. |
| `tier_titles` | Curated title ordering for tier displays. |

## Studio Operations Tables

| Table | Purpose |
| --- | --- |
| `editorial_activity_log` | Audit log for title, article, creator, curation, AI, draft, QA, and task events. |
| `editorial_qa_ignores` | Persistent ignores for QA issues. |
| `editorial_task_ignores` | Persistent ignores for derived task queue items. |

## Row Level Security

RLS policies are defined in migrations and should be treated as part of the app contract.

Expected model:

- Public users can read visible titles, published articles, public creators, and safe public metadata.
- Authenticated Studio users can create, update, archive, delete, and curate records.
- Studio routes are additionally protected by the Next.js proxy at `src/proxy.ts`.

After changing schema or policies, test both anonymous public pages and authenticated Studio routes.

## Scheduled Publishing

Scheduled article publishing is handled by a `pg_cron` job created by migration.

Checklist:

1. Enable `pg_cron` in Supabase Dashboard under `Database -> Extensions`.
2. Confirm the scheduled publishing migration ran.
3. Create an article with `publication_state = scheduled` and a future `scheduled_date`.
4. Confirm the job publishes it after the scheduled time.

## Seed Data

The repository includes migrations and scripts for sample/development data.

Useful scripts:

```bash
node scripts/seed-titles.js
node scripts/seed-vibe-metadata.js
python scripts/generate_article_seed.py
python scripts/generate_article_assets.py
```

Seed scripts can modify data. Use them only against development projects unless you have reviewed the output.

## Safe Migration Workflow

1. Pull latest repository changes.
2. Review new SQL files in `supabase/migrations/`.
3. Run local checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
4. Apply migrations to the intended Supabase project: `supabase db push --yes`.
5. Verify Studio pages and public pages.

Do not apply migrations to production without confirming backups and target project ref.
