'use client';

// ============================================================
// TitleFilters — Client-side filter controls for the Titles page.
// Updates URL search params via router.replace() for instant
// filtering without full page reloads. Search is debounced.
// ============================================================

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel, Origin, SeriesStatus, ReadingStatus } from '@/types/title';

// ── Filter Options ──────────────────────────────────────────────

const TIER_OPTIONS: TierLevel[] = ['SSS+', 'S', 'A', 'B', 'C', 'D', 'F'];
const STATUS_OPTIONS: SeriesStatus[] = ['ongoing', 'completed', 'hiatus', 'cancelled'];
const READING_OPTIONS: ReadingStatus[] = [
  'reading', 'completed', 'dropped', 'paused', 'wishlist',
  'hidden-gem', 'guilty-pleasure', 'top-favorite', 'most-reread',
];
const ORIGIN_OPTIONS: { value: Origin; label: string }[] = [
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhua', label: 'Manhua' },
];

// ── Component ───────────────────────────────────────────────────

export function TitleFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read current filter values from URL
  const currentQuery = searchParams.get('q') ?? '';
  const currentTier = searchParams.get('tier') ?? '';
  const currentStatus = searchParams.get('status') ?? '';
  const currentReading = searchParams.get('reading') ?? '';
  const currentOrigin = searchParams.get('origin') ?? '';

  const hasFilters = !!(currentQuery || currentTier || currentStatus || currentReading || currentOrigin);

  // Local search input state for debouncing
  const [searchValue, setSearchValue] = useState(currentQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local search state when URL changes externally
  useEffect(() => {
    setSearchValue(currentQuery);
  }, [currentQuery]);

  // Update URL params without full page reload
  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const newUrl = `${pathname}?${params.toString()}`;
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [router, pathname, searchParams, startTransition],
  );

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateParams('q', value);
      }, 300);
    },
    [updateParams],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    setSearchValue('');
  }, [router, pathname, startTransition]);

  // Select change handler
  const handleSelectChange = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateParams(key, e.target.value);
    },
    [updateParams],
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-3 mb-8 p-4 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        isPending && 'opacity-70 pointer-events-none',
      )}
      role="search"
      aria-label="Filter titles"
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
          placeholder="Search titles..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={cn(
            'w-full pl-9 pr-4 py-3 rounded-lg min-h-[44px]',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
            'transition-colors duration-150',
          )}
          aria-label="Search titles by name"
        />
        {isPending && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-accent-primary/30 border-t-accent-primary"
            aria-label="Loading results"
          />
        )}
      </div>

      {/* Filter row — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:gap-3">
        {/* Tier filter */}
        <select
          value={currentTier}
          onChange={handleSelectChange('tier')}
          className={cn(
            'min-h-[44px] px-3 py-2.5 rounded-lg shrink-0',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary',
            'focus:outline-none focus:border-accent-primary/50',
            'transition-colors duration-150',
          )}
          aria-label="Filter by tier"
        >
          <option value="">All Tiers</option>
          {TIER_OPTIONS.map((tier) => (
            <option key={tier} value={tier}>
              {tier} — {TIER_CONFIG[tier].label}
            </option>
          ))}
        </select>

        {/* Series status filter */}
        <select
          value={currentStatus}
          onChange={handleSelectChange('status')}
          className={cn(
            'min-h-[44px] px-3 py-2.5 rounded-lg shrink-0',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary',
            'focus:outline-none focus:border-accent-primary/50',
            'transition-colors duration-150',
          )}
          aria-label="Filter by series status"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        {/* Reading status filter */}
        <select
          value={currentReading}
          onChange={handleSelectChange('reading')}
          className={cn(
            'min-h-[44px] px-3 py-2.5 rounded-lg shrink-0',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary',
            'focus:outline-none focus:border-accent-primary/50',
            'transition-colors duration-150',
          )}
          aria-label="Filter by reading status"
        >
          <option value="">All Reading</option>
          {READING_OPTIONS.map((reading) => (
            <option key={reading} value={reading}>
              {reading
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')}
            </option>
          ))}
        </select>

        {/* Origin filter */}
        <select
          value={currentOrigin}
          onChange={handleSelectChange('origin')}
          className={cn(
            'min-h-[44px] px-3 py-2.5 rounded-lg shrink-0',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary',
            'focus:outline-none focus:border-accent-primary/50',
            'transition-colors duration-150',
          )}
          aria-label="Filter by origin"
        >
          <option value="">All Origins</option>
          {ORIGIN_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Clear filters button */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={cn(
              'min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-lg shrink-0',
              'bg-white/5 text-text-secondary font-heading text-sm',
              'hover:bg-white/10 hover:text-text-primary transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            )}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
