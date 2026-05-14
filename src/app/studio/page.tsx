// ============================================================
// Studio Dashboard — Cinematic overview and quick actions
// Server component that queries Supabase for counts and recent activity.
// Requirements: 7.4, 9.3
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
  Clock,
  TrendingUp,
} from 'lucide-react';
import { createSupabaseServerClient, getServerUser } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Studio Dashboard',
  description: 'Comic Curated creative workspace — overview and quick actions.',
};

/** Fetch overview counts from Supabase */
async function fetchDashboardData() {
  const supabase = await createSupabaseServerClient();

  // Fetch counts in parallel
  const [titlesResult, articlesResult, mediaResult] = await Promise.all([
    supabase.from('titles').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('publication_state', 'published'),
    supabase.from('media_assets').select('id', { count: 'exact', head: true }),
  ]);

  // Fetch recent activity: latest updated titles and latest articles
  const [recentTitlesResult, recentArticlesResult] = await Promise.all([
    supabase
      .from('titles')
      .select('id, slug, title_english, tier, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('articles')
      .select('id, slug, title, publication_state, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  return {
    counts: {
      titles: titlesResult.count ?? 0,
      publishedArticles: articlesResult.count ?? 0,
      mediaAssets: mediaResult.count ?? 0,
    },
    recentTitles: recentTitlesResult.data ?? [],
    recentArticles: recentArticlesResult.data ?? [],
  };
}

export default async function StudioDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const { counts, recentTitles, recentArticles } = await fetchDashboardData();

  // Merge and sort recent activity by updated_at
  const recentActivity = [
    ...recentTitles.map((t) => ({
      id: t.id,
      type: 'title' as const,
      label: t.title_english,
      meta: t.tier ? `Tier ${t.tier}` : 'Unranked',
      href: `/studio/titles/${t.slug}`,
      updatedAt: t.updated_at,
    })),
    ...recentArticles.map((a) => ({
      id: a.id,
      type: 'article' as const,
      label: a.title,
      meta: a.publication_state,
      href: `/studio/articles/${a.slug}`,
      updatedAt: a.updated_at,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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
        {recentActivity.length === 0 ? (
          <div className="state-empty">
            <TrendingUp size={32} className="text-text-tertiary" aria-hidden="true" />
            <p className="font-body text-sm text-text-secondary">
              No recent activity yet. Start by adding a title or writing an article.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function OverviewCard({
  icon,
  label,
  value,
  accentClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accentClass: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-5 rounded-lg',
        'bg-bg-surface/60 backdrop-blur-sm',
        'border border-white/5',
        'shadow-[0_0_40px_-15px_rgba(139,92,246,0.08)]',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center w-11 h-11 rounded-lg',
          accentClass,
        )}
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="font-data text-2xl font-bold text-text-primary">
          {value.toLocaleString()}
        </span>
        <span className="font-heading text-[10px] uppercase tracking-[0.15em] text-text-tertiary">
          {label}
        </span>
      </div>
    </div>
  );
}

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

function ActivityItem({
  item,
}: {
  item: {
    id: string;
    type: 'title' | 'article';
    label: string;
    meta: string;
    href: string;
    updatedAt: string;
  };
}) {
  const timeAgo = getRelativeTime(item.updatedAt);

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        'hover:border-white/10 hover:bg-bg-surface/60',
        'transition-all duration-fast',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
    >
      {/* Type indicator */}
      <span
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-md shrink-0',
          item.type === 'title'
            ? 'bg-accent-primary/10 text-accent-primary'
            : 'bg-accent-tertiary/10 text-accent-tertiary',
        )}
        aria-hidden="true"
      >
        {item.type === 'title' ? (
          <BookOpen size={14} />
        ) : (
          <Newspaper size={14} />
        )}
      </span>

      {/* Content */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-body text-sm text-text-primary truncate">
          {item.label}
        </span>
        <span className="font-heading text-[10px] uppercase tracking-[0.15em] text-text-tertiary">
          {item.type === 'title' ? 'Title' : 'Article'} · {item.meta}
        </span>
      </div>

      {/* Timestamp */}
      <span className="flex items-center gap-1.5 shrink-0">
        <Clock size={12} className="text-text-tertiary" aria-hidden="true" />
        <time
          dateTime={item.updatedAt}
          className="font-data text-[11px] text-text-tertiary"
        >
          {timeAgo}
        </time>
      </span>
    </Link>
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
