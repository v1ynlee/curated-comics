// ============================================================
// Admin — Edit Title
// ============================================================

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerUser } from '@/lib/db/supabase-server';
import { fetchTitle } from '@/services/public/titles';
import { adminFetchFormOptions } from '@/services/studio/admin';
import { TitleForm } from '@/components/admin/TitleForm';
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit: ${slug}` };
}

export default async function EditTitlePage({ params }: Props) {
  const user = await getServerUser();
  if (!user) redirect('/admin/login');

  const { slug } = await params;

  // Fetch title with hidden=true allowed (admin can see hidden titles)
  const [title, options] = await Promise.all([
    fetchTitle(slug).catch(() => null),
    adminFetchFormOptions(),
  ]);

  if (!title) notFound();

  return (
    <div className="container-content py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
            Admin · Edit
          </span>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {title.titleEnglish}
          </h1>
        </div>
        <AdminDeleteButton titleId={title.id} titleName={title.titleEnglish} />
      </div>

      <TitleForm title={title} options={options} mode="edit" />
    </div>
  );
}
