import type { TierLevel } from '@/types/title';
import type { TitleFormData } from '@/types/studio';

export type CompletionStatus = 'Production Ready' | 'Good' | 'Needs Work' | 'Incomplete';

export interface TitleCompletionSignals {
  cover: boolean;
  synopsis: boolean;
  genres: boolean;
  moods: boolean;
  creators: boolean;
  readingUrls: boolean;
  review: boolean;
  tier: boolean;
  galleryAssets: boolean;
  curationEligibility: boolean;
}

export interface TitleCompletionResult {
  score: number;
  status: CompletionStatus;
  signals: TitleCompletionSignals;
  breakdown: Array<{ key: keyof TitleCompletionSignals; label: string; points: number; complete: boolean }>;
}

export interface TitleCompletionInput {
  coverSlug?: string | null;
  synopsis?: string | null;
  genresCount?: number;
  moodsCount?: number;
  creatorsCount?: number;
  readingUrlsCount?: number;
  hasReview?: boolean;
  tier?: TierLevel | string | null;
  galleryAssetsCount?: number;
  hidden?: boolean | null;
}

export interface TitleFormCompletionSeed {
  creators?: boolean;
  readingUrls?: boolean;
  galleryAssets?: boolean;
}

const WEIGHTS: Array<{ key: keyof TitleCompletionSignals; label: string; points: number }> = [
  { key: 'cover', label: 'Cover', points: 10 },
  { key: 'synopsis', label: 'Synopsis', points: 15 },
  { key: 'genres', label: 'Genres', points: 10 },
  { key: 'moods', label: 'Moods', points: 10 },
  { key: 'creators', label: 'Creators', points: 15 },
  { key: 'readingUrls', label: 'Reading URLs', points: 10 },
  { key: 'review', label: 'Review Status', points: 10 },
  { key: 'tier', label: 'Tier Assignment', points: 5 },
  { key: 'galleryAssets', label: 'Gallery Assets', points: 5 },
  { key: 'curationEligibility', label: 'Curation Eligibility', points: 10 },
];

export function completionStatus(score: number): CompletionStatus {
  if (score >= 95) return 'Production Ready';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Needs Work';
  return 'Incomplete';
}

export function completionTone(score: number) {
  if (score >= 95) return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
  if (score >= 80) return 'border-lime-400/25 bg-lime-400/10 text-lime-300';
  if (score >= 60) return 'border-amber-400/30 bg-amber-400/10 text-amber-300';
  return 'border-red-400/30 bg-red-400/10 text-red-300';
}

export function calculateTitleCompletion(input: TitleCompletionInput): TitleCompletionResult {
  const signals: TitleCompletionSignals = {
    cover: Boolean(input.coverSlug),
    synopsis: Boolean(input.synopsis?.trim()),
    genres: (input.genresCount ?? 0) > 0,
    moods: (input.moodsCount ?? 0) > 0,
    creators: (input.creatorsCount ?? 0) > 0,
    readingUrls: (input.readingUrlsCount ?? 0) > 0,
    review: Boolean(input.hasReview),
    tier: Boolean(input.tier),
    galleryAssets: (input.galleryAssetsCount ?? 0) > 0,
    curationEligibility: false,
  };

  signals.curationEligibility = !input.hidden && signals.cover && signals.synopsis && signals.genres && signals.moods && signals.creators && signals.tier;

  const breakdown = WEIGHTS.map((item) => ({ ...item, complete: signals[item.key] }));
  const score = breakdown.reduce((sum, item) => sum + (item.complete ? item.points : 0), 0);
  return { score, status: completionStatus(score), signals, breakdown };
}

export function calculateTitleFormCompletion(formData: TitleFormData, seed: TitleFormCompletionSeed = {}): TitleCompletionResult {
  const hasLegacyCreators = Boolean(formData.author?.trim() || formData.artist?.trim());
  return calculateTitleCompletion({
    coverSlug: formData.coverImageId ?? null,
    synopsis: formData.synopsis ?? null,
    genresCount: formData.genres.length,
    moodsCount: formData.moods.length,
    creatorsCount: seed.creators || hasLegacyCreators ? 1 : 0,
    readingUrlsCount: seed.readingUrls ? 1 : 0,
    hasReview: Boolean(formData.review?.trim()) && !formData.isUnreviewed,
    tier: formData.tier,
    galleryAssetsCount: seed.galleryAssets ? 1 : 0,
    hidden: formData.hidden,
  });
}
