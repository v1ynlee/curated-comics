'use client';

// ============================================================
// StudioPageTransition — AnimatePresence wrapper for Studio routes
// Provides cinematic page transitions between Studio pages.
// Respects prefers-reduced-motion per Requirement 17.7.
// ============================================================

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Variants } from 'framer-motion';

const studioPageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 12,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.0, 0.0, 0.2, 1.0],
    },
  },
  exit: {
    opacity: 0,
    x: -12,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.4, 0.0, 1.0, 1.0],
    },
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
