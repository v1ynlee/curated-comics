'use client';

// ============================================================
// PageTransition — AnimatePresence wrapper for route changes
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 4
//                  docs/motion/MOTION_SYSTEM.md — Category 2
// ============================================================

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { pageVariants } from '@/lib/animations';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = usePrefersReducedMotion();

  // Reduced motion: instant swap, no animation
  const variants = prefersReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.01 } },
        exit: { opacity: 0, transition: { duration: 0.01 } },
      }
    : pageVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
