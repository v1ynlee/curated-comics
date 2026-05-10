// ============================================================
// Shared Animation Variants (Framer Motion)
// Source of truth: docs/motion/MOTION_SYSTEM.md
//                  docs/motion/ANIMATION_GUIDELINES.md
// ============================================================

import type { Variants } from 'framer-motion';
import { easings, durations } from './easings';

// ── Page Transitions ─────────────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: durations.smooth,
      ease: easings.enterSoft,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: durations.normal,
      ease: easings.exitSoft,
    },
  },
};

// ── Scroll Reveal ─────────────────────────────────────────────

/** Standard fade-up reveal. Use with whileInView + viewport once. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.075,
      duration: durations.smooth,
      ease: easings.enterSoft,
    },
  }),
};

/** Fade-in only (no movement) — for reduced motion. */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: {
      delay: i * 0.075,
      duration: durations.smooth,
    },
  }),
};

/** Cinematic scale + blur reveal for hero elements. */
export const cinematicRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: durations.cinematic,
      ease: easings.cinematic,
    },
  },
};

/** Staggered container — apply to parent, children use revealVariants. */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.1,
    },
  },
};

// ── Hover / Interaction ───────────────────────────────────────

export const cardHoverVariants = {
  rest: { y: 0, transition: { duration: durations.fast } },
  hover: {
    y: -4,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
  tap: { scale: 0.98 },
};

// ── Skeleton / Loading ────────────────────────────────────────

export const skeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ── Section Enter ─────────────────────────────────────────────

export const sectionEnterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.smooth,
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};
