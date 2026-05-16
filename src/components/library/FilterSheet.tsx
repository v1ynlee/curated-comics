'use client';

// ============================================================
// FilterSheet — genre + origin filter controls
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/accessibility/ACCESSIBILITY_NOTES.md
// ============================================================

import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { GENRES } from '@/lib/utils/constants';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
}

export function FilterSheet({ open, onClose }: FilterSheetProps) {
  const titleId = useId();
  const { activeGenres, toggleGenre, resetFilters } = useLibraryStore();
  const hasFilters = activeGenres.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-overlay bg-bg-deep/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed bottom-0 inset-x-0 z-modal',
              'bg-bg-surface border-t border-white/10',
              'rounded-t-lg max-h-[80vh] overflow-y-auto',
              'pb-safe',
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between py-3 mb-4">
                <h2
                  id={titleId}
                  className="font-heading text-sm font-bold uppercase tracking-widest text-text-primary"
                >
                  Filters
                </h2>
                <div className="flex items-center gap-2">
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="font-body text-xs text-accent-primary hover:text-accent-primary/80 transition-colors focus-visible:outline-accent-primary"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 text-text-tertiary hover:text-text-primary transition-colors focus-visible:outline-accent-primary rounded-sm"
                    aria-label="Close filters"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Genres */}
              <section aria-labelledby="filter-genres-label">
                <h3
                  id="filter-genres-label"
                  className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary mb-3"
                >
                  Genre
                </h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => {
                    const isActive = activeGenres.includes(genre.slug);
                    return (
                      <button
                        key={genre.slug}
                        onClick={() => toggleGenre(genre.slug)}
                        aria-pressed={isActive}
                        className={cn(
                          'transition-all duration-150',
                          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 rounded-sm',
                          isActive && 'ring-1 ring-white/20',
                        )}
                      >
                        <Tag
                          label={genre.name}
                          color={isActive ? genre.color : undefined}
                          size="sm"
                          className={cn(
                            !isActive && 'opacity-60 hover:opacity-100',
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Apply button */}
              <div className="mt-6">
                <Button
                  onClick={onClose}
                  className="w-full"
                  size="md"
                >
                  Apply Filters
                  {hasFilters && (
                    <span className="ml-2 font-data text-xs opacity-70">
                      ({activeGenres.length})
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
