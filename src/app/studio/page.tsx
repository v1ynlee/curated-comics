import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bot, CalendarClock, CheckCircle2, ExternalLink, FileText, HeartPulse, ListChecks, Plus } from 'lucide-react';
import { DraftRecoveryWidget } from '@/components/studio/dashboard/DraftRecoveryWidget';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { cn } from '@/lib/utils/cn';
import { calculateTitleCompletion } from '@/services/studio/title-completion';
import { fetchQAData } from './qa/actions';
import type { ActivityItem } from './activity/types';
import type { QAResultItem, QAIssueType } from './qa/types';

export const metadata: Metadata = {
  title: 'Studio Dashboard',
  description: 'Comic Curated Studio operational command center.',
};

interface TitleHealthRow {
  id: string;
  slug: string;
  title_english: string;
  synopsis: string | null;
  cover_slug: string | null;
  tier: string | null;
  hidden: boolean;
  featured: boolean;
}

interface ScheduledArticleRow {
  id: string;
  slug: string;
  title: string;
  publication_state: string;
  editorial_state?: string | null;
  scheduled_date: string | null;
  updated_at: string;
}

interface WorkflowArticleRow {
  id: string;
  editorial_state: string | null;
  scheduled_date: string | null;
}

interface ScheduledArticleItem extends ScheduledArticleRow {
  overdue: boolean;
}

interface RelationRow { title_id: string }
interface GalleryRow { title_id: string }
interface NarrativeRow { id: string; title: string; cover_slugs: string[] | null }
interface FeaturedCreatorRow { creator_id: string }
interface CreatorRow { id: string; status?: string | null }

interface LowConfidenceAIItem {
  id: string;
  title: string;
  confidencePercent: number;
  affectedFields: string[];
  createdAt: string;
}

interface AttentionCardData {
  label: string;
  count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  href: string;
}

interface LowestCompletionTitle {
  id: string;
  slug: string;
  title: string;
  score: number;
}

interface WorkflowSummaryItem {
  label: string;
  value: number;
  href: string;
}

