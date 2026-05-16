'use client';

// ============================================================
// useGSAPBatchReveal — GSAP ScrollTrigger batch for lists
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 5
// ============================================================

import { useEffect, useRef } from 'react';
import { getGSAP } from '@/lib/animation/gsap-setup';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Applies GSAP ScrollTrigger batch reveal to elements matching `selector`
 * within the container ref. More efficient than per-element triggers.
 *
 * @param selector - CSS selector for elements to animate (e.g. '.reveal-item')
 * @param deps - Additional dependencies to re-run the effect
 */
export function useGSAPBatchReveal(
  selector: string,
  deps: unknown[] = [],
) {
  const containerRef = useRef<HTMLElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced || !containerRef.current) return;

    let cleanup: (() => void) | undefined;

    // Small delay to let React finish rendering
    const timer = setTimeout(() => {
      getGSAP().then((g) => {
        if (!g || !containerRef.current) return;
        const { gsap, ScrollTrigger } = g;

        const ctx = gsap.context(() => {
          // Set initial state
          gsap.set(selector, { opacity: 0, y: 24 });

          ScrollTrigger.batch(selector, {
            onEnter: (elements) => {
              gsap.to(elements, {
                opacity: 1,
                y: 0,
                stagger: 0.06,
                duration: 0.55,
                ease: 'power2.out',
                overwrite: true,
              });
            },
            start: 'top 88%',
            once: true,
          });
        }, containerRef.current!);

        cleanup = () => ctx.revert();
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced, selector, ...deps]);

  return containerRef;
}
