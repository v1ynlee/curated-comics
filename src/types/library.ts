// ============================================================
// Library Filter & Sort Types
// Source of truth: docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

import type { ReadingStatus, TierLevel, Origin } from './title';

export interface LibraryFilters {
  status?: ReadingStatus[];
  genres?: string[];
  moods?: string[];
  origin?: Origin[];
  tier?: TierLevel[];
  ratingMin?: number;
  ratingMax?: number;
  chaptersMin?: number;
  chaptersMax?: number;
  hasReview?: boolean;
  featured?: boolean;
  search?: string;
}

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'rating-high'
  | 'rating-low'
  | 'chapters-high'
  | 'chapters-low'
  | 'recent-read'
  | 'date-added'
  | 'date-completed'
  | 'reread-count';

export type ViewMode = 'grid' | 'list' | 'cinematic';

export type CategoryType = ReadingStatus | 'all';
