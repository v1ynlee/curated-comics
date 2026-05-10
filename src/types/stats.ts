// ============================================================
// Statistics Types
// Source of truth: docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

import type { TierLevel, ReadingStatus } from './title';

export interface ReadingStatistics {
  // Volume
  totalTitles: number;
  totalChaptersRead: number;
  estimatedReadingHours: number; // chapters × 4 minutes average

  // Distribution
  genreDistribution: Record<string, number>;
  moodDistribution: Record<string, number>;
  originDistribution: Record<string, number>;
  tierDistribution: Partial<Record<TierLevel, number>>;
  statusDistribution: Partial<Record<ReadingStatus, number>>;

  // Timeline
  monthlyChapters: { month: string; count: number }[];
  yearlyTitles: { year: number; count: number }[];
  readingStreak: { current: number; longest: number };

  // Averages
  averageRating: number;
  averageChaptersPerTitle: number;
  completionRate: number; // completed / (completed + dropped) × 100
}
