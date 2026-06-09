import type { PublicationState } from '@/types/article';
import type { FeaturedFilter, SortKey } from './article-dashboard-types';

export const PAGE_SIZE = 10;

export const STATUS_OPTIONS: { value: PublicationState | 'all'; label: string }[] = [
  { value: 'all', label: 'All states' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export const FEATURED_OPTIONS: { value: FeaturedFilter; label: string }[] = [
  { value: 'all', label: 'All visibility' },
  { value: 'featured', label: 'Featured only' },
  { value: 'standard', label: 'Standard only' },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'created-desc', label: 'Recently created' },
  { value: 'publish-desc', label: 'Publish date' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'words-desc', label: 'Word count' },
];

export const STATE_STYLES: Record<PublicationState, string> = {
  draft: 'border-white/10 bg-white/5 text-text-secondary',
  scheduled: 'border-semantic-warning/30 bg-semantic-warning/10 text-semantic-warning',
  published: 'border-semantic-success/30 bg-semantic-success/10 text-semantic-success',
  archived: 'border-semantic-danger/30 bg-semantic-danger/10 text-semantic-danger',
};
