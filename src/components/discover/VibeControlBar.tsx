'use client';

// ============================================================
// VibeControlBar — filter dropdown + floating-label search
//
// Sort: custom dropdown (SlidersHorizontal icon + label + chevron)
//   - Solid opaque panel (no bleed-through)
//   - Framer Motion scale+fade entrance
//   - Outside click / Escape closes it
//
// Search: always-visible, floating label animation
//   - Default: Search icon inside field (left)
//   - Focused / has value: icon floats above the field border
//     as a small label, field left-padding collapses
//   - Purple border glow when active
//   - Rectangular input (rounded-md)
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { VibeSortOption } from '@/hooks/useVibeDiscovery';

interface VibeControlBarProps {
  totalVibes: number;
  totalTitles: number;
  sortBy: VibeSortOption;
  onSortChange: (sort: VibeSortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

const SORT_OPTIONS: { value: VibeSortOption; label: string; description: string }[] = [
  { value: 'popular',          label: 'Popular',      description: 'By popularity score'     },
  { value: 'trending',         label: 'Trending',     description: 'Rising this week'        },
  { value: 'recently-updated', label: 'Recent',       description: 'Latest additions'        },
  { value: 'most-titles',      label: 'Most Titles',  description: 'Largest collections'     },
  { value: 'newest',           label: 'Newest',       description: 'Recently created vibes'  },
  { value: 'oldest',           label: 'Oldest',       description: 'Established vibes first' },
];

const PURPLE = '#8b5cf6';

export function VibeControlBar({
  totalVibes,
  totalTitles,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  className,
}: VibeControlBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort';
  const searchActive = searchFocused || searchQuery.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Escape closes dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dropdownOpen]);

  const handleSortSelect = useCallback((value: VibeSortOption) => {
    onSortChange(value);
    setDropdownOpen(false);
  }, [onSortChange]);

  const clearSearch = useCallback(() => {
    onSearchChange('');
    inputRef.current?.focus();
  }, [onSearchChange]);

  return (
    <div className={cn('flex items-center gap-3', className)}>

      {/* ── Sort dropdown ────────────────────────────────────── */}
      <div ref={dropdownRef} className="relative flex-shrink-0">

        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-label={`Sort by: ${currentLabel}`}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5',
            // No border — active state indicated by bg tint only
            'rounded-md',
            'text-[11px] font-heading font-semibold',
            'transition-all duration-200 focus-visible:outline-none',
            dropdownOpen
              ? 'bg-[rgba(139,92,246,0.12)] text-text-primary'
              : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-card',
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          <span>{currentLabel}</span>
          <svg
            className={cn(
              'w-3 h-3 text-text-muted flex-shrink-0 transition-transform duration-200',
              dropdownOpen && 'rotate-180',
            )}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dropdown panel — solid opaque background */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              role="listbox"
              aria-label="Sort options"
              className={cn(
                'absolute top-full left-0 mt-2 z-[200] w-52 py-1 rounded-lg overflow-hidden',
                // Theme-aware surface — no border line, elevation via shadow only
                'bg-surface-elevated',
              )}
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(139,92,246,0.12)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {SORT_OPTIONS.map(({ value, label, description }, i) => {
                const isSelected = sortBy === value;
                return (
                  <button
                    key={value}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSortSelect(value)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-3.5 py-2.5',
                      'text-left transition-colors duration-150 focus-visible:outline-none',
                      // Use semantic text colors — works in both light and dark theme
                      isSelected
                        ? 'text-[#8b5cf6] bg-[rgba(139,92,246,0.08)]'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-card',
                    )}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[11px] font-heading font-semibold leading-none">
                        {label}
                      </span>
                      {/* description: text-text-muted switches automatically with theme */}
                      <span className="text-[9px] font-body leading-none mt-0.5 text-text-muted">
                        {description}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3 h-3 flex-shrink-0" style={{ color: PURPLE }} aria-hidden />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Search — always visible, floating label ───────────── */}
      {/*                                                          */}
      {/* Animation:                                              */}
      {/*   Default: Search icon sits inside the field (left)     */}
      {/*   Active:  icon + "Search" label float above the field  */}
      {/*            border and the left padding collapses          */}
      <div className="relative flex-1 min-w-0 max-w-[220px]">

        {/* Floating label — animates above the field when active */}
        <AnimatePresence>
          {searchActive && (
            <motion.label
              htmlFor="vibe-search"
              className="absolute -top-5 left-0 flex items-center gap-1 pointer-events-none"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Search className="w-2.5 h-2.5" style={{ color: PURPLE }} aria-hidden />
              <span
                className="text-[9px] font-heading font-bold tracking-[0.15em] uppercase leading-none"
                style={{ color: PURPLE }}
              >
                Search
              </span>
            </motion.label>
          )}
        </AnimatePresence>

        {/* Input wrapper */}
        <div className="relative flex items-center">

          {/* Search icon inside field — visible only when NOT active */}
          <AnimatePresence>
            {!searchActive && (
              <motion.div
                className="absolute left-2.5 pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                aria-hidden
              >
                <Search className="w-3.5 h-3.5 text-text-muted" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.input
            id="vibe-search"
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={searchActive ? 'Type to filter…' : 'Filter vibes…'}
            aria-label="Filter vibes by name"
            animate={{
              paddingLeft: searchActive ? 10 : 32, // collapse left padding when icon floats out
            }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              'w-full py-1.5 pr-7 text-[11px]',
              'rounded-md bg-surface-elevated',
              'text-text-primary placeholder:text-text-muted',
              'focus:outline-none transition-shadow duration-200',
            )}
            style={{
              border: searchActive
                ? `1px solid ${PURPLE}88`
                : '1px solid rgba(255,255,255,0.10)',
              boxShadow: searchActive
                ? `0 0 0 3px ${PURPLE}18`
                : 'none',
            }}
          />

          {/* Clear button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2 text-text-muted hover:text-text-primary transition-colors"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <span
        className="font-data text-[10px] text-text-muted whitespace-nowrap hidden sm:inline ml-auto"
        aria-label={`${totalVibes} vibes, ${totalTitles} total titles`}
      >
        {totalVibes} vibes · {totalTitles.toLocaleString()} titles
      </span>
    </div>
  );
}
