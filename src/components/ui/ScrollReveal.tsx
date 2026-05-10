'use client';

// ============================================================
// ScrollReveal — scroll-triggered reveal wrapper
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 4
// ============================================================

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { revealVariants, fadeVariants } from '@/lib/animations';
import { cn } from '@/lib/cn';

interface ScrollRevealProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
  /** Override the viewport margin for trigger point */
  margin?: string;
}

export function ScrollReveal({
  children,
  index = 0,
  className,
  margin = '-100px',
}: ScrollRevealProps) {
  const prefersReduced = usePrefersReducedMotion();
  const variants = prefersReduced ? fadeVariants : revealVariants;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      custom={index}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
