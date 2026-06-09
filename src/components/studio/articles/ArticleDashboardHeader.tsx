import Link from 'next/link';
import { Plus } from 'lucide-react';

export function ArticleDashboardHeader() {
  return (
    <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Articles
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Manage drafts, scheduled stories, featured pins, metadata, and public news publishing from one editorial queue.
        </p>
      </div>

      <Link
        href="/studio/articles/new"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent-primary px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-primary/90 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 md:self-auto"
      >
        <Plus size={16} aria-hidden="true" />
        New Article
      </Link>
    </div>
  );
}
