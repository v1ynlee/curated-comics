'use client';

// ============================================================
// GenreChart — genre distribution as animated horizontal bars
// Source of truth: docs/motion/MOTION_SYSTEM.md — Category 5
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { GENRES } from '@/lib/constants';
import { easings, durations } from '@/lib/easings';

interface GenreChartProps {
  distribution: Record<string, number>;
  className?: string;
}

export function GenreChart({ distribution, className }: GenreChartProps) {
  // Sort by count descending, take top 10
  const entries = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (entries.length === 0) return null;

  const maxCount = entries[0][1];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {entries.map(([name, count], i) => {
        const genre = GENRES.find((g) => g.name === name);
        const color = genre?.color ?? '#8b5cf6';
        const pct = (count / maxCount) * 100;

        return (
          <div key={name} className="flex items-center gap-3">
            {/* Label */}
            <span className="font-heading text-[10px] uppercase tracking-widest text-text-secondary w-28 shrink-0 truncate">
              {name}
            </span>

            {/* Bar */}
            <div
              className="relative flex-1 h-1.5 rounded-full bg-surface-elevated overflow-hidden"
              role="meter"
              aria-label={`${name}: ${count} titles`}
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={maxCount}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: durations.cinematic,
                  delay: i * 0.06,
                  ease: easings.enterSoft,
                }}
              />
            </div>

            {/* Count */}
            <span className="font-data text-xs text-text-tertiary w-6 text-right shrink-0">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
