'use client';

// ============================================================
// TimelineChart — monthly reading chapters timeline
// Source of truth: docs/motion/MOTION_SYSTEM.md — Category 5
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { easings, durations } from '@/lib/animation/easings';

interface TimelineChartProps {
  monthlyChapters: { month: string; count: number }[];
  className?: string;
}

export function TimelineChart({ monthlyChapters, className }: TimelineChartProps) {
  if (monthlyChapters.length === 0) return null;

  const maxCount = Math.max(...monthlyChapters.map((m) => m.count), 1);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Bars */}
      <div
        className="flex items-end gap-1 h-24"
        role="img"
        aria-label="Monthly chapters read chart"
      >
        {monthlyChapters.map((m, i) => {
          const pct = (m.count / maxCount) * 100;
          const date = new Date(m.month);
          const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

          return (
            <div
              key={m.month}
              className="flex flex-col items-center gap-1 flex-1 min-w-0"
              title={`${label}: ${m.count} chapters`}
            >
              <div className="relative w-full flex items-end" style={{ height: '80px' }}>
                <motion.div
                  className="w-full rounded-t-sm bg-accent-primary/60 hover:bg-accent-primary transition-colors duration-150"
                  style={{ minHeight: m.count > 0 ? '2px' : '0' }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: durations.smooth,
                    delay: i * 0.04,
                    ease: easings.enterSoft,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Month labels — show every 3rd */}
      <div className="flex gap-1">
        {monthlyChapters.map((m, i) => {
          const date = new Date(m.month);
          const label = date.toLocaleDateString('en-US', { month: 'short' });
          const showLabel = i % 3 === 0;

          return (
            <div key={m.month} className="flex-1 min-w-0 text-center">
              {showLabel && (
                <span className="font-data text-[9px] text-text-tertiary">
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
