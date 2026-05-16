'use client';

// ============================================================
// PageTransition — AnimatePresence wrapper for route changes
// Navigation is rendered OUTSIDE this component in layout.tsx
// so it is never inside a Framer Motion stacking context.
// ============================================================

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { pageVariants } from '@/lib/animation/animations';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = usePrefersReducedMotion();

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
