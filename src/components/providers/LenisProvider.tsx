'use client';

// ============================================================
// LenisProvider — smooth scroll setup
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 6
//                  docs/performance/PERFORMANCE_STRATEGY.md
//
// Lenis drives ALL scroll behavior. GSAP ScrollTrigger is
// synced to Lenis's RAF loop (single requestAnimationFrame).
// Reduced motion: Lenis is disabled, native scroll used.
//
// GSAP is imported dynamically inside useEffect to avoid
// SSR issues with Turbopack (gsap.context requires window).
// ============================================================

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { getGSAP } from '@/lib/animation/gsap-setup';
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
    if (prefersReduced) return;

    let tickerFn: ((time: number) => void) | null = null;

    getGSAP().then((g) => {
      if (!g) return;
      const { gsap, ScrollTrigger } = g;

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
      tickerFn = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerFn);
    });

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      // Remove ticker if it was added
      if (tickerFn) {
        getGSAP().then((g) => {
          if (g && tickerFn) g.gsap.ticker.remove(tickerFn);
        });
      }
    };
  }, [prefersReduced]);

  return <>{children}</>;
}
