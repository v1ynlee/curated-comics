'use client';

// ============================================================
// usePerformanceTier
// Source of truth: docs/performance/PERFORMANCE_STRATEGY.md
//                  docs/motion/ANIMATION_GUIDELINES.md — Rule 8
// ============================================================

import { useMemo } from 'react';
import type { AnimationTier } from '@/types/ui';

/**
 * Detects device capability and returns an animation tier.
 * - 'low'  → disable particles, simplify parallax
 * - 'mid'  → reduce particles, 2-layer parallax
 * - 'high' → full effects
 *
 * Reads navigator APIs synchronously (client-only).
 * Returns 'high' on SSR.
 */
export function usePerformanceTier(): AnimationTier {
  return useMemo<AnimationTier>(() => {
    if (typeof window === 'undefined') return 'high';

    const memory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const connection = (
      navigator as Navigator & { connection?: { effectiveType?: string } }
    ).connection?.effectiveType ?? '4g';

    if (memory <= 2 || connection === '2g' || connection === 'slow-2g') {
      return 'low';
    }
    if (memory <= 4 || connection === '3g') {
      return 'mid';
    }
    return 'high';
  }, []);
}
