'use client';

// ============================================================
// AtmosphericBg — ambient gradient + particle background
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — Category 4
//
// Particles are CSS-only (no JS runtime cost).
// Disabled on reduced motion and low-performance devices.
// ============================================================

import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePerformanceTier } from '@/hooks/usePerformanceTier';

interface AtmosphericBgProps {
  /** Primary gradient colors [from, via?, to] */
  colors?: string[];
  /** Show floating particle dots */
  particles?: boolean;
  className?: string;
}

export function AtmosphericBg({
  colors,
  particles = true,
  className,
}: AtmosphericBgProps) {
  const prefersReduced = usePrefersReducedMotion();
  const tier = usePerformanceTier();
  const showParticles = particles && !prefersReduced && tier !== 'low';

  const gradientStyle = colors
    ? {
        background: `radial-gradient(ellipse at 30% 40%, ${colors[0]}20 0%, transparent 60%),
                     radial-gradient(ellipse at 70% 60%, ${colors[colors.length - 1]}15 0%, transparent 60%)`,
      }
    : undefined;

  return (
    <div
      aria-hidden="true"
      className={cn('particle-field absolute inset-0 overflow-hidden', className)}
      style={gradientStyle}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-deep via-bg-mid to-bg-surface opacity-90" />

      {/* Accent orbs — animated on high-perf */}
      <div className={cn(
        'absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary blur-[120px]',
        tier === 'high' && !prefersReduced ? 'animate-pulse-glow opacity-[0.05]' : 'opacity-[0.04]',
      )} />
      <div className={cn(
        'absolute right-1/4 bottom-1/3 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-accent-quaternary blur-[100px]',
        tier === 'high' && !prefersReduced ? 'animate-pulse-glow opacity-[0.05]' : 'opacity-[0.04]',
      )} style={{ animationDelay: '1.5s' }} />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-tertiary opacity-[0.03] blur-[80px]" />

      {/* Floating particles — CSS only */}
      {showParticles && (
        <div className="absolute inset-0">
          {Array.from({ length: tier === 'high' ? 12 : 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-px w-px rounded-full bg-text-tertiary animate-float"
              style={{
                left: `${10 + (i * 7.3) % 80}%`,
                top: `${15 + (i * 11.7) % 70}%`,
                opacity: 0.15 + (i % 3) * 0.05,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${5 + (i % 4)}s`,
                width: i % 3 === 0 ? '2px' : '1px',
                height: i % 3 === 0 ? '2px' : '1px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
