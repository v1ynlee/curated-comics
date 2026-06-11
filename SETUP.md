# Setup Guide

This guide explains how to run Comic Curated locally, connect it to Supabase, configure media uploads, enable Studio login, and prepare a production deployment.

## Prerequisites

Install these before starting:

| Tool | Version / Requirement | Purpose |
| --- | --- | --- |
| Node.js | 20 or newer | Runs Next.js and build tooling. |
| npm | 10 or newer | Installs dependencies and runs scripts. |
| Supabase CLI | Latest stable | Links projects and applies migrations. |
| Supabase project | Required | PostgreSQL database and magic link auth. |
| Cloudflare R2 bucket | Optional for local, required for uploads | Stores processed media assets. |
| Gemini API key | Optional | Enables title AI autofill. |

## Local Installation

```bash
git clone https://github.com/v1ynlee/curated-comics.git
cd curated-comics
npm install
cp .env.local.example .env.local
```

Edit `.env.local` with your own values.

## Environment Variables

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://abc123.supabase.co` | Found in Supabase project settings. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `eyJ...` | Browser-safe anon key. RLS still protects data. |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` | Use production URL in deployment. |
| `R2_ACCOUNT_ID` | For uploads | `abc123` | Cloudflare account ID. |
| `R2_ACCESS_KEY_ID` | For uploads | `...` | R2 API token access key. |
| `R2_SECRET_ACCESS_KEY` | For uploads | `...` | R2 API token secret. |
| `R2_BUCKET_NAME` | For uploads | `comic-curated-media` | R2 bucket name. |
| `R2_PUBLIC_URL` | For uploads | `https://cdn.example.com` | Public CDN/base URL for assets. |
| `GEMINI_API_KEY` | For AI autofill | `...` | Enables Studio title autofill. |
| `GEMINI_MODEL` | For AI autofill | `gemini-2.5-flash` | Defaults should match `.env.local.example`. |

R2 and Gemini values are server-side only. Do not prefix them with `NEXT_PUBLIC_`.

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Link the local repository to the Supabase project.

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

4. Apply migrations.

```bash
supabase db push --yes
```

5. Confirm the tables were created in the Supabase dashboard.

Read [DATABASE.md](./DATABASE.md) for schema details, migration groups, seed data, RLS, and cron notes.

## Supabase Auth Setup

Studio uses Supabase magic link auth.

In Supabase Dashboard:

1. Open `Authentication -> URL Configuration`.
2. Set the site URL for local development: `http://localhost:3000`.
3. Add redirect URL: `http://localhost:3000/auth/callback`.
4. Add production redirect URL: `https://your-domain.com/auth/callback`.
5. Make sure email OTP/magic link login is enabled.

To log in locally:

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/studio/login`.
3. Enter your email.
4. Click the magic link in your inbox.
5. You should be redirected into `/studio`.

## Cloudflare R2 Setup

R2 is used by Studio uploads for covers, banners, article images, thumbnails, and generated media variants.

1. Create a Cloudflare R2 bucket.
2. Create an R2 API token with object read/write access.
3. Add R2 credentials to `.env.local`.
4. Configure a public domain or CDN URL and set `R2_PUBLIC_URL`.

Upload flow:

```text
Studio upload -> /api/media/upload -> validate file -> Sharp variants -> R2 upload -> media_assets row -> CDN URLs returned to UI
```

R2 is not required for browsing existing local images. The app can still fall back to `public/images/covers/` when there is no uploaded `media_assets` row.

## Gemini Setup

Gemini powers Studio title autofill.

1. Create a Gemini API key.
2. Set `GEMINI_API_KEY` in `.env.local`.
3. Set `GEMINI_MODEL="gemini-2.5-flash"`.
4. Restart the development server.

The AI workflow is preview-first. Generated values are shown in a comparison modal, confidence metadata is displayed, and editors choose which fields to apply.

## Development Commands

```bash
npm run dev          # Start Next.js dev server
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript check
npm run test         # Run Vitest test suite
npm run build        # Production build
npm start            # Start production server after build
```

Optional scripts:

```bash
node scripts/generate-placeholders.js
node scripts/seed-vibe-metadata.js
node scripts/seed-titles.js
npx tsx scripts/migrate-to-r2.ts
```

Use optional scripts only when you understand the target data they modify.

## Production Deployment

Vercel is the expected hosting target.

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add all environment variables.
4. Add the production auth callback URL in Supabase.
5. Apply database migrations to the production Supabase project.
6. Deploy.

Production checklist:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

## Troubleshooting

| Problem | Check |
| --- | --- |
| Studio redirects to login repeatedly | Confirm Supabase redirect URL includes `/auth/callback`, clear cookies, and verify env values. |
| Magic link opens but session is missing | Confirm `NEXT_PUBLIC_SITE_URL` and Supabase Auth site URL match the environment. |
| Uploads fail | Verify R2 credentials, bucket name, public URL, file type, and file size. |
| AI autofill fails | Confirm `GEMINI_API_KEY`, model value, and server restart. |
| Database queries fail | Confirm migrations were pushed and RLS policies match the access pattern. |
| Scheduled articles do not publish | Confirm `pg_cron` is enabled and the scheduled publishing migration ran. |
