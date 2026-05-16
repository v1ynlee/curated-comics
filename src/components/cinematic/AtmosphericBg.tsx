'use client';

// ============================================================
// AtmosphericBg — subtle corner-based gradient background
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — Category 4
//
// Replaced floating purple/pink orbs with corner gradients that
// adapt to the active theme via CSS custom properties.
// Particles are CSS-only (no JS runtime cost).
// Disabled on reduced motion and low-performance devices.
// ============================================================

import { cn } from '@/lib/utils/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePerformanceTier } from '@/hooks/usePerformanceTier';

interface AtmosphericBgProps {
  /** Override gradient colors [from, via?, to] */
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
      {/* Base — solid bg-deep fill so CSS vars handle light/dark */}
      <div className="absolute inset-0 bg-bg-deep" />

      {/*
        Corner gradients — subtle accent halos at the four corners.
        Use CSS custom properties so they adapt to both themes.
        Much softer than the old floating orbs.
      */}
      {/* Top-left: accent-primary tint */}
      <div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 8%, transparent)' }}
      />
      {/* Bottom-right: accent-quaternary tint */}
      <div
        className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-quaternary) 6%, transparent)' }}
      />
      {/* Top-right: accent-tertiary tint — very faint */}
      <div
        className="absolute -top-24 -right-24 h-[300px] w-[300px] rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-tertiary) 5%, transparent)' }}
      />
      {/* Bottom-left: accent-secondary tint — very faint */}
      <div
        className="absolute -bottom-24 -left-24 h-[300px] w-[300px] rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-secondary) 4%, transparent)' }}
      />

      {/* Floating particles — CSS only, theme-aware via bg-text-tertiary */}
      {showParticles && (
        <div className="absolute inset-0">
          {Array.from({ length: tier === 'high' ? 10 : 5 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-text-tertiary animate-float"
              style={{
                left: `${10 + (i * 7.3) % 80}%`,
                top: `${15 + (i * 11.7) % 70}%`,
                opacity: 0.12 + (i % 3) * 0.04,
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
