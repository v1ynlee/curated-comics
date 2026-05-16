'use client';

// ============================================================
// CinematicReveal — scroll-triggered dramatic reveal wrapper
// Source of truth: docs/motion/MOTION_SYSTEM.md — cinematicRevealVariants
// ============================================================

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cinematicRevealVariants, fadeVariants } from '@/lib/animation/animations';
import { cn } from '@/lib/utils/cn';

interface CinematicRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function CinematicReveal({
  children,
  className,
  delay = 0,
}: CinematicRevealProps) {
  const prefersReduced = usePrefersReducedMotion();

  const variants = prefersReduced ? fadeVariants : cinematicRevealVariants;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={delay ? { delay } : undefined}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
