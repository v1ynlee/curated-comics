// ============================================================
// Studio Dashboard — Cinematic overview and quick actions
// Server component that queries Supabase for counts and recent activity.
// Requirements: 7.4, 9.3, 15.1, 15.2, 15.3
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Upload,
  BookOpen,
  Newspaper,
  Image as ImageIcon,
  Palette,
  User,
  Tag,
} from 'lucide-react';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ActivityFeed, type ActivityEntry } from '@/components/studio/ActivityFeed';
import { OverviewCard } from '@/components/studio/OverviewCard';

export const metadata: Metadata = {
  title: 'Studio Dashboard',
  description: 'Comic Curated creative workspace — overview and quick actions.',
};

/** Fetch overview counts from Supabase */
async function fetchDashboardData() {
  const supabase = await createSupabaseServerClient();

  // Fetch counts in parallel
  const [titlesResult, articlesResult, mediaResult, artistsResult, authorsResult, genresResult] = await Promise.all([
    supabase.from('titles').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('publication_state', 'published'),
    supabase.from('media_assets').select('id', { count: 'exact', head: true }),
    // Distinct non-null artists from titles
    supabase.from('titles').select('artist').not('artist', 'is', null).not('artist', 'eq', ''),
    // Distinct non-null authors from titles
    supabase.from('titles').select('author').not('author', 'is', null).not('author', 'eq', ''),
    // Count of rows in genres table
    supabase.from('genres').select('id', { count: 'exact', head: true }),
  ]);

  // Compute distinct artist and author counts
  const distinctArtists = new Set(
    (artistsResult.data ?? []).map((row: { artist: string }) => row.artist)
  ).size;
  const distinctAuthors = new Set(
    (authorsResult.data ?? []).map((row: { author: string }) => row.author)
  ).size;

  // Fetch recent activity across all 4 types: titles, articles, media, genres
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

export default async function StudioDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const { counts, recentTitles, recentArticles, recentMedia, recentGenres } = await fetchDashboardData();

  // Merge and sort recent activity by created_at across all 4 types, take top 8
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

  return (
    <div className="container-content py-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-10">
        <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
          Comic Curated
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          Studio
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Welcome back,{' '}
          <span className="text-text-primary">{user.email}</span>
        </p>
      </div>

      {/* Overview Cards */}
      <section aria-labelledby="overview-heading" className="mb-12">
        <h2 id="overview-heading" className="sr-only">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewCard
            icon={<BookOpen size={22} aria-hidden="true" />}
            label="Total Titles"
            value={counts.titles}
            accentClass="text-accent-primary bg-accent-primary/10"
          />
          <OverviewCard
            icon={<Newspaper size={22} aria-hidden="true" />}
            label="Published Articles"
            value={counts.publishedArticles}
            accentClass="text-accent-tertiary bg-accent-tertiary/10"
          />
          <OverviewCard
            icon={<ImageIcon size={22} aria-hidden="true" />}
            label="Media Assets"
            value={counts.mediaAssets}
            accentClass="text-accent-quaternary bg-accent-quaternary/10"
          />
          <OverviewCard
            icon={<Palette size={22} aria-hidden="true" />}
            label="Total Artists"
            value={counts.totalArtists}
            accentClass="text-pink-400 bg-pink-400/10"
          />
          <OverviewCard
            icon={<User size={22} aria-hidden="true" />}
            label="Total Authors"
            value={counts.totalAuthors}
            accentClass="text-sky-400 bg-sky-400/10"
          />
          <OverviewCard
            icon={<Tag size={22} aria-hidden="true" />}
            label="Total Genres"
            value={counts.totalGenres}
            accentClass="text-amber-400 bg-amber-400/10"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading" className="mb-12">
        <h2
          id="actions-heading"
          className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary mb-4"
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            href="/studio/titles/new"
            icon={<Plus size={20} aria-hidden="true" />}
            title="New Title"
            description="Add a new manhwa, manhua, or manga to the library."
          />
          <QuickActionCard
            href="/studio/articles/new"
            icon={<FileText size={20} aria-hidden="true" />}
            title="New Article"
            description="Write a news piece, editorial, or recommendation."
          />
          <QuickActionCard
            href="/studio/media"
            icon={<Upload size={20} aria-hidden="true" />}
            title="Upload Media"
            description="Upload and process images for covers, banners, or articles."
          />
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section aria-labelledby="activity-heading">
        <h2
          id="activity-heading"
          className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary mb-4"
        >
          Recent Activity
        </h2>
        <ActivityFeed entries={recentActivity} />
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-3 p-5 rounded-lg',
        'bg-surface-elevated/30 border border-white/5',
        'hover:border-accent-primary/30 hover:bg-surface-elevated/50',
        'transition-all duration-normal',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg',
          'bg-accent-primary/10 text-accent-primary',
          'group-hover:bg-accent-primary/20 transition-colors duration-normal',
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-heading text-sm font-bold text-text-primary">
          {title}
        </span>
        <span className="font-body text-xs text-text-secondary">
          {description}
        </span>
      </div>
    </Link>
  );
}


