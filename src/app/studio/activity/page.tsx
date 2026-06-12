import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ActivityTimeline } from '@/components/studio/activity/ActivityTimeline';
import { getServerUser } from '@/lib/db/supabase-server';
import { fetchActivityFeed } from './actions';
import type { ActivityFilter } from './types';

export const metadata: Metadata = {
  title: 'Activity',
  description: 'Studio editorial activity audit trail.',
};

interface PageProps {
  searchParams: Promise<{ filter?: ActivityFilter; q?: string }>;
}

const VALID_FILTERS: ActivityFilter[] = ['all', 'titles', 'articles', 'creators', 'media', 'curation', 'ai', 'drafts', 'qa'];

function normalizeFilter(value: ActivityFilter | undefined): ActivityFilter {
  if (value && VALID_FILTERS.includes(value)) return value;
  return 'all';
}

export default async function StudioActivityPage({ searchParams }: PageProps) {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const params = await searchParams;
  const activeFilter = normalizeFilter(params.filter);
  const query = params.q?.trim() ?? '';
  const items = await fetchActivityFeed(activeFilter, query);

  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">Activity</h1>
        <p className="mt-1 max-w-2xl font-body text-sm text-text-secondary">
          A chronological audit trail for editorial changes, AI assistance, drafts, QA, and curation work.
        </p>
      </div>

      <ActivityTimeline items={items} activeFilter={activeFilter} query={query} />
    </div>
  );
}