function formatDate(value: string | null) {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function severityTone(severity: AttentionCardData['severity']) {
  if (severity === 'critical') return 'border-red-400/30 bg-red-400/10 text-red-300';
  if (severity === 'high') return 'border-amber-400/30 bg-amber-400/10 text-amber-300';
  if (severity === 'medium') return 'border-yellow-400/25 bg-yellow-400/10 text-yellow-300';
  return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
}

function issueCount(results: QAResultItem[], type: QAIssueType, entityType?: QAResultItem['entityType']) {
  return results.filter((item) => item.issueType === type && (!entityType || item.entityType === entityType)).length;
}

function confidenceStats(metadata: Record<string, unknown>) {
  const raw = metadata.confidenceLevels;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const entries = Object.entries(raw as Record<string, { confidence?: string } | null>)
    .filter(([, value]) => value?.confidence === 'medium' || value?.confidence === 'low');
  if (entries.length === 0) return null;
  const lowCount = entries.filter(([, value]) => value?.confidence === 'low').length;
  const confidencePercent = Math.round(((entries.length - lowCount) / entries.length) * 100);
  return { affectedFields: entries.map(([field]) => field), confidencePercent };
}

async function fetchOperationalData() {
  const supabase = await createSupabaseServerClient();
  const qaData = await fetchQAData();

  const [
    titlesResult,
    genresResult,
    moodsResult,
    creatorsResult,
    linksResult,
    reviewsResult,
    galleryResult,
    scheduledResult,
    workflowResult,
    narrativesResult,
    featuredCreatorsResult,
    creatorRowsResult,
    activityResult,
  ] = await Promise.all([
    supabase.from('titles').select('id, slug, title_english, synopsis, cover_slug, tier, hidden, featured'),
    supabase.from('title_genres').select('title_id'),
    supabase.from('title_moods').select('title_id'),
    supabase.from('title_creators').select('title_id'),
    supabase.from('external_links').select('title_id'),
    supabase.from('reviews').select('title_id'),
    supabase.from('title_gallery').select('title_id'),
    supabase.from('articles').select('id, slug, title, publication_state, editorial_state, scheduled_date, updated_at').or('publication_state.eq.scheduled,editorial_state.eq.scheduled').order('scheduled_date', { ascending: true }).limit(6),
    supabase.from('articles').select('id, editorial_state, scheduled_date'),
    supabase.from('featured_narratives').select('id, title, cover_slugs'),
    supabase.from('featured_creators').select('creator_id'),
    supabase.from('creators').select('id, status'),
    supabase.from('editorial_activity_log').select('id, event_type, entity_type, entity_id, entity_name, actor_id, actor_name, metadata, created_at').order('created_at', { ascending: false }).limit(20),
  ]);

  const titles = (titlesResult.data ?? []) as TitleHealthRow[];
  const sets = {
    genres: new Set(((genresResult.data ?? []) as RelationRow[]).map((row) => row.title_id)),
    moods: new Set(((moodsResult.data ?? []) as RelationRow[]).map((row) => row.title_id)),
    creators: new Set(((creatorsResult.data ?? []) as RelationRow[]).map((row) => row.title_id)),
    links: new Set(((linksResult.data ?? []) as RelationRow[]).map((row) => row.title_id)),
    reviews: new Set(((reviewsResult.data ?? []) as RelationRow[]).map((row) => row.title_id)),
    gallery: new Set(((galleryResult.data ?? []) as GalleryRow[]).map((row) => row.title_id)),
  };
  const visibleTitles = titles.filter((title) => !title.hidden);
  const scoredTitles = visibleTitles.map((title) => ({
    id: title.id,
    slug: title.slug,
    title: title.title_english,
    score: calculateTitleCompletion({
      coverSlug: title.cover_slug,
      synopsis: title.synopsis,
      genresCount: sets.genres.has(title.id) ? 1 : 0,
      moodsCount: sets.moods.has(title.id) ? 1 : 0,
      creatorsCount: sets.creators.has(title.id) ? 1 : 0,
      readingUrlsCount: sets.links.has(title.id) ? 1 : 0,
      hasReview: sets.reviews.has(title.id),
      tier: title.tier,
      galleryAssetsCount: sets.gallery.has(title.id) ? 1 : 0,
      hidden: title.hidden,
    }).score,
  }));
  const scores = scoredTitles.map((title) => title.score);
  const averageCompletion = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 100;
  const incompleteTitles = scores.filter((score) => score < 80).length;
  const lowCompletionTitles = scores.filter((score) => score < 60).length;
  const lowestCompletionTitles = scoredTitles.sort((a, b) => a.score - b.score).slice(0, 5);

  const titleSlugs = new Set(titles.map((title) => title.slug));
  const brokenNarratives = ((narrativesResult.data ?? []) as NarrativeRow[]).filter((narrative) => {
    const slugs = narrative.cover_slugs ?? [];
    return slugs.length < 4 || slugs.length > 6 || slugs.some((slug) => !titleSlugs.has(slug));
  }).length;
  const creatorsById = new Map(((creatorRowsResult.data ?? []) as CreatorRow[]).map((creator) => [creator.id, creator]));
  const brokenFeaturedCreators = ((featuredCreatorsResult.data ?? []) as FeaturedCreatorRow[]).filter((featured) => {
    const creator = creatorsById.get(featured.creator_id);
    return !creator || creator.status === 'archived';
  }).length;
  const featuredTitles = visibleTitles.filter((title) => title.featured).length;
  const featuredWithCovers = visibleTitles.filter((title) => title.featured && title.cover_slug).length;
  const featuredCoverage = featuredTitles ? Math.round((featuredWithCovers / featuredTitles) * 100) : 100;

  const activityRows = (activityResult.data ?? []) as Array<{
    id: string;
    event_type: ActivityItem['eventType'];
    entity_type: ActivityItem['entityType'];
    entity_id: string | null;
    entity_name: string | null;
    actor_id: string | null;
    actor_name: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>;
  const activityItems: ActivityItem[] = activityRows.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityName: row.entity_name,
    actorId: row.actor_id,
    actorName: row.actor_name,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  }));
  const lowConfidenceAI: LowConfidenceAIItem[] = activityItems
    .filter((item) => item.eventType === 'AI_AUTOFILL_APPLIED' || item.eventType === 'AI_AUTOFILL_REJECTED')
    .map((item) => {
      const stats = confidenceStats(item.metadata);
      if (!stats) return null;
      return { id: item.id, title: item.entityName ?? 'Untitled AI result', createdAt: item.createdAt, ...stats };
    })
    .filter((item): item is LowConfidenceAIItem => Boolean(item))
    .slice(0, 5);

  const now = Date.now();
  const scheduled: ScheduledArticleItem[] = ((scheduledResult.data ?? []) as ScheduledArticleRow[]).map((article) => ({
    ...article,
    overdue: Boolean(article.scheduled_date && new Date(article.scheduled_date).getTime() < now),
  }));
  const scheduledFailures = scheduled.filter((article) => article.overdue).length;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const workflowArticles = (workflowResult.data ?? []) as WorkflowArticleRow[];
  const workflowSummary: WorkflowSummaryItem[] = [
    { label: 'Needs Edit', value: workflowArticles.filter((article) => article.editorial_state === 'needs_edit').length, href: '/studio/articles' },
    { label: 'Ready For Review', value: workflowArticles.filter((article) => article.editorial_state === 'ready_for_review').length, href: '/studio/articles' },
    { label: 'Approved', value: workflowArticles.filter((article) => article.editorial_state === 'approved').length, href: '/studio/articles' },
    { label: 'Scheduled Today', value: workflowArticles.filter((article) => article.editorial_state === 'scheduled' && article.scheduled_date?.slice(0, 10) === todayKey).length, href: '/studio/articles' },
  ];

  return {
    qaData,
    attention: [
      { label: 'Missing Covers', count: issueCount(qaData.results, 'missing-covers'), severity: 'high' as const, href: '/studio/qa?issue=missing-covers' },
      { label: 'Broken Featured Items', count: issueCount(qaData.results, 'broken-featured') + brokenFeaturedCreators, severity: 'critical' as const, href: '/studio/qa?issue=broken-featured' },
      { label: 'Missing Creators', count: issueCount(qaData.results, 'missing-creators'), severity: 'high' as const, href: '/studio/qa?issue=missing-creators' },
      { label: 'Low Completion Titles', count: lowCompletionTitles, severity: 'medium' as const, href: '/studio/titles' },
      { label: 'Unreviewed Titles', count: issueCount(qaData.results, 'unreviewed-titles'), severity: 'medium' as const, href: '/studio/qa?issue=unreviewed-titles' },
      { label: 'Scheduled Failures', count: scheduledFailures, severity: 'critical' as const, href: '/studio/articles' },
    ],
    needsReview: qaData.results.slice(0, 8),
    workflowSummary,
    scheduled,
    lowConfidenceAI,
    activityItems: activityItems.slice(0, 8),
    health: {
      averageCompletion,
      incompleteTitles,
      pendingReviews: issueCount(qaData.results, 'unreviewed-titles'),
      brokenNarratives,
      featuredCoverage,
      lowestCompletionTitles,
    },
  };
}

