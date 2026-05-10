// ============================================================
// Library Browse Page
// Source of truth: docs/roadmap/ROADMAP.md — Phase 1: Library Browse
// ============================================================

import type { Metadata } from 'next';
import { LibraryGrid } from '@/components/library/LibraryGrid';

export const metadata: Metadata = {
  title: 'Library',
  description: 'Browse my complete reading archive — manhwa, manhua, and manga.',
};

export default function LibraryPage() {
  return (
    <div className="container-content pt-24 pb-16">
      {/* Page header */}
      <div className="flex flex-col gap-2 mb-10">
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Reading Archive
        </span>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-bold text-text-primary leading-tight">
          Library
        </h1>
        <p className="font-body text-text-secondary max-w-md">
          Every title I&apos;ve read, rated, and catalogued. Filter by genre, sort by rating, explore by mood.
        </p>
      </div>

      {/* Grid with filters */}
      <LibraryGrid />
    </div>
  );
}
