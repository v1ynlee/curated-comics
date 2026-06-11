import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TaskQueue } from '@/components/studio/tasks/TaskQueue';
import { getServerUser } from '@/lib/db/supabase-server';
import { fetchStudioTasks } from './actions';
import type { StudioTaskFilter } from './types';

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'Unified editorial work queue for Studio.',
};

interface PageProps {
  searchParams: Promise<{ filter?: StudioTaskFilter }>;
}

const FILTERS: StudioTaskFilter[] = ['all', 'titles', 'articles', 'creators', 'narratives', 'ai', 'qa'];

function normalizeFilter(value: StudioTaskFilter | undefined): StudioTaskFilter {
  if (value && FILTERS.includes(value)) return value;
  return 'all';
}

export default async function StudioTasksPage({ searchParams }: PageProps) {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const params = await searchParams;
  const activeFilter = normalizeFilter(params.filter);
  const tasks = await fetchStudioTasks();

  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">Tasks</h1>
        <p className="mt-1 max-w-2xl font-body text-sm text-text-secondary">
          One queue for unresolved editorial work across QA, titles, articles, creators, curation, AI, and drafts.
        </p>
      </div>

      <TaskQueue tasks={tasks} activeFilter={activeFilter} />
    </div>
  );
}
