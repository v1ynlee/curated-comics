'use client';

// ============================================================
// GenreMoodSelector — Searchable multi-select with badge display
// Integrated into the Details card for selecting genres and moods.
// Supports search filtering, popular badges, recently used items,
// and adding new genres/moods when not found.
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
// ============================================================

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Search, X, Plus } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

export interface GenreMoodSelectorProps {
  type: 'genre' | 'mood';
  available: { id: string; name: string }[];
  selected: string[];
  recentlyUsed?: string[];  // IDs of recently used items
  onToggle: (id: string) => void;
  onAddNew?: (name: string) => void;  // Callback to create new genre/mood
}

// ── Constants ─────────────────────────────────────────────────

const MAX_POPULAR_BADGES = 10;
const MAX_RECENTLY_USED = 5;

// ── Component ─────────────────────────────────────────────────

export function GenreMoodSelector({
  type,
  available,
  selected,
  recentlyUsed = [],
  onToggle,
  onAddNew,
}: GenreMoodSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTooltip, setShowAddTooltip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const label = type === 'genre' ? 'Genre' : 'Mood';
  const labelPlural = type === 'genre' ? 'Genres' : 'Moods';

  // ── Derived data ──────────────────────────────────────────────

  // Items filtered by search term (case-insensitive substring match)
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return available.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }, [available, searchTerm]);

  // Popular items: first N unselected items from available list
  const popularItems = useMemo(() => {
    return available
      .filter((item) => !selected.includes(item.id))
      .slice(0, MAX_POPULAR_BADGES);
  }, [available, selected]);

  // Recently used items (resolved from IDs)
  const recentItems = useMemo(() => {
    return recentlyUsed
      .map((id) => available.find((item) => item.id === id))
      .filter((item): item is { id: string; name: string } => item != null)
      .slice(0, MAX_RECENTLY_USED);
  }, [recentlyUsed, available]);

  // Selected items resolved to full objects
  const selectedItems = useMemo(() => {
    return selected
      .map((id) => available.find((item) => item.id === id))
      .filter((item): item is { id: string; name: string } => item != null);
  }, [selected, available]);

  // Whether the search term has no match in available items
  const searchHasNoMatch = useMemo(() => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    return !available.some((item) => item.name.toLowerCase().includes(term));
  }, [searchTerm, available]);

  // Show recently used when search is empty and nothing is selected
  const showRecentlyUsed = !searchTerm.trim() && selected.length === 0 && recentItems.length > 0;

  // Show popular badges when not searching
  const showPopular = !searchTerm.trim();

  // Show filtered results when searching
  const showFiltered = searchTerm.trim().length > 0;

  // ── Tooltip management ────────────────────────────────────────

  useEffect(() => {
    if (searchHasNoMatch && onAddNew) {
      setShowAddTooltip(true);
    } else {
      setShowAddTooltip(false);
    }
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [searchHasNoMatch, onAddNew]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleAddNew = useCallback(() => {
    if (onAddNew && searchTerm.trim()) {
      onAddNew(searchTerm.trim());
      setSearchTerm('');
      setShowAddTooltip(false);
    }
  }, [onAddNew, searchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchHasNoMatch && onAddNew) {
      e.preventDefault();
      handleAddNew();
    }
  }, [searchHasNoMatch, onAddNew, handleAddNew]);

  // ── Render helpers ────────────────────────────────────────────

  const renderBadge = (item: { id: string; name: string }, removable: boolean) => (
    <button
      key={item.id}
      type="button"
      onClick={() => onToggle(item.id)}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        'transition-colors duration-150',
        removable
          ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/30'
          : 'bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10 hover:text-text-primary'
      )}
      aria-label={removable ? `Remove ${item.name}` : `Select ${item.name}`}
    >
      <span>{item.name}</span>
      {removable && (
        <X className="w-3 h-3 shrink-0" aria-hidden="true" />
      )}
    </button>
  );

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Section label */}
      <label
        htmlFor={`${type}-search`}
        className="block font-heading text-xs uppercase tracking-wider text-text-secondary"
      >
        {labelPlural}
      </label>

      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={`${type}-search`}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          placeholder={`Search ${labelPlural.toLowerCase()}...`}
          className={cn(
            'w-full pl-9 pr-3 py-2.5 rounded-lg',
            'bg-bg-deep/60 border border-white/10',
            'font-body text-sm text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
            'transition-colors duration-150'
          )}
          aria-label={`Search ${labelPlural.toLowerCase()}`}
        />
      </div>

      {/* Add new tooltip — shown when search term not found */}
      {showAddTooltip && (
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-accent-primary/10 border border-accent-primary/20',
            'text-xs text-accent-primary'
          )}
          role="status"
          aria-live="polite"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>
            &ldquo;{searchTerm.trim()}&rdquo; not found.
          </span>
          <button
            type="button"
            onClick={handleAddNew}
            className={cn(
              'ml-auto px-2 py-0.5 rounded text-xs font-medium',
              'bg-accent-primary/20 hover:bg-accent-primary/30',
              'transition-colors duration-150'
            )}
          >
            Add as new {label.toLowerCase()}
          </button>
        </div>
      )}

      {/* Selected items as badges with ✕ remove */}
      {selectedItems.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-text-tertiary font-medium">Selected</span>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label={`Selected ${labelPlural.toLowerCase()}`}>
            {selectedItems.map((item) => renderBadge(item, true))}
          </div>
        </div>
      )}

      {/* Filtered results when searching */}
      {showFiltered && filteredItems.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-text-tertiary font-medium">Results</span>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label={`${label} search results`}>
            {filteredItems
              .filter((item) => !selected.includes(item.id))
              .slice(0, MAX_POPULAR_BADGES)
              .map((item) => renderBadge(item, false))}
          </div>
        </div>
      )}

      {/* Recently used — shown when search empty and no selection */}
      {showRecentlyUsed && (
        <div className="space-y-1.5">
          <span className="text-xs text-text-tertiary font-medium">Recently used</span>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label={`Recently used ${labelPlural.toLowerCase()}`}>
            {recentItems.map((item) => renderBadge(item, false))}
          </div>
        </div>
      )}

      {/* Popular badges — shown when not searching */}
      {showPopular && popularItems.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-text-tertiary font-medium">Popular</span>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label={`Popular ${labelPlural.toLowerCase()}`}>
            {popularItems.map((item) => renderBadge(item, false))}
          </div>
        </div>
      )}
    </div>
  );
}