export default async function StudioDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const data = await fetchOperationalData();

  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">Studio</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">What requires attention today?</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/studio/titles/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90"><Plus className="h-4 w-4" aria-hidden="true" />New Title</Link>
          <Link href="/studio/articles/new" className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 font-heading text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"><FileText className="h-4 w-4" aria-hidden="true" />New Article</Link>
        </div>
      </div>

      <SectionHeader title="Attention Required" href="/studio/qa" />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {data.attention.map((item) => <AttentionCard key={item.label} item={item} />)}
      </div>

      <section className="mb-8">
        <SectionHeader title="Article Workflow" href="/studio/articles" />
        <WorkflowSummary items={data.workflowSummary} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section>
            <SectionHeader title="Needs Review Queue" href="/studio/tasks" />
            <NeedsReviewList items={data.needsReview} />
          </section>

          <section>
            <SectionHeader title="Scheduled Content" href="/studio/articles" />
            <ScheduledList items={data.scheduled} />
          </section>

          <section>
            <SectionHeader title="Draft Recovery" />
            <DraftRecoveryWidget />
          </section>
        </div>

        <aside className="space-y-8">
          <section>
            <SectionHeader title="Low Confidence AI" href="/studio/activity?filter=ai" />
            <LowConfidenceList items={data.lowConfidenceAI} />
          </section>

          <section>
            <SectionHeader title="Recent Editorial Activity" href="/studio/activity" />
            <RecentActivityList items={data.activityItems} />
          </section>

          <section>
            <SectionHeader title="Content Health" href="/studio/qa" />
            <ContentHealthPanel health={data.health} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-heading text-lg font-semibold text-text-primary">{title}</h2>
      {href && <Link href={href} className="inline-flex items-center gap-1 font-body text-xs text-text-tertiary hover:text-text-primary">Open <ExternalLink className="h-3 w-3" aria-hidden="true" /></Link>}
    </div>
  );
}

