'use client';

// ============================================================
// ParallaxSection — multi-layer parallax wrapper
// Source of truth: docs/motion/MOTION_SYSTEM.md — Category 1
//                  docs/motion/ANIMATION_GUIDELINES.md — Rule 3
// ============================================================

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, ScrollTrigger } from '@/lib/gsap-setup';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePerformanceTier } from '@/hooks/usePerformanceTier';

interface ParallaxSectionProps {
  children: React.ReactNode;
  /** Parallax speed multiplier: 0 = no parallax, 1 = full scroll speed */
  speed?: number;
  className?: string;
}

export function ParallaxSection({
  children,
  speed = 0.3,
  className,
}: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const tier = usePerformanceTier();

  // Only apply parallax on mid/high performance, no reduced motion
  const enabled = !prefersReduced && tier !== 'low';

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const yOffset = self.progress * 60 * speed;
          gsap.set(containerRef.current, { y: yOffset });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [enabled, speed]);

  return (
    <div
      ref={containerRef}
      className={cn('parallax-layer', className)}
    >
      {children}
    </div>
  );
}
