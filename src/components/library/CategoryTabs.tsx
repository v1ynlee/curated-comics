'use client';

// ============================================================
// CategoryTabs — reading status category switcher
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/accessibility/ACCESSIBILITY_NOTES.md
// ============================================================

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { READING_STATUS_LABELS } from '@/lib/utils/constants';
import type { CategoryType } from '@/types/library';

const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'top-favorite', label: 'Favorites' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'paused', label: 'Paused' },
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'hidden-gem', label: 'Hidden Gems' },
  { value: 'guilty-pleasure', label: 'Guilty Pleasures' },
  { value: 'most-reread', label: 'Most Re-read' },
];

export function CategoryTabs() {
  const tablistId = useId();
  const { activeCategory, setCategory } = useLibraryStore();

  return (
    <div
      role="tablist"
      aria-label="Library categories"
      className="flex gap-1 overflow-x-auto pb-1 scrollbar-none"
      id={tablistId}
    >
      {CATEGORIES.map(({ value, label }) => {
        const isActive = activeCategory === value;
        const panelId = `panel-${value}`;
        const tabId = `tab-${value}`;

        return (
          <button
            key={value}
            role="tab"
            id={tabId}
            aria-selected={isActive}
            aria-controls={panelId}
            onClick={() => setCategory(value)}
            className={cn(
              'relative shrink-0 px-4 py-2 rounded-sm',
              'font-heading text-xs font-medium uppercase tracking-widest',
              'transition-colors duration-150 whitespace-nowrap',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              isActive
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {label}
            {isActive && (
              <motion.span
                layoutId="category-indicator"
                className="absolute inset-x-2 -bottom-px h-px bg-accent-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Accessible label helper for the panel
export function getCategoryLabel(category: CategoryType): string {
  if (category === 'all') return 'All titles';
  return READING_STATUS_LABELS[category] ?? category;
}
