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
import { Search, X, Ghost, Sparkles } from 'lucide-react';
import { TitleCard } from '@/components/library/TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { useTitles } from '@/hooks/useTitles';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils/cn';
import { GradientText } from '@/components/ui/GradientText';

const QUICK_SEARCHES = ['Action', 'Romance', 'Murim', 'System', 'Villainess'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
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
    <div className="container-content pt-12 md:pt-20 pb-24 min-h-[85vh] flex flex-col">
      
      {/* ── Header & Input Section ───────────────────────────── */}
      <motion.div
        layout
        className="flex flex-col items-center text-center w-full max-w-3xl mx-auto mb-10 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-text-tertiary mb-3 flex items-center gap-2">
          <Sparkles size={12} className="text-accent-primary" />
          Archive Database
        </span>
        
        <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-bold text-text-primary leading-[1.1] mb-8 tracking-tight">
          Find a <GradientText>Title</GradientText>
        </h1>

        {/* Cinematic Search Input */}
        <div className="relative w-full group">
          {/* Ambient Glow (Active on Focus) */}
          <div className={cn(
            "absolute inset-0 bg-accent-primary/20 blur-3xl rounded-full transition-opacity duration-700 pointer-events-none -z-10",
            isFocused ? "opacity-100" : "opacity-0"
          )} />

          <motion.div
            className="relative"
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <Search 
              size={24} 
              className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none",
                isFocused ? "text-accent-primary" : "text-text-tertiary"
              )} 
              aria-hidden="true" 
            />
            
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search by title, genre, or vibe..."
              autoFocus
              className={cn(
                'w-full pl-16 pr-14 py-5 rounded-full',
                'bg-text-primary/5 backdrop-blur-md border border-text-primary/10 shadow-sm',
                'font-body text-lg md:text-xl text-text-primary placeholder:text-text-tertiary/70',
                'transition-all duration-300',
                'hover:bg-text-primary/10 hover:border-text-primary/20',
                'focus:outline-none focus:bg-text-primary/10 focus:border-accent-primary/50 focus:shadow-lg',
              )}
              aria-label="Search titles"
              aria-controls="search-results"
            />

            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setQuery('');
                    setIsFocused(true);
                  }}
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                    "bg-text-primary/10 text-text-secondary hover:text-text-primary hover:bg-text-primary/20",
                    "transition-all duration-200 focus-visible:outline-accent-primary"
                  )}
                  aria-label="Clear search"
                >
                  <X size={18} aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Dynamic Content Area ─────────────────────────────── */}
      <div id="search-results" aria-live="polite" aria-atomic="false" className="flex-1">
        
        {/* Result Count Indicator */}
        <AnimatePresence>
          {hasQuery && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 mb-8 pb-4 border-b border-text-primary/5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse" />
              <p className="font-body text-sm font-medium text-text-secondary">
                {total > 0
                  ? `Found ${total} result${total !== 1 ? 's' : ''} for "${debouncedQuery}"`
                  : `0 results for "${debouncedQuery}"`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          
          {/* State 1: Loading Skeleton */}
          {isLoading && hasQuery ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TitleCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          
          /* State 2: Idle (No Query) */
          ) : !hasQuery ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-6 py-12 text-center"
            >
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Quick Searches
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                {QUICK_SEARCHES.map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => setQuery(vibe)}
                    className={cn(
                      "px-4 py-2 rounded-full font-body text-sm font-medium text-text-secondary",
                      "bg-text-primary/5 border border-text-primary/10",
                      "transition-all duration-200 hover:bg-text-primary/10 hover:text-text-primary hover:scale-105 hover:border-accent-primary/30"
                    )}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </motion.div>
          
          /* State 3: Empty Results */
          ) : titles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-5 py-24 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-5 rounded-full bg-text-primary/5"
              >
                <Ghost size={48} className="text-text-tertiary opacity-50" aria-hidden="true" />
              </motion.div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xl font-semibold text-text-primary">
                  Lost in the Void
                </h3>
                <p className="font-body text-text-secondary max-w-sm">
                  I couldn&apos;t find any titles matching <span className="text-text-primary font-medium">&quot;{debouncedQuery}&quot;</span>. Try adjusting your keywords or exploring by vibe.
                </p>
              </div>
            </motion.div>
          
          /* State 4: Results Found */
          ) : (
            <motion.ul
              key={debouncedQuery}
              role="list"
              aria-label="Search results"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {titles.map((title, i) => (
                <motion.li 
                  key={title.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <TitleCard title={title} index={i} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}