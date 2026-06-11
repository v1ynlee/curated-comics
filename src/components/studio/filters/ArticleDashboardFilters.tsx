'use client';

import { Search, X } from 'lucide-react';
import { StudioSelect } from '@/components/studio/shared/StudioSelect';
import type { EditorialState, PublicationState } from '@/types/article';
import type { FeaturedFilter, SortKey } from '@/components/studio/articles/article-dashboard-types';
import { FEATURED_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS, WORKFLOW_OPTIONS } from '@/components/studio/articles/article-dashboard-constants';

interface ArticleDashboardFiltersProps {
  query: string;
  stateFilter: PublicationState | 'all';
  workflowFilter: EditorialState | 'all';
  categoryFilter: string;
  tagFilter: string;
  featuredFilter: FeaturedFilter;
  sortKey: SortKey;
  categoryOptions: { value: string; label: string }[];
  tagOptions: { value: string; label: string }[];
  shownCount: number;
  totalCount: number;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onStateChange: (value: PublicationState | 'all') => void;
  onWorkflowChange: (value: EditorialState | 'all') => void;
  onCategoryChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onFeaturedChange: (value: FeaturedFilter) => void;
  onSortChange: (value: SortKey) => void;
  onClearFilters: () => void;
}

export function ArticleDashboardFilters({
  query,
  stateFilter,
  workflowFilter,
  categoryFilter,
  tagFilter,
  featuredFilter,
  sortKey,
  categoryOptions,
  tagOptions,
  shownCount,
  totalCount,
  hasFilters,
  onQueryChange,
  onStateChange,
  onWorkflowChange,
  onCategoryChange,
  onTagChange,
  onFeaturedChange,
  onSortChange,
  onClearFilters,
}: ArticleDashboardFiltersProps) {
  return (
    <div className="mb-4 rounded-lg border border-white/10 bg-bg-surface/40 p-3" role="search" aria-label="Filter articles">
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_repeat(6,minmax(140px,180px))]">
        <div className="relative min-w-0">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <input
            type="text"
            role="searchbox"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search title, category, tag"
            className="studio-input studio-search-input min-h-[42px] py-2 text-sm"
            aria-label="Search articles"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
              aria-label="Clear article search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <StudioSelect label="Publication" value={stateFilter} options={STATUS_OPTIONS} prefixLabel hideLabel onChange={onStateChange} buttonClassName="min-h-[42px]" />
        <StudioSelect label="Workflow" value={workflowFilter} options={WORKFLOW_OPTIONS} prefixLabel hideLabel onChange={onWorkflowChange} buttonClassName="min-h-[42px]" />
        <StudioSelect label="Category" value={categoryFilter} options={categoryOptions} prefixLabel hideLabel onChange={onCategoryChange} buttonClassName="min-h-[42px]" />
        <StudioSelect label="Tag" value={tagFilter} options={tagOptions} prefixLabel hideLabel onChange={onTagChange} buttonClassName="min-h-[42px]" />
        <StudioSelect label="Pin" value={featuredFilter} options={FEATURED_OPTIONS} prefixLabel hideLabel onChange={onFeaturedChange} buttonClassName="min-h-[42px]" />
        <StudioSelect label="Sort" value={sortKey} options={SORT_OPTIONS} prefixLabel hideLabel onChange={onSortChange} buttonClassName="min-h-[42px]" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-tertiary">
        <span aria-live="polite">
          {shownCount} of {totalCount} article{totalCount === 1 ? '' : 's'} shown
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-sm text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
