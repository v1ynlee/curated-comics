'use client';

// ============================================================
// RatingDisplay — multi-dimensional rating visualization
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — Category 5
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { formatRating } from '@/lib/utils/utils';
import { easings, durations } from '@/lib/animation/easings';
import type { TitleRatings } from '@/types/title';

interface RatingDisplayProps {
  ratings: TitleRatings;
  className?: string;
}

const RATING_DIMENSIONS = [
  { key: 'overall' as const, label: 'Overall', color: '#8b5cf6' },
  { key: 'emotional' as const, label: 'Emotional', color: '#ec4899' },
  { key: 'art' as const, label: 'Art', color: '#06b6d4' },
  { key: 'story' as const, label: 'Story', color: '#f59e0b' },
  { key: 'pacing' as const, label: 'Pacing', color: '#10b981' },
  { key: 'ending' as const, label: 'Ending', color: '#e040fb' },
];

export function RatingDisplay({ ratings, className }: RatingDisplayProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {RATING_DIMENSIONS.map(({ key, label, color }, i) => {
        const value = ratings[key];
        if (value === undefined) return null;

        const pct = ((value - 1) / 9) * 100;

        return (
          <div key={key} className="flex items-center gap-3">
            {/* Label */}
            <span className="font-heading text-[10px] uppercase tracking-widest text-text-tertiary w-16 shrink-0">
              {label}
            </span>

            {/* Bar */}
            <div
              className="relative flex-1 h-1 rounded-full bg-surface-elevated overflow-hidden"
              role="meter"
              aria-label={`${label} rating`}
              aria-valuenow={value}
              aria-valuemin={1}
              aria-valuemax={10}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: durations.cinematic,
                  delay: i * 0.08,
                  ease: easings.enterSoft,
                }}
              />
            </div>

            {/* Value */}
            <span
              className="font-data text-sm font-medium w-8 text-right shrink-0"
              style={{ color }}
            >
              {formatRating(value)}
            </span>

            {/* Screen reader text */}
            <span className="sr-only">
              {label}: {formatRating(value)} out of 10
            </span>
          </div>
        );
      })}
    </div>
  );
}
