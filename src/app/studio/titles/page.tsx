// ============================================================
// Studio Titles Listing — Card-based grid with search and filters
// Server component that queries Supabase for all titles.
// Requirements: 8.1, 8.2, 9.3
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { cn } from '@/lib/utils/cn';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel, Origin, SeriesStatus, ReadingStatus } from '@/types/title';
import { CoverImage } from '@/components/ui/CoverImage';
import { TitleFilters } from '@/components/studio/TitleFilters';

export const metadata: Metadata = {
  title: 'Titles',
  description: 'Manage your manga, manhwa, and manhua collection.',
};

// ── Types ───────────────────────────────────────────────────────

interface TitleRow {
  id: string;
  slug: string;
  title_english: string;
  title_original: string | null;
  origin: Origin;
  series_status: SeriesStatus;
  reading_status: ReadingStatus;
  tier: TierLevel | null;
  cover_slug: string | null;
  dominant_color: string | null;
  featured: boolean;
  hidden: boolean;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    tier?: string;
    status?: string;
    reading?: string;
    origin?: string;
  }>;
}

// ── Data fetching ───────────────────────────────────────────────

async function fetchTitles(filters: {
  q?: string;
  tier?: string;
  status?: string;
  reading?: string;
  origin?: string;
}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('titles')
    .select(
      'id, slug, title_english, title_original, origin, series_status, reading_status, tier, cover_slug, dominant_color, featured, hidden',
    )
    .order('updated_at', { ascending: false });

  // Apply filters
  if (filters.tier) {
    query = query.eq('tier', filters.tier);
  }
  if (filters.status) {
    query = query.eq('series_status', filters.status);
  }
  if (filters.reading) {
    query = query.eq('reading_status', filters.reading);
  }
  if (filters.origin) {
    query = query.eq('origin', filters.origin);
  }
  if (filters.q) {
    query = query.ilike('title_english', `%${filters.q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch titles:', error);
    return [];
  }

  return (data ?? []) as TitleRow[];
}

// ── Page component ──────────────────────────────────────────────

export default async function StudioTitlesPage({ searchParams }: PageProps) {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const params = await searchParams;
  const titles = await fetchTitles(params);

  return (
    <div className="container-content py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-accent-primary">
            Library
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Titles
          </h1>
          <p className="font-body text-sm text-text-secondary">
            {titles.length} title{titles.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>

        <Link
          href="/studio/titles/new"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-accent-primary text-white font-heading text-sm font-bold',
            'hover:bg-accent-primary/90 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            'self-start sm:self-auto',
          )}
        >
          <Plus size={16} aria-hidden="true" />
          New Title
        </Link>
      </div>

      {/* Search & Filters */}
      <Suspense fallback={<div className="h-32 mb-8 rounded-lg bg-bg-surface/40 border border-white/5 animate-pulse" />}>
        <TitleFilters />
      </Suspense>

      {/* Title Grid */}
      {titles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-surface/60 flex items-center justify-center">
            <Search size={24} className="text-text-tertiary" aria-hidden="true" />
          </div>
          <p className="font-body text-sm text-text-secondary max-w-xs">
            {params.q || params.tier || params.status || params.reading || params.origin
              ? 'No titles match your current filters. Try adjusting your search.'
              : 'No titles yet. Add your first title to get started.'}
          </p>
          {!params.q && !params.tier && !params.status && !params.reading && !params.origin && (
            <Link
              href="/studio/titles/new"
              className="font-heading text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              + Add your first title
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {titles.map((title) => (
            <TitleCard key={title.id} title={title} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Title Card ──────────────────────────────────────────────────

const READING_STATUS_LABELS: Record<ReadingStatus, { label: string; color: string }> = {
  reading: { label: 'Reading', color: 'text-semantic-info' },
  completed: { label: 'Completed', color: 'text-semantic-success' },
  dropped: { label: 'Dropped', color: 'text-semantic-danger' },
  paused: { label: 'Paused', color: 'text-semantic-warning' },
  wishlist: { label: 'Wishlist', color: 'text-text-tertiary' },
  'hidden-gem': { label: 'Hidden Gem', color: 'text-accent-tertiary' },
  'guilty-pleasure': { label: 'Guilty Pleasure', color: 'text-accent-quaternary' },
  'top-favorite': { label: 'Top Favorite', color: 'text-tier-sss' },
  'most-reread': { label: 'Most Reread', color: 'text-accent-primary' },
};

const SERIES_STATUS_LABELS: Record<SeriesStatus, { label: string; dot: string }> = {
  ongoing: { label: 'Ongoing', dot: 'bg-semantic-success' },
  completed: { label: 'Completed', dot: 'bg-semantic-info' },
  hiatus: { label: 'Hiatus', dot: 'bg-semantic-warning' },
  cancelled: { label: 'Cancelled', dot: 'bg-semantic-danger' },
};

function TitleCard({ title }: { title: TitleRow }) {
  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;
  const readingInfo = READING_STATUS_LABELS[title.reading_status];
  const seriesInfo = SERIES_STATUS_LABELS[title.series_status];

  return (
    <Link
      href={`/studio/titles/${title.slug}`}
      className={cn(
        'group flex flex-col rounded-lg overflow-hidden',
        'bg-bg-surface/40 border border-white/5',
        'hover:border-accent-primary/30 hover:bg-bg-surface/60',
        'transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        title.hidden && 'opacity-50',
      )}
    >
      {/* Cover Image */}
      <div className="relative">
        <CoverImage
          slug={title.cover_slug ?? title.slug}
          alt={title.title_english}
          origin={title.origin}
          tier={title.tier ?? undefined}
          dominantColor={title.dominant_color ?? '#1a1a2e'}
          rounded={false}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Featured badge */}
        {title.featured && (
          <span
            className={cn(
              'absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm',
              'bg-accent-secondary/90 text-bg-deep',
              'font-heading text-[8px] font-bold uppercase tracking-wider',
            )}
          >
            Featured
          </span>
        )}

        {/* Hidden indicator */}
        {title.hidden && (
          <span
            className={cn(
              'absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm',
              'bg-bg-deep/80 text-text-tertiary',
              'font-heading text-[8px] font-bold uppercase tracking-wider',
            )}
          >
            Hidden
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        {/* Title */}
        <h3 className="font-body text-sm font-medium text-text-primary leading-tight line-clamp-2 group-hover:text-accent-primary transition-colors duration-150">
          {title.title_english}
        </h3>

        {/* Tier badge (inline) */}
        {tierConfig && (
          <span
            className="inline-flex self-start px-1.5 py-0.5 rounded-sm font-heading text-[9px] font-bold leading-none"
            style={{
              color: tierConfig.color,
              backgroundColor: `${tierConfig.color}20`,
              border: `1px solid ${tierConfig.color}40`,
            }}
          >
            {title.tier} — {tierConfig.label}
          </span>
        )}

        {/* Status indicators */}
        <div className="flex flex-col gap-1 mt-auto pt-1.5">
          {/* Reading status */}
          <span className={cn('font-heading text-[9px] uppercase tracking-wider', readingInfo.color)}>
            {readingInfo.label}
          </span>

          {/* Series status */}
          <span className="flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', seriesInfo.dot)} />
            <span className="font-heading text-[9px] uppercase tracking-wider text-text-tertiary">
              {seriesInfo.label}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
