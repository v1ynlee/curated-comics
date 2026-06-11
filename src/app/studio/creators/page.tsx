import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CreatorManagementDashboard } from '@/components/studio/creators/CreatorManagementDashboard';
import { getServerUser } from '@/lib/db/supabase-server';
import { fetchCreatorTitleOptions, fetchStudioCreators } from './actions';

export const metadata: Metadata = {
  title: 'Creators',
  description: 'Manage authors, artists, studios, and title relationships.',
};

export default async function StudioCreatorsPage() {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const [creators, titleOptions] = await Promise.all([
    fetchStudioCreators(),
    fetchCreatorTitleOptions(),
  ]);

  return <CreatorManagementDashboard initialCreators={creators} titleOptions={titleOptions} />;
}
