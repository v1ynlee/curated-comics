'use client';

// ============================================================
// StudioPageTransition — Lightweight page transition for Studio
// Product-appropriate: 150ms opacity only, no decorative blur/slide.
// Respects prefers-reduced-motion.
// ============================================================

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Variants } from 'framer-motion';

const studioPageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.15, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: [0.4, 0.0, 1.0, 1.0] },
  },
};

const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

export function StudioPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = usePrefersReducedMotion();

  const variants = prefersReduced ? reducedMotionVariants : studioPageVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className="flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
