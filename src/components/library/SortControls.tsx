'use client';

// ============================================================
// SortControls — sort option selector
// ============================================================

import { cn } from '@/lib/cn';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { SortOption } from '@/types/library';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent-read', label: 'Recently Read' },
  { value: 'rating-high', label: 'Highest Rated' },
  { value: 'date-added', label: 'Date Added' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'chapters-high', label: 'Most Chapters' },
];

export function SortControls() {
  const { sortBy, setSortBy } = useLibraryStore();

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary shrink-0"
      >
        Sort
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className={cn(
          'bg-surface-elevated text-text-secondary text-xs font-body',
          'border border-white/10 rounded-sm px-2 py-1.5',
          'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-primary',
          'cursor-pointer hover:border-white/20 transition-colors',
        )}
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
