import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { QAWorkspace } from '@/components/studio/qa/QAWorkspace';
import { getServerUser } from '@/lib/db/supabase-server';
import { fetchQAData } from './actions';
import type { QAIssueType } from './types';

export const metadata: Metadata = {
  title: 'QA',
  description: 'Editorial content health checks for Studio.',
};

interface PageProps {
  searchParams: Promise<{ issue?: QAIssueType }>;
}

export default async function StudioQAPage({ searchParams }: PageProps) {
  const user = await getServerUser();
  if (!user) redirect('/studio/login');

  const params = await searchParams;
  const data = await fetchQAData();

  return (
    <div className="container-content max-w-7xl py-8">
      <QAWorkspace data={data} activeIssue={params.issue} />
    </div>
  );
}
