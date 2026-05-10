// Phase 2 — Discover page stub

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Discover' };

export default function DiscoverPage() {
  return (
    <div className="container-content pt-24 pb-16">
      <div className="flex flex-col gap-2 mb-10">
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Coming in Phase 2
        </span>
        <h1 className="font-display text-5xl font-bold text-text-primary">Discover</h1>
        <p className="font-body text-text-secondary max-w-md">
          Mood-based browsing — find your next read by vibe.
        </p>
      </div>
    </div>
  );
}
