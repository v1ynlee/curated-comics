'use client';

// ============================================================
// CustomCursor — ambient cursor effect for desktop
// Source of truth: docs/design/UI_UX_DIRECTION.md — Interaction Patterns
//                  docs/motion/ANIMATION_GUIDELINES.md — Tier 3 effects
//
// Only rendered on desktop (md+). Disabled on reduced motion.
// Uses CSS transform only (GPU-accelerated, no layout thrash).
// ============================================================

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { usePerformanceTier } from '@/hooks/usePerformanceTier';

export function CustomCursor() {
  const prefersReduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const tier = usePerformanceTier();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const enabled = isDesktop && !prefersReduced && tier === 'high';

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      // Dot follows cursor instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
      }

      // Ring follows with spring lag
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    // Hide default cursor on body
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
      document.body.style.cursor = '';
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Dot — instant follow */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full bg-accent-primary"
        style={{ willChange: 'transform' }}
      />
      {/* Ring — lagged follow */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-8 w-8 rounded-full border border-accent-primary/40"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
