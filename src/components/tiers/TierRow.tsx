'use client';

// ============================================================
// TierRow — single tier with horizontal scroll of titles
// Source of truth: docs/design/UI_UX_DIRECTION.md — Tier List View
// ============================================================

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { TierLabel } from './TierLabel';
import { TitleCard } from '@/components/library/TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { TIER_CONFIG } from '@/types/title';
import type { TierLevel, Title } from '@/types/title';

interface TierRowProps {
  tier: TierLevel;
  titles: Title[];
  isLoading?: boolean;
  index?: number;
}

export function TierRow({ tier, titles, isLoading = false, index = 0 }: TierRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const config = TIER_CONFIG[tier];

  if (!isLoading && titles.length === 0) return null;

  return (
    <motion.section
      aria-labelledby={`tier-${tier}-heading`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.0, 0.0, 0.2, 1.0],
      }}
      className={cn(
        'relative flex flex-col md:flex-row gap-6 md:gap-8',
        'py-8 border-b border-white/5 last:border-0',
      )}
    >
      {/* Tier accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px hidden md:block"
        style={{
          background: `linear-gradient(to bottom, ${config.color}60, transparent)`,
        }}
        aria-hidden="true"
      />

      {/* Tier label — sidebar on desktop, top on mobile */}
      <div className="md:pl-6 shrink-0 md:w-40">
        <TierLabel tier={tier} />
        {!isLoading && (
          <span className="font-data text-xs text-text-tertiary mt-2 block">
            {titles.length} title{titles.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Horizontal scroll of titles */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory flex-1"
        role="list"
        aria-label={`${tier} tier titles`}
        id={`tier-${tier}-heading`}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-32 shrink-0 snap-start">
                <TitleCardSkeleton />
              </div>
            ))
          : titles.map((title, i) => (
              <div
                key={title.id}
                className="w-32 shrink-0 snap-start"
                role="listitem"
              >
                <TitleCard title={title} index={i} />
              </div>
            ))}
      </div>
    </motion.section>
  );
}
