// ============================================================
// Admin Dashboard — overview and quick actions
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, BookOpen, ExternalLink } from 'lucide-react';
import { getServerUser } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="container-content py-10 max-w-4xl">
      <div className="flex flex-col gap-2 mb-10">
        <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
          Welcome back
        </span>
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Admin Dashboard
        </h1>
        <p className="font-body text-sm text-text-secondary">
          Signed in as <span className="text-text-primary">{user.email}</span>
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <AdminCard
          href="/admin/titles/new"
          title="Add Title"
          description="Add a new manhwa, manhua, or manga to the library."
          icon={<Plus size={20} aria-hidden="true" />}
        />
        <AdminCard
          href="/admin/titles"
          title="Manage Titles"
          description="Edit, delete, or bulk-update existing titles."
          icon={<BookOpen size={20} aria-hidden="true" />}
        />
        <AdminCard
          href="/"
          title="View Site"
          description="Open the public-facing site in a new tab."
          icon={<ExternalLink size={20} aria-hidden="true" />}
          external
        />
      </div>
    </div>
  );
}

function AdminCard({
  href,
  title,
  description,
  icon,
  external,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex flex-col gap-3 p-5 rounded-sm bg-surface-elevated/50 border border-white/5 hover:border-white/10 hover:bg-surface-elevated/70 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
    >
      <span
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-primary/10 text-accent-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-heading text-sm font-bold text-text-primary">{title}</span>
        <span className="font-body text-xs text-text-secondary">{description}</span>
      </div>
    </Link>
  );
}
