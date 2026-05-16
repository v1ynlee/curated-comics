// ============================================================
// Tier Service — fetch titles grouped by tier
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
// ============================================================

import { fetchTitles } from './titles';
import type { Title, TierLevel } from '@/types/title';

const TIER_ORDER: TierLevel[] = ['SSS+', 'S', 'A', 'B', 'C', 'D', 'F'];

export interface TierGroup {
  tier: TierLevel;
  titles: Title[];
}

/**
 * Fetch all titles that have a tier assigned, grouped by tier level.
 * Returns only tiers that have at least one title.
 */
export async function fetchTierGroups(): Promise<TierGroup[]> {
  const { titles } = await fetchTitles({
    filters: {},
    sortBy: 'rating-high',
    pageSize: 500, // Fetch all tiered titles
  });

  // Filter to only tiered titles
  const tieredTitles = titles.filter((t) => t.tier !== undefined);

  // Group by tier
  const groups = new Map<TierLevel, Title[]>();
  for (const tier of TIER_ORDER) {
    groups.set(tier, []);
  }

  for (const title of tieredTitles) {
    if (title.tier) {
      groups.get(title.tier)?.push(title);
    }
  }

  // Return only non-empty tiers in order
  return TIER_ORDER
    .filter((tier) => (groups.get(tier)?.length ?? 0) > 0)
    .map((tier) => ({
      tier,
      titles: groups.get(tier) ?? [],
    }));
}
