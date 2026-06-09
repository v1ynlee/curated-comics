'use client';

// ============================================================
// CreatorsDirectory — searchable/filterable creator list
// ============================================================

import { startTransition, useDeferredValue, useState } from 'react';
import { Search } from 'lucide-react';
import { CreatorCard, CreatorCardSkeleton } from './CreatorCard';
import { formatCreatorType } from './creator-display';
import { useCreators } from '@/hooks/useCreators';
import { cn } from '@/lib/utils/cn';
import type { CreatorType } from '@/types/creator';

type CreatorFilter = 'all' | CreatorType;

const FILTERS: CreatorFilter[] = ['all', 'author', 'artist', 'studio'];

export function CreatorsDirectory() {
  const { data: creators = [], isLoading, isError } = useCreators();
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<CreatorFilter>('all');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredCreators = creators.filter((creator) => {
    const matchesType = activeType === 'all' || creator.type === activeType || creator.roles.includes(activeType);
    const matchesSearch =
      deferredQuery.length === 0 ||
      creator.name.toLowerCase().includes(deferredQuery) ||
      creator.description?.toLowerCase().includes(deferredQuery);

    return matchesType && matchesSearch;
  });

  return (
    <section aria-labelledby="creators-directory-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-surface-elevated/25 p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search creators"
            className={cn(
              'h-11 w-full rounded-md border border-white/10 bg-bg-deep/40 pl-9 pr-3',
              'font-body text-sm text-text-primary placeholder:text-text-tertiary',
              'outline-none transition-colors focus:border-accent-primary/60',
            )}
            aria-label="Search creators"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter creators by type">
          {FILTERS.map((filter) => {
            const selected = activeType === filter;
            const label = filter === 'all' ? 'All' : formatCreatorType(filter);

            return (
              <button
                key={filter}
                type="button"
                onClick={() => startTransition(() => setActiveType(filter))}
                className={cn(
                  'h-9 rounded-md border px-3 font-heading text-xs tracking-wide transition-colors',
                  selected
                    ? 'border-accent-primary/60 bg-accent-primary/12 text-text-primary'
                    : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
                )}
                aria-pressed={selected}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 id="creators-directory-heading" className="font-heading text-sm font-semibold tracking-wide text-text-primary">
          Creator Directory
        </h2>
        {!isLoading && (
          <span className="font-data text-xs text-text-tertiary">
            {filteredCreators.length} creator{filteredCreators.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <CreatorCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="state-empty">
          <p className="font-body text-text-secondary">Could not load creators.</p>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="state-empty">
          <p className="font-body text-text-secondary">No creators match the current filters.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
          {filteredCreators.map((creator, index) => (
            <li key={creator.id}>
              <CreatorCard creator={creator} index={index} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
