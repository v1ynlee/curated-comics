'use client';

// ============================================================
// useCountUp — animated number counter
// Source of truth: docs/motion/MOTION_SYSTEM.md — Category 5
//
// React 19 compliant: no setState inside effect body.
// Reduced motion: returns formatted end value directly (no animation).
// Animated: RAF loop updates state via callback only.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function useCountUp(
  isInView: boolean,
  { end, duration = 1.8, decimals = 0, prefix = '', suffix = '' }: UseCountUpOptions,
): string {
  const prefersReduced = usePrefersReducedMotion();
  // Only track animated progress (0–1). Reduced motion skips animation entirely.
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion: skip animation — progress stays 0, we'll use end directly
    if (prefersReduced || !isInView) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const p = Math.min(elapsed / duration, 1);
      // power3.out easing
      const eased = 1 - Math.pow(1 - p, 3);

      setProgress(eased);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isInView, duration, prefersReduced]);

  // Derive display value — no setState needed
  const displayValue = prefersReduced || !isInView ? end : progress * end;

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return `${prefix}${formatted}${suffix}`;
}
