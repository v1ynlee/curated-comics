'use client';

// ============================================================
// YearlyArc — yearly reading summary visualization
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { easings, durations } from '@/lib/animation/easings';

interface YearlyArcProps {
  yearlyTitles: { year: number; count: number }[];
  className?: string;
}

export function YearlyArc({ yearlyTitles, className }: YearlyArcProps) {
  if (yearlyTitles.length === 0) return null;

  const maxCount = Math.max(...yearlyTitles.map((y) => y.count), 1);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {yearlyTitles.map((y, i) => {
        const pct = (y.count / maxCount) * 100;

        return (
          <div key={y.year} className="flex items-center gap-4">
            <span className="font-data text-sm text-text-tertiary w-12 shrink-0">
              {y.year}
            </span>

            <div
              className="relative flex-1 h-2 rounded-full bg-surface-elevated overflow-hidden"
              role="meter"
              aria-label={`${y.year}: ${y.count} titles`}
              aria-valuenow={y.count}
              aria-valuemin={0}
              aria-valuemax={maxCount}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-primary to-accent-tertiary"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: durations.cinematic,
                  delay: i * 0.1,
                  ease: easings.enterSoft,
                }}
              />
            </div>

            <span className="font-data text-xs text-text-secondary w-8 text-right shrink-0">
              {y.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
