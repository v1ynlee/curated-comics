// Phase 3 — Stats page stub

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Statistics' };

export default function StatsPage() {
  return (
    <div className="container-content pt-24 pb-16">
      <div className="flex flex-col gap-2 mb-10">
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Coming in Phase 3
        </span>
        <h1 className="font-display text-5xl font-bold text-text-primary">Statistics</h1>
        <p className="font-body text-text-secondary max-w-md">
          Reading stats, genre distribution, and yearly arcs.
        </p>
      </div>
    </div>
  );
}
