'use client';

// ============================================================
// Search Page — fuzzy title search
// Source of truth: docs/roadmap/ROADMAP.md — Phase 5
//
// Uses Supabase full-text search (websearch mode) with
// client-side debouncing for a responsive feel.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Inbox } from 'lucide-react';
import { TitleCard } from '@/components/library/TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { useTitles } from '@/hooks/useTitles';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/cn';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isLoading } = useTitles({
    filters: debouncedQuery.trim() ? { search: debouncedQuery.trim() } : {},
    sortBy: 'rating-high',
    pageSize: 24,
  });

  const titles = data?.titles ?? [];
  const total = data?.total ?? 0;
  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="container-content pt-6 md:pt-24 pb-16">
      {/* Header */}
      <motion.div
        className="flex flex-col gap-2 mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
      >
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Search
        </span>
        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-text-primary leading-tight">
          Find a Title
        </h1>
      </motion.div>

      {/* Search input */}
      <div className="relative mb-8">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, genres, vibes…"
          autoFocus
          className={cn(
            'w-full pl-12 pr-4 py-4 rounded-sm',
            'bg-surface-elevated border border-white/10',
            'font-body text-lg text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            'transition-colors hover:border-white/20',
          )}
          aria-label="Search titles"
          aria-controls="search-results"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors focus-visible:outline-accent-primary rounded-sm"
            aria-label="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Results */}
      <div id="search-results" aria-live="polite" aria-atomic="false">
        {/* Result count */}
        {hasQuery && !isLoading && (
          <p className="font-data text-xs text-text-tertiary mb-6">
            {total > 0
              ? `${total} result${total !== 1 ? 's' : ''} for "${debouncedQuery}"`
              : `No results for "${debouncedQuery}"`}
          </p>
        )}

        <AnimatePresence mode="wait">
          {isLoading && hasQuery ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <TitleCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : !hasQuery ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-20 text-center"
            >
              <Search size={40} className="text-text-tertiary" aria-hidden="true" />
              <p className="font-body text-text-secondary max-w-xs">
                Type a title name, genre, or vibe to search the archive.
              </p>
            </motion.div>
          ) : titles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-20 text-center"
            >
              <Inbox size={40} className="text-text-tertiary" aria-hidden="true" />
              <p className="font-body text-text-secondary max-w-xs">
                Nothing found. Try a different search term.
              </p>
            </motion.div>
          ) : (
            <motion.ul
              key={debouncedQuery}
              role="list"
              aria-label="Search results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {titles.map((title, i) => (
                <li key={title.id}>
                  <TitleCard title={title} index={i} />
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
