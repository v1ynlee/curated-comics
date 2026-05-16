// ============================================================
// Admin — Create New Title
// ============================================================

import type { Metadata } from 'next';
import { getServerUser } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import { adminFetchFormOptions } from '@/services/studio/admin';
import { TitleForm } from '@/components/admin/TitleForm';

export const metadata: Metadata = { title: 'New Title' };

export default async function NewTitlePage() {
  const user = await getServerUser();
  if (!user) redirect('/admin/login');

  const options = await adminFetchFormOptions();

  return (
    <div className="container-content py-10 max-w-3xl">
      <div className="flex flex-col gap-1 mb-8">
        <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
          Admin
        </span>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Add New Title
        </h1>
      </div>

      <TitleForm options={options} mode="create" />
    </div>
  );
}
