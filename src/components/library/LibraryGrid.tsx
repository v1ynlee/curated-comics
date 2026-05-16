'use client';

// ============================================================
// LibraryGrid — asymmetrical masonry-style title grid
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/design/MOBILE_EXPERIENCE.md
//
// Layout:
//   Mobile:  2-column grid, featured titles span full width
//   Desktop: CSS columns masonry, featured titles are larger
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TitleCard } from './TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { CategoryTabs, getCategoryLabel } from './CategoryTabs';
import { FilterSheet } from './FilterSheet';
import { SortControls } from './SortControls';
import { useTitles } from '@/hooks/useTitles';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { GENRES } from '@/lib/utils/constants';
import type { Title } from '@/types/title';

export function LibraryGrid() {
  const [filterOpen, setFilterOpen] = useState(false);
  const { activeCategory, activeGenres, sortBy } = useLibraryStore();

  const filters = {
    status: activeCategory !== 'all' ? [activeCategory] : undefined,
    genres: activeGenres.length > 0 ? activeGenres : undefined,
  };

  const { data, isLoading, isError } = useTitles({
    filters,
    sortBy,
    pageSize: 48,
  });

  const titles = data?.titles ?? [];
  const total = data?.total ?? 0;
  const hasFilters = activeGenres.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Controls bar */}
      <div className="flex flex-col gap-4">
        {/* Category tabs */}
        <CategoryTabs />

        {/* Filter + sort row */}
        <div className="flex items-center justify-between gap-4">
          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-sm',
              'font-heading text-xs uppercase tracking-widest',
              'border transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              hasFilters
                ? 'border-accent-primary/40 text-accent-primary bg-accent-primary/10'
                : 'border-white/10 text-text-tertiary hover:text-text-secondary hover:border-white/20',
            )}
            aria-label={`Filters${hasFilters ? ` (${activeGenres.length} active)` : ''}`}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filter
            {hasFilters && (
              <span className="font-data text-[10px]">({activeGenres.length})</span>
            )}
          </button>

          <div className="flex items-center gap-4">
            {/* Result count */}
            {!isLoading && (
              <span className="font-data text-xs text-text-tertiary hidden sm:block">
                {total} title{total !== 1 ? 's' : ''}
              </span>
            )}
            <SortControls />
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2" aria-live="polite" aria-atomic="true">
            {activeGenres.map((slug) => (
              <ActiveFilterChip key={slug} slug={slug} />
            ))}
          </div>
        )}
      </div>

      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {!isLoading && `Showing ${titles.length} titles in ${getCategoryLabel(activeCategory)}`}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <TitleCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-24 text-center"
          >
            <p className="font-body text-text-secondary">
              Failed to load titles. Please try again.
            </p>
          </motion.div>
        ) : titles.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TitleGridLayout titles={titles} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter sheet */}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}

// ── Grid layout ───────────────────────────────────────────────

function TitleGridLayout({ titles }: { titles: Title[] }) {
  return (
    <ul
      role="list"
      aria-label="Reading library"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {titles.map((title, i) => {
        // Featured titles span 2 columns every ~8 items
        const isFeatured = title.featured && i % 8 === 0;
        return (
          <li
            key={title.id}
            className={cn(isFeatured && 'col-span-2 sm:col-span-2')}
          >
            <TitleCard
              title={title}
              index={i}
              featured={isFeatured}
              className="h-full"
            />
          </li>
        );
      })}
    </ul>
  );
}

// ── Empty state ───────────────────────────────────────────────

function EmptyState() {
  const { resetFilters, activeGenres } = useLibraryStore();
  const hasFilters = activeGenres.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-24 text-center"
    >
      <BookOpen size={40} className="text-text-tertiary" aria-hidden="true" />
      <p className="font-body text-text-secondary max-w-xs">
        {hasFilters
          ? 'No titles match your current filters.'
          : 'No titles in this category yet.'}
      </p>
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="font-body text-sm text-accent-primary hover:text-accent-primary/80 transition-colors focus-visible:outline-accent-primary"
        >
          Clear filters
        </button>
      )}
    </motion.div>
  );
}

// ── Active filter chip ────────────────────────────────────────

function ActiveFilterChip({ slug }: { slug: string }) {
  const { toggleGenre } = useLibraryStore();
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) return null;

  return (
    <button
      onClick={() => toggleGenre(slug)}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-sm',
        'font-heading text-[10px] uppercase tracking-widest',
        'border border-white/10 text-text-secondary',
        'hover:border-white/20 hover:text-text-primary transition-colors',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
      aria-label={`Remove ${genre.name} filter`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: genre.color }}
        aria-hidden="true"
      />
      {genre.name}
      <X size={10} aria-hidden="true" />
    </button>
  );
}
