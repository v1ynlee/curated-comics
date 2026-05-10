'use client';

// ============================================================
// DiscoveryGrid — mood-filtered title results
// Source of truth: docs/design/UI_UX_DIRECTION.md
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { TitleCard } from '@/components/library/TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { useTitles } from '@/hooks/useTitles';
import type { Mood } from '@/types/title';

interface DiscoveryGridProps {
  activeMood: Mood | null;
}

export function DiscoveryGrid({ activeMood }: DiscoveryGridProps) {
  const filters = activeMood
    ? { moods: [activeMood.slug] }
    : {};

  const { data, isLoading, isError } = useTitles({
    filters,
    sortBy: 'rating-high',
    pageSize: 24,
  });

  const titles = data?.titles ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          {activeMood ? (
            <>
              <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
                {activeMood.emoji} {activeMood.name}
              </span>
              <p className="font-body text-sm text-text-secondary max-w-md">
                {activeMood.description}
              </p>
            </>
          ) : (
            <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
              All Titles
            </span>
          )}
        </div>
        {!isLoading && total > 0 && (
          <span className="font-data text-xs text-text-tertiary shrink-0">
            {total} title{total !== 1 ? 's' : ''}
          </span>
        )}
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
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-body text-text-secondary text-center py-16"
          >
            Failed to load titles.
          </motion.p>
        ) : titles.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-20 text-center"
          >
            <span className="text-4xl" aria-hidden="true">
              {activeMood?.emoji ?? '📚'}
            </span>
            <p className="font-body text-text-secondary max-w-xs">
              {activeMood
                ? `No titles tagged with "${activeMood.name}" yet.`
                : 'No titles found.'}
            </p>
          </motion.div>
        ) : (
          <motion.ul
            key={activeMood?.slug ?? 'all'}
            role="list"
            aria-label={activeMood ? `${activeMood.name} titles` : 'All titles'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
  );
}
