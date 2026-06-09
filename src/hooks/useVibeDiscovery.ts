'use client';

// ============================================================
// useVibeDiscovery — TanStack Query hook for enriched mood data
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchVibeDiscoveryData } from '@/services/public/vibeDiscovery';
import type { EnrichedMood } from '@/types/title';

export type VibeSortOption =
  | 'popular'           // popularity_score DESC
  | 'recently-updated'  // lastTitleAddedAt DESC
  | 'most-titles'       // titleCount DESC
  | 'trending'          // badge = TRENDING or PEAK first, then popular
  | 'newest'            // sort_order ASC (original editorial order, newest vibes last)
  | 'oldest';           // sort_order ASC (original editorial order)

export const vibeDiscoveryKeys = {
  all: ['vibeDiscovery'] as const,
};

function sortMoods(moods: EnrichedMood[], sortBy: VibeSortOption): EnrichedMood[] {
  const copy = [...moods];

  switch (sortBy) {
    case 'popular':
      return copy.sort((a, b) => b.popularityScore - a.popularityScore);

    case 'recently-updated':
      return copy.sort((a, b) => {
        if (!a.lastTitleAddedAt && !b.lastTitleAddedAt) return 0;
        if (!a.lastTitleAddedAt) return 1;
        if (!b.lastTitleAddedAt) return -1;
        return new Date(b.lastTitleAddedAt).getTime() - new Date(a.lastTitleAddedAt).getTime();
      });

    case 'most-titles':
      return copy.sort((a, b) => b.titleCount - a.titleCount);

    case 'trending': {
      const badgeRank: Record<string, number> = { TRENDING: 2, PEAK: 1 };
      return copy.sort((a, b) => {
        const rankA = a.badge ? (badgeRank[a.badge] ?? 0) : 0;
        const rankB = b.badge ? (badgeRank[b.badge] ?? 0) : 0;
        if (rankB !== rankA) return rankB - rankA;
        return b.popularityScore - a.popularityScore;
      });
    }

    case 'newest':
      // Featured hero first, then by sort_order descending (higher number = newer)
      return copy.sort((a, b) => {
        if (a.featuredPriority !== b.featuredPriority) return b.featuredPriority - a.featuredPriority;
        return 0; // preserve original sort_order from DB
      }).reverse();

    case 'oldest':
    default:
      // Preserve original sort_order from DB (ascending)
      return copy;
  }
}

/**
 * Fetch all vibes with enriched discovery metadata.
 * Client-side sort applied after fetch (≤16 items, no server round-trip).
 *
 * @param sortBy - Client-side sort order. Defaults to 'popular'.
 */
export function useVibeDiscovery(sortBy: VibeSortOption = 'popular') {
  const query = useQuery({
    queryKey: vibeDiscoveryKeys.all,
    queryFn: fetchVibeDiscoveryData,
    staleTime: 30 * 60 * 1000, // 30 min — vibes change rarely
  });

  const sorted = useMemo(
    () => (query.data ? sortMoods(query.data, sortBy) : undefined),
    [query.data, sortBy],
  );

  return { ...query, data: sorted };
}
