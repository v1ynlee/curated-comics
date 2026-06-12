import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MediaDashboard } from '@/components/studio/media/MediaDashboard';
import { getServerUser } from '@/lib/db/supabase-server';
import { fetchMediaWorkspaceData } from './actions';
import type { MediaTab } from './types';

export const metadata: Metadata = {
  title: 'Media',
  description: 'Centralized digital asset management for Studio.',
};

interface PageProps {
  searchParams?: Promise<{ tab?: MediaTab }>;
}

const TABS: MediaTab[] = ['assets', 'gallery', 'characters', 'storage-explorer', 'storage', 'usage'];

function normalizeTab(value: MediaTab | undefined): MediaTab {
  if (value && TABS.includes(value)) return value;
  return 'assets';
}

export default async function StudioMediaPage({ searchParams }: PageProps = {}) {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const params = await (searchParams ?? Promise.resolve({} as { tab?: MediaTab }));
  const data = await fetchMediaWorkspaceData();

  return <div><MediaDashboard data={data} initialTab={normalizeTab(params.tab)} /></div>;
}
