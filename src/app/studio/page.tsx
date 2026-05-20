// ============================================================
// Studio Dashboard — Professional overview with compact stats,
// quick actions, and recent activity feed.
// Server component that queries Supabase for counts and recent activity.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Upload,
} from 'lucide-react';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ActivityFeed, type ActivityEntry } from '@/components/studio/ActivityFeed';
import { SummaryBar } from '@/components/studio/SummaryBar';

export const metadata: Metadata = {
  title: 'Studio Dashboard',
  description: 'Comic Curated creative workspace — overview and quick actions.',
};

// ── Data Fetching ───────────────────────────────────────────────

async function fetchDashboardData() {
  const supabase = await createSupabaseServerClient();

  const [titlesResult, articlesResult, mediaResult, artistsResult, authorsResult, genresResult] = await Promise.all([
    supabase.from('titles').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('publication_state', 'published'),
    supabase.from('media_assets').select('id', { count: 'exact', head: true }),
    supabase.from('titles').select('artist').not('artist', 'is', null).not('artist', 'eq', ''),
    supabase.from('titles').select('author').not('author', 'is', null).not('author', 'eq', ''),
    supabase.from('genres').select('id', { count: 'exact', head: true }),
  ]);

  const distinctArtists = new Set(
    (artistsResult.data ?? []).map((row: { artist: string }) => row.artist)
  ).size;
  const distinctAuthors = new Set(
    (authorsResult.data ?? []).map((row: { author: string }) => row.author)
  ).size;

  const [recentTitlesResult, recentArticlesResult, recentMediaResult, recentGenresResult] = await Promise.all([
    supabase
      .from('titles')
      .select('id, slug, title_english, tier, cover_slug, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('articles')
      .select('id, slug, title, publication_state, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('media_assets')
      .select('id, slug, asset_type, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('genres')
      .select('id, name, slug, color, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  return {
    counts: {
      titles: titlesResult.count ?? 0,
      publishedArticles: articlesResult.count ?? 0,
      mediaAssets: mediaResult.count ?? 0,
      totalArtists: distinctArtists,
      totalAuthors: distinctAuthors,
      totalGenres: genresResult.count ?? 0,
    },
    recentTitles: recentTitlesResult.data ?? [],
    recentArticles: recentArticlesResult.data ?? [],
    recentMedia: recentMediaResult.data ?? [],
    recentGenres: recentGenresResult.data ?? [],
  };
}

// ── Page Component ──────────────────────────────────────────────

export default async function StudioDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const { counts, recentTitles, recentArticles, recentMedia, recentGenres } = await fetchDashboardData();

  // Merge and sort recent activity by created_at across all types, take top 8
  const recentActivity: ActivityEntry[] = [
    ...recentTitles.map((t) => ({
      id: t.id,
      type: 'title' as const,
      label: t.title_english,
      meta: t.tier ? `Tier ${t.tier}` : 'Unranked',
      href: `/studio/titles/${t.slug}`,
      createdAt: t.created_at,
      thumbnail: `/images/covers/${t.cover_slug ?? t.slug}-320w.avif`,
    })),
    ...recentArticles.map((a) => ({
      id: a.id,
      type: 'article' as const,
      label: a.title,
      meta: a.publication_state,
      href: `/studio/articles/${a.slug}`,
      createdAt: a.created_at,
      thumbnail: undefined,
    })),
    ...recentMedia.map((m) => ({
      id: m.id,
      type: 'media' as const,
      label: m.slug,
      meta: m.asset_type,
      href: `/studio/media`,
      createdAt: m.created_at,
      thumbnail: `/images/covers/${m.slug}-320w.avif`,
    })),
    ...recentGenres.map((g) => ({
      id: g.id,
      type: 'genre' as const,
      label: g.name,
      meta: 'Genre',
      href: `/studio/curation`,
      createdAt: g.created_at,
      thumbnail: undefined,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Summary stats for the compact bar
  const summaryStats = [
    { label: 'Titles', value: counts.titles, href: '/studio/titles' },
    { label: 'Articles', value: counts.publishedArticles, href: '/studio/articles' },
    { label: 'Media', value: counts.mediaAssets, href: '/studio/media' },
    { label: 'Artists', value: counts.totalArtists, href: '/studio/titles' },
    { label: 'Authors', value: counts.totalAuthors, href: '/studio/titles' },
    { label: 'Genres', value: counts.totalGenres, href: '/studio/curation' },
  ];

  return (
    <div className="container-content py-8 max-w-6xl">
      {/* Header + Quick Actions row */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
            Studio
          </h1>
          <p className="font-body text-sm text-text-secondary">
            {user.email}
          </p>
        </div>

        {/* Quick Actions — simple button row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/studio/titles/new"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg min-h-[44px]',
              'bg-accent-primary text-white font-heading text-xs font-bold',
              'hover:bg-accent-primary/90 transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            )}
          >
            <Plus size={14} aria-hidden="true" />
            New Title
          </Link>
          <Link
            href="/studio/articles/new"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg min-h-[44px]',
              'bg-white/5 border border-white/10 text-text-secondary font-heading text-xs font-bold',
              'hover:bg-white/10 hover:text-text-primary transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            )}
          >
            <FileText size={14} aria-hidden="true" />
            New Article
          </Link>
          <Link
            href="/studio/media"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg min-h-[44px]',
              'bg-white/5 border border-white/10 text-text-secondary font-heading text-xs font-bold',
              'hover:bg-white/10 hover:text-text-primary transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            )}
          >
            <Upload size={14} aria-hidden="true" />
            Upload
          </Link>
        </div>
      </div>

      {/* Summary Bar — compact inline stats */}
      <section aria-label="Content overview" className="mb-8">
        <SummaryBar stats={summaryStats} />
      </section>

      {/* Main content: two-column on desktop */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: Recent Activity */}
        <section aria-labelledby="activity-heading">
          <h2
            id="activity-heading"
            className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary mb-4"
          >
            Recent Activity
          </h2>
          <ActivityFeed entries={recentActivity} />
        </section>

        {/* Right: At a Glance sidebar */}
        <aside aria-labelledby="glance-heading" className="flex flex-col gap-4">
          <h2
            id="glance-heading"
            className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary"
          >
            At a Glance
          </h2>

          {/* Draft articles needing attention */}
          <AtAGlanceSection
            label="Draft Articles"
            count={recentArticles.filter(a => a.publication_state === 'draft').length}
            href="/studio/articles"
            emptyText="No drafts pending"
          />

          {/* Scheduled articles */}
          <AtAGlanceSection
            label="Scheduled"
            count={recentArticles.filter(a => a.publication_state === 'scheduled').length}
            href="/studio/articles"
            emptyText="Nothing scheduled"
          />

          {/* Quick links */}
          <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
            <QuickLink href="/studio/titles" label="Browse all titles" />
            <QuickLink href="/studio/curation" label="Manage collections" />
            <QuickLink href="/" label="View public site" external />
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function AtAGlanceSection({
  label,
  count,
  href,
  emptyText,
}: {
  label: string;
  count: number;
  href: string;
  emptyText: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        'hover:border-white/10 hover:bg-bg-surface/60',
        'transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
    >
      <span className="font-body text-sm text-text-secondary">{label}</span>
      {count > 0 ? (
        <span className="font-data text-sm font-bold text-text-primary">
          {count}
        </span>
      ) : (
        <span className="font-body text-xs text-text-tertiary">{emptyText}</span>
      )}
    </Link>
  );
}

function QuickLink({
  href,
  label,
  external = false,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-sm',
        'font-body text-xs text-text-tertiary',
        'hover:text-text-secondary transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="w-1 h-1 rounded-full bg-text-tertiary/50" aria-hidden="true" />
      {label}
      {external && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="opacity-50">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )}
    </Link>
  );
}
