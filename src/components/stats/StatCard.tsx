'use client';

// ============================================================
// StatCard — individual stat with animated counter
// Source of truth: docs/motion/MOTION_SYSTEM.md — Category 5
// ============================================================

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
  index?: number;
}
export function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  color,
  icon,
  className,
  index = 0,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const displayValue = useCountUp(isInView, { end: value, suffix, prefix, decimals });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.0, 0.0, 0.2, 1.0],
      }}
      className={cn(
        'flex flex-col gap-2 p-5 rounded-sm',
        'bg-surface-elevated/50 border border-white/5',
        className,
      )}
    >
      {icon && (
        <span
          className="text-xl mb-1"
          aria-hidden="true"
          style={color ? { color } : undefined}
        >
          {icon}
        </span>
      )}

      <span
        className="font-data text-3xl md:text-4xl font-bold leading-none"
        style={color ? { color } : undefined}
        aria-label={`${label}: ${value}${suffix}`}
      >
        {displayValue}
      </span>

      <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
        {label}
      </span>
    </motion.div>
  );
}
