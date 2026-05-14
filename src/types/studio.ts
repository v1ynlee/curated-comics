// ============================================================
// Studio CMS Types
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import type { TierLevel } from './title';
import type { PublicationState } from './article';

export type { TierLevel } from './title';

export interface StudioError {
  code: string;
  message: string;
  field?: string;
}

export interface TitleFormData {
  englishTitle: string;
  originalTitle?: string;
  alternativeTitles?: string[];
  origin: string;
  seriesStatus: string;
  readingStatus: string;
  chaptersRead?: number;
  totalChapters?: number;
  startedDate?: string;
  completedDate?: string;
  lastReadDate?: string;
  tier: TierLevel;
  synopsis?: string;
  vibeCheck?: string;
  quotableLines?: string[];
  review?: string;
  featured: boolean;
  hidden: boolean;
  genres: string[];
  moods: string[];
  coverImageId?: string;
  bannerImageId?: string;
}

export interface StudioArticleRow {
  id: string;
  slug: string;
  title: string;
  publicationState: PublicationState;
  publishDate: string | null;
  scheduledDate: string | null;
  categoryName: string | null;
  wordCount: number;
  readingTimeMinutes: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTitleRow {
  id: string;
  slug: string;
  englishTitle: string;
  tier: TierLevel;
  origin: string;
  seriesStatus: string;
  featured: boolean;
  hidden: boolean;
  coverUrl: string | null;
}
