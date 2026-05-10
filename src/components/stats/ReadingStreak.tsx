'use client';

// ============================================================
// ReadingStreak — streak display with animated counter
// ============================================================

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useCountUp } from '@/hooks/useCountUp';

interface ReadingStreakProps {
  current: number;
  longest: number;
  className?: string;
}

export function ReadingStreak({ current, longest, className }: ReadingStreakProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const currentDisplay = useCountUp(isInView, { end: current, suffix: ' mo' });
  const longestDisplay = useCountUp(isInView, { end: longest, suffix: ' mo', duration: 2 });

  return (
    <div ref={ref} className={cn('flex gap-6', className)}>
      <div className="flex flex-col gap-1">
        <span
          className="font-data text-3xl font-bold text-accent-secondary"
          aria-label={`Current streak: ${current} months`}
        >
          {currentDisplay}
        </span>
        <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Current Streak
        </span>
      </div>

      <div className="w-px bg-white/10 self-stretch" aria-hidden="true" />

      <div className="flex flex-col gap-1">
        <span
          className="font-data text-3xl font-bold text-text-secondary"
          aria-label={`Longest streak: ${longest} months`}
        >
          {longestDisplay}
        </span>
        <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Longest Streak
        </span>
      </div>
    </div>
  );
}
