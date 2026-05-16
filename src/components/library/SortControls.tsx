'use client';

// ============================================================
// SortControls — custom dropdown sort selector
// Uses Radix UI DropdownMenu for a modern, styled appearance.
// ============================================================

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { SortOption } from '@/types/library';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent-read',   label: 'Recently Read' },
  { value: 'rating-high',   label: 'Highest Rated' },
  { value: 'date-added',    label: 'Date Added' },
  { value: 'title-asc',     label: 'Title A–Z' },
  { value: 'chapters-high', label: 'Most Chapters' },
];

export function SortControls() {
  const { sortBy, setSortBy } = useLibraryStore();
  const activeLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-sm',
            'font-heading text-xs uppercase tracking-widest',
            'border border-white/10 text-text-secondary',
            'hover:border-white/20 hover:text-text-primary',
            'transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            'data-[state=open]:border-accent-primary/40 data-[state=open]:text-text-primary',
          )}
          aria-label={`Sort by: ${activeLabel}`}
        >
          <span>{activeLabel}</span>
          <ChevronDown size={12} aria-hidden="true" className="opacity-60" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            'z-modal min-w-[160px] rounded-sm overflow-hidden',
            'bg-bg-surface border border-white/10',
            'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
            'animate-in fade-in-0 zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
          )}
        >
          {SORT_OPTIONS.map(({ value, label }) => {
            const isActive = sortBy === value;
            return (
              <DropdownMenu.Item
                key={value}
                onSelect={() => setSortBy(value)}
                className={cn(
                  'flex items-center justify-between gap-4',
                  'px-3 py-2.5 cursor-pointer outline-none',
                  'font-body text-xs transition-colors duration-100',
                  isActive
                    ? 'text-accent-primary bg-accent-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
                )}
              >
                <span>{label}</span>
                {isActive && <Check size={12} aria-hidden="true" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
