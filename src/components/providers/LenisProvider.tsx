'use client';

// ============================================================
// LenisProvider — smooth scroll setup
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 6
//                  docs/performance/PERFORMANCE_STRATEGY.md
//
// Lenis drives ALL scroll behavior. GSAP ScrollTrigger is
// synced to Lenis's RAF loop (single requestAnimationFrame).
// Reduced motion: Lenis is disabled, native scroll used.
// ============================================================

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGSAP } from '@/lib/gsap-setup';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useUIStore } from '@/stores/useUIStore';

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const prefersReduced = usePrefersReducedMotion();
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  useEffect(() => {
    setReducedMotion(prefersReduced);
  }, [prefersReduced, setReducedMotion]);

  useEffect(() => {
    // Register GSAP plugins once
    registerGSAP();

    if (prefersReduced) {
      // Respect reduced motion — use native scroll
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker (single RAF loop)
    gsap.ticker.add((time: number) => {
      lenis.raf(time * 1000);
    });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReduced]);

  return <>{children}</>;
}
