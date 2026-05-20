'use client';

// ============================================================
// ArticleFilters — Client-side search + state filter for Articles.
// Filters the already-loaded article list in-memory (no server
// round-trip needed for ~100-200 articles). Instant results.
// ============================================================

import { useCallback, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PublicationState } from '@/types/article';

// ── Types ─────────────────────────────────────────────────────

interface ArticleFilterable {
  title: string;
  publicationState: PublicationState;
}

interface ArticleFiltersProps<T extends ArticleFilterable> {
  articles: T[];
  children: (filtered: T[]) => React.ReactNode;
}

// ── State Options ─────────────────────────────────────────────

const STATE_OPTIONS: { value: PublicationState | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// ── Component ─────────────────────────────────────────────────

export function ArticleFilters<T extends ArticleFilterable>({
  articles,
  children,
}: ArticleFiltersProps<T>) {
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<PublicationState | ''>('');

  const hasFilters = !!(query || stateFilter);

  // Filter articles in-memory
  const filtered = useMemo(() => {
    let result = articles;

    if (stateFilter) {
      result = result.filter((a) => a.publicationState === stateFilter);
    }

    if (query) {
      const lower = query.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(lower));
    }

    return result;
  }, [articles, query, stateFilter]);

  const clearFilters = useCallback(() => {
    setQuery('');
    setStateFilter('');
  }, []);

  return (
    <>
      {/* Filter controls */}
      <div
        className={cn(
          'flex flex-col gap-3 mb-6 p-4 rounded-lg',
          'bg-bg-surface/40 border border-white/5',
        )}
        role="search"
        aria-label="Filter articles"
      >
        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              'w-full pl-9 pr-10 py-3 rounded-lg min-h-[44px]',
              'bg-bg-deep/60 border border-white/10',
              'font-body text-sm text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
              'transition-colors duration-150',
            )}
            aria-label="Search articles by title"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-1 rounded-sm text-text-tertiary hover:text-text-secondary',
                'transition-colors duration-150',
              )}
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* State filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
          {STATE_OPTIONS.map(({ value, label }) => {
            const isActive = stateFilter === value;
            return (
              <button
                key={value || 'all'}
                type="button"
                onClick={() => setStateFilter(value)}
                className={cn(
                  'min-h-[36px] px-3 py-1.5 rounded-full shrink-0',
                  'font-heading text-xs font-bold',
                  'transition-all duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                  isActive
                    ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                    : 'bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 hover:text-text-primary',
                )}
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}

          {/* Clear all */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                'min-h-[36px] px-3 py-1.5 rounded-full shrink-0',
                'font-heading text-xs font-bold',
                'text-text-tertiary hover:text-text-secondary',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              )}
            >
              Clear
            </button>
          )}
        </div>

        {/* Result count */}
        {hasFilters && (
          <p className="font-body text-xs text-text-tertiary" aria-live="polite">
            {filtered.length} of {articles.length} article{articles.length !== 1 ? 's' : ''} shown
          </p>
        )}
      </div>

      {/* Render filtered results */}
      {children(filtered)}
    </>
  );
}
