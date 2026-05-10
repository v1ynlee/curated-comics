'use client';

// ============================================================
// ProgressBar — animated progress indicator
// Source of truth: docs/motion/MOTION_SYSTEM.md — Category 5
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { easings, durations } from '@/lib/easings';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  color?: string;
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
}

export function ProgressBar({
  value,
  label,
  color,
  className,
  delay = 0,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <span className="font-body text-xs text-text-tertiary">{label}</span>
      )}
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color ?? 'var(--color-accent-primary)' }}
          initial={{ width: 0 }}
          whileInView={{ width: `${clampedValue}%` }}
          viewport={{ once: true }}
          transition={{
            duration: durations.cinematic,
            delay,
            ease: easings.enterSoft,
          }}
        />
      </div>
    </div>
  );
}