function AttentionCard({ item }: { item: AttentionCardData }) {
  return (
    <Link href={item.href} className="rounded-lg border border-white/10 bg-bg-surface/35 p-4 transition-colors hover:border-white/20 hover:bg-bg-surface/50">
      <div className="flex items-start justify-between gap-3">
        <p className="font-body text-sm font-medium text-text-primary">{item.label}</p>
        <span className={cn('rounded-md border px-2 py-0.5 font-body text-xs', severityTone(item.severity))}>{item.severity}</span>
      </div>
      <p className="mt-4 font-data text-3xl text-text-primary">{item.count}</p>
      <p className="mt-1 font-body text-xs text-text-tertiary">Quick open</p>
    </Link>
  );
}

function NeedsReviewList({ items }: { items: QAResultItem[] }) {
  if (items.length === 0) return <EmptyPanel icon="check" text="No unresolved review items." />;
  return (
    <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-bg-surface/35">
      {items.map((item) => (
        <div key={item.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="font-body text-sm font-medium text-text-primary">{item.title}</p>
            <p className="mt-1 font-body text-xs text-text-secondary">{item.issueDetail ?? item.issueLabel}</p>
          </div>
          <div className="flex gap-2">
            <Link href={item.editorHref} className="inline-flex h-8 items-center rounded-md border border-white/10 px-3 font-body text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary">Open</Link>
            <Link href={`/studio/qa?issue=${item.issueType}`} className="inline-flex h-8 items-center rounded-md bg-accent-primary px-3 font-heading text-xs text-white hover:bg-accent-primary/90">Resolve</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkflowSummary({ items }: { items: WorkflowSummaryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="rounded-lg border border-white/10 bg-bg-surface/35 p-4 transition-colors hover:border-white/20 hover:bg-bg-surface/50">
          <p className="font-body text-sm text-text-secondary">{item.label}</p>
          <p className="mt-3 font-data text-3xl text-text-primary">{item.value}</p>
        </Link>
      ))}
    </div>
  );
}

function ScheduledList({ items }: { items: ScheduledArticleItem[] }) {
  if (items.length === 0) return <EmptyPanel icon="calendar" text="No scheduled content pending." />;
  return (
    <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-bg-surface/35">
      {items.map((item) => {
        return (
          <Link key={item.id} href={`/studio/articles/${item.slug}`} className="grid gap-2 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <p className="truncate font-body text-sm font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 font-body text-xs text-text-tertiary">Scheduled {formatDate(item.scheduled_date)}</p>
            </div>
            <span className={cn('rounded-md border px-2 py-1 font-body text-xs', item.overdue ? 'border-red-400/30 bg-red-400/10 text-red-300' : 'border-white/10 text-text-secondary')}>{item.overdue ? 'overdue' : 'scheduled'}</span>
          </Link>
        );
      })}
    </div>
  );
}

function LowConfidenceList({ items }: { items: LowConfidenceAIItem[] }) {
  if (items.length === 0) return <EmptyPanel icon="bot" text="No medium or low confidence AI events." />;
  return (
    <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-bg-surface/35">
      {items.map((item) => (
        <Link key={item.id} href="/studio/activity?filter=ai" className="block px-4 py-3 transition-colors hover:bg-white/[0.03]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-body text-sm font-medium text-text-primary">{item.title}</p>
              <p className="mt-1 line-clamp-1 font-body text-xs text-text-secondary">{item.affectedFields.join(', ')}</p>
            </div>
            <span className="font-data text-sm text-amber-300">{item.confidencePercent}%</span>
          </div>
          <p className="mt-1 font-body text-xs text-text-tertiary">{relativeTime(item.createdAt)}</p>
        </Link>
      ))}
    </div>
  );
}

function RecentActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return <EmptyPanel icon="activity" text="No editorial activity recorded." />;
  return (
    <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-bg-surface/35">
      {items.map((item) => (
        <Link key={item.id} href="/studio/activity" className="block px-4 py-3 transition-colors hover:bg-white/[0.03]">
          <p className="truncate font-body text-sm font-medium text-text-primary">{eventLabel(item.eventType)}</p>
          <p className="mt-1 truncate font-body text-xs text-text-secondary">{item.entityName ?? 'Untitled record'}</p>
          <p className="mt-1 font-body text-xs text-text-tertiary">{relativeTime(item.createdAt)}</p>
        </Link>
      ))}
    </div>
  );
}

function ContentHealthPanel({ health }: { health: { averageCompletion: number; incompleteTitles: number; pendingReviews: number; brokenNarratives: number; featuredCoverage: number; lowestCompletionTitles: LowestCompletionTitle[] } }) {
  const rows = [
    ['Average Title Completion', `${health.averageCompletion}%`],
    ['Incomplete Titles', health.incompleteTitles.toString()],
    ['Pending Reviews', health.pendingReviews.toString()],
    ['Broken Narratives', health.brokenNarratives.toString()],
    ['Featured Coverage', `${health.featuredCoverage}%`],
  ];
  return (
    <div className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
      <div className="mb-4 flex items-center gap-2 text-text-secondary"><HeartPulse className="h-4 w-4" aria-hidden="true" /><p className="font-body text-sm">Editorial quality snapshot</p></div>
      <dl className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="font-body text-sm text-text-secondary">{label}</dt>
            <dd className="font-data text-sm text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
      {health.lowestCompletionTitles.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-3 font-heading text-sm font-semibold text-text-primary">Lowest Completion Titles</p>
          <div className="space-y-2">
            {health.lowestCompletionTitles.map((title) => (
              <Link key={title.id} href={`/studio/titles/${title.slug}`} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-white/5">
                <span className="truncate font-body text-sm text-text-secondary">{title.title}</span>
                <span className="font-data text-xs text-text-primary">{title.score}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyPanel({ icon, text }: { icon: 'check' | 'calendar' | 'bot' | 'activity'; text: string }) {
  const Icon = icon === 'check' ? CheckCircle2 : icon === 'calendar' ? CalendarClock : icon === 'bot' ? Bot : ListChecks;
  return <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-bg-surface/35 px-4 py-6"><Icon className="h-5 w-5 text-text-tertiary" aria-hidden="true" /><p className="font-body text-sm text-text-secondary">{text}</p></div>;
}

function eventLabel(value: string) {
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
