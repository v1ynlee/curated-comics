// ============================================================
// Studio CMS Types
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import type { TierLevel } from './title';
import type { EditorialState, PublicationState } from './article';

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
  author?: string;
  artist?: string;
  releaseDate?: string;
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
  reviewHtml?: string;
  isUnreviewed?: boolean;
  featured: boolean;
  hidden: boolean;
  genres: string[];
  moods: string[];
  coverImageId?: string;
  bannerImageId?: string;
}

export type AutofillConfidence = 'high' | 'medium' | 'low';

export type AutofillPayloadField =
  | 'englishTitle'
  | 'originalTitle'
  | 'alternativeTitles'
  | 'origin'
  | 'seriesStatus'
  | 'readingStatus'
  | 'author'
  | 'artist'
  | 'releaseDate'
  | 'completedDate'
  | 'synopsis'
  | 'vibeCheck'
  | 'genres'
  | 'moods';

export interface AutofillFieldIntelligence {
  confidence: AutofillConfidence;
  source?: string;
  sourceNote?: string;
  rationale?: string;
}

export type AutofillFieldIntelligenceMap = Partial<Record<AutofillPayloadField, AutofillFieldIntelligence>>;

export interface GeminiTitleResponse {
  title: string | null;
  original_title: {
    jp: string | null;
    kr: string | null;
    cn: string | null;
  } | null;
  alternative_titles: string[];
  format: 'manga' | 'manhwa' | 'manhua' | 'unknown';
  status: 'ongoing' | 'hiatus' | 'cancelled' | 'completed' | 'unknown';
  release_date: string | null;
  completed_date: string | null;
  authors: string[];
  artists: string[];
  synopsis: string | null;
  vibes: string[];
  genres: string[];
  moods: string[];
  match_confidence: AutofillConfidence;
  candidate_count: number | null;
  field_intelligence: AutofillFieldIntelligenceMap;
}

export interface AutofillPayload {
  englishTitle?: string;
  originalTitle?: string;
  alternativeTitles?: string[];
  origin?: string;
  seriesStatus?: string;
  readingStatus?: string;
  author?: string;
  artist?: string;
  releaseDate?: string;
  completedDate?: string;
  synopsis?: string;
  vibeCheck?: string;
  genres?: string[];
  moods?: string[];
  fieldIntelligence?: AutofillFieldIntelligenceMap;
}

export interface DraftData {
  savedAt: string;
  title: string;
  details: TitleFormData;
  progress: Pick<TitleFormData, 'chaptersRead' | 'totalChapters' | 'startedDate' | 'completedDate' | 'lastReadDate'>;
  reviews: Pick<TitleFormData, 'review' | 'reviewHtml' | 'isUnreviewed'>;
  settings: Pick<TitleFormData, 'featured' | 'hidden'>;
  editingState: {
    mode: 'create' | 'edit';
    dirty: boolean;
  };
}

export interface UnsavedChangesState {
  isDirty: boolean;
  pendingHref: string | null;
  showWarning: boolean;
}

export interface StudioArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  publicationState: PublicationState;
  publishDate: string | null;
  scheduledDate: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  tagNames: string[];
  tagSlugs: string[];
  editorialState: EditorialState;
  featuredImageUrl: string | null;
  featuredImageColor: string | null;
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
