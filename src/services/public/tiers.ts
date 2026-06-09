// ============================================================
// Tier Service — fetch titles grouped by tier
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
// ============================================================

import { fetchTitles } from './titles';
import { supabase } from '../api';
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
  const [{ titles }, { data: tierRows }] = await Promise.all([
    fetchTitles({
      filters: {},
      sortBy: 'rating-high',
      pageSize: 500, // Fetch all tiered titles
    }),
    supabase
      .from('tier_definitions')
      .select('name, display_order')
      .eq('visible', true)
      .order('display_order', { ascending: true }),
  ]);

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
  const order = ((tierRows as { name: TierLevel }[] | null) ?? [])
    .map((tier) => tier.name)
    .filter((tier): tier is TierLevel => TIER_ORDER.includes(tier));
  const tierOrder = order.length > 0 ? order : TIER_ORDER;

  return tierOrder
    .filter((tier) => (groups.get(tier)?.length ?? 0) > 0)
    .map((tier) => ({
      tier,
      titles: groups.get(tier) ?? [],
    }));
}
