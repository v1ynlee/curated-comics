'use client';

// ============================================================
// Tiers Page — Visual Tier List
// Source of truth: docs/roadmap/ROADMAP.md — Phase 2: Tier List
//                  docs/design/UI_UX_DIRECTION.md — Tier List View
// ============================================================

import { motion } from 'framer-motion';
import { TierRow } from '@/components/tiers/TierRow';
import { useTierGroups } from '@/hooks/useTiers';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel } from '@/types/title';

const TIER_ORDER: TierLevel[] = ['SSS+', 'S', 'A', 'B', 'C', 'D', 'F'];

export default function TiersPage() {
  const { data: groups = [], isLoading } = useTierGroups();

  // Build a map for quick lookup
  const groupMap = new Map(groups.map((g) => [g.tier, g]));

  return (
    <div className="container-content pt-24 pb-16">
      {/* Page header */}
      <motion.div
        className="flex flex-col gap-2 mb-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }}
      >
        <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
          Personal Rankings
        </span>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-bold text-text-primary leading-tight">
          Tier List
        </h1>
        <p className="font-body text-text-secondary max-w-md">
          Every title I&apos;ve read, ranked from transcendent to trash.
          Scroll each tier to explore.
        </p>

        {/* Tier legend */}
        <div className="flex flex-wrap gap-2 mt-4">
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            return (
              <span
                key={tier}
                className="font-heading text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest"
                style={{
                  color: config.color,
                  backgroundColor: `${config.color}15`,
                  border: `1px solid ${config.color}30`,
                }}
              >
                {tier}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Tier rows */}
      <div className="flex flex-col">
        {isLoading
          ? TIER_ORDER.slice(0, 4).map((tier, i) => (
              <TierRow key={tier} tier={tier} titles={[]} isLoading index={i} />
            ))
          : TIER_ORDER.map((tier, i) => {
              const group = groupMap.get(tier);
              if (!group) return null;
              return (
                <TierRow
                  key={tier}
                  tier={tier}
                  titles={group.titles}
                  index={i}
                />
              );
            })}
      </div>
    </div>
  );
}
