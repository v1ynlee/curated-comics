// ============================================================
// Title & Related Types
// Source of truth: docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

export type Origin = 'manhwa' | 'manhua' | 'manga';

export type SeriesStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

export type ReadingStatus =
  | 'reading'
  | 'completed'
  | 'dropped'
  | 'paused'
  | 'wishlist'
  | 'hidden-gem'
  | 'guilty-pleasure'
  | 'top-favorite'
  | 'most-reread';

export type TierLevel = 'SSS+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type ExternalPlatform =
  | 'webtoon'
  | 'kakaopage'
  | 'naver'
  | 'tapas'
  | 'mangadex'
  | 'tappytoon'
  | 'lezhin'
  | 'official'
  | 'other';

export interface TitleRatings {
  overall: number;   // 1–10, half-point precision
  emotional: number;
  art: number;
  story: number;
  pacing: number;
  ending?: number;   // Only for completed titles
}

export interface Review {
  id: string;
  titleId: string;
  body: string;              // Markdown-formatted
  tldr?: string;
  whatILoved?: string;
  whatIHated?: string;
  emotionalDamage?: string;
  wouldRecommendTo?: string;
  hasSpoilers: boolean;
  spoilerSections?: string[];
  writtenDate: string;       // ISO date string
  lastEdited?: string;
  wordCount: number;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface Mood {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji?: string;
  atmosphere: MoodAtmosphere;
}

export interface MoodAtmosphere {
  gradient: string[];
  particleColor?: string;
  accentColor: string;
  ambientAnimation?: string;
}

// ── Vibe Discovery ────────────────────────────────────────────

export type VibeBadge = 'NEW' | 'TRENDING' | 'PEAK' | 'CURSED';

export interface CoverPreview {
  slug: string;
  dominantColor: string;
}

/**
 * Enriched mood with editorial metadata, derived stats from
 * mood_discovery_stats view, and collage cover selection.
 */
export interface EnrichedMood extends Mood {
  // Editorial columns (from moods table)
  badge: VibeBadge | null;
  featuredPriority: number;
  featuredSlot: string | null;
  featuredUntil: string | null;
  popularityScore: number;
  editorNote: string | null;
  atmosphereConfig: Record<string, unknown>;
  // Derived — computed from mood_discovery_stats view
  titleCount: number;
  lastTitleAddedAt: string | null;
  titlesAddedThisMonth: number;
  // Collage
  collageCovers: CoverPreview[];
  isManualCollage: boolean; // true = from mood_collage_covers, false = auto fallback
}

export interface ExternalLink {
  platform: ExternalPlatform;
  url: string;
  label?: string;
}

export interface ImageAsset {
  slug: string;
  alt: string;
  blurDataURL: string;
  dominantColor: string;
  aspectRatio: number;
  sizes: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface Title {
  // Identity
  id: string;
  slug: string;
  titleEnglish: string;
  titleOriginal?: string;
  titleAlternative?: string[];

  // Classification
  origin: Origin;
  status: SeriesStatus;

  // Reading Status
  readingStatus: ReadingStatus;
  chaptersRead: number;
  totalChapters?: number;
  startedDate?: string;
  completedDate?: string;
  lastReadDate: string;
  rereadCount: number;

  // Categorization
  genres: Genre[];
  moods: Mood[];
  tags: string[];
  tier?: TierLevel;

  // Ratings
  ratings?: TitleRatings;

  // Content
  synopsis?: string;
  review?: Review;
  vibeCheck?: string;
  quotableLines?: string[];

  // Creator
  author?: string;
  artist?: string;

  // Media
  coverImage?: ImageAsset;
  bannerImage?: ImageAsset;

  // External
  externalLinks: ExternalLink[];

  // Meta
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  hidden: boolean;
}

// ── Tier config ──────────────────────────────────────────────

export interface TierConfig {
  level: TierLevel;
  label: string;
  description: string;
  color: string;
  glowColor: string;
  textEffect: 'glow' | 'gradient' | 'normal';
}

export const TIER_CONFIG: Record<TierLevel, TierConfig> = {
  'SSS+': {
    level: 'SSS+',
    label: 'Transcendent',
    description: 'Changed my brain chemistry',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    textEffect: 'glow',
  },
  S: {
    level: 'S',
    label: 'Peak Fiction',
    description: 'Masterpiece, no notes',
    color: '#E040FB',
    glowColor: 'rgba(224, 64, 251, 0.4)',
    textEffect: 'gradient',
  },
  A: {
    level: 'A',
    label: 'Excellent',
    description: 'Highly recommended',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    textEffect: 'gradient',
  },
  B: {
    level: 'B',
    label: 'Good',
    description: 'Enjoyable, solid read',
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    textEffect: 'normal',
  },
  C: {
    level: 'C',
    label: 'Generic But Addictive',
    description: 'Mid but readable',
    color: '#6B7280',
    glowColor: 'rgba(107, 114, 128, 0.3)',
    textEffect: 'normal',
  },
  D: {
    level: 'D',
    label: 'Mid',
    description: 'Forgettable',
    color: '#4B5563',
    glowColor: 'rgba(75, 85, 99, 0.2)',
    textEffect: 'normal',
  },
  F: {
    level: 'F',
    label: 'Trash But I Love It',
    description: 'So bad it\'s good',
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    textEffect: 'normal',
  },
};
