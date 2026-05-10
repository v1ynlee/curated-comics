// ============================================================
// Easing Curves
// Source of truth: docs/motion/MOTION_SYSTEM.md
// ============================================================

/**
 * Cubic bezier easing curves for Framer Motion.
 * Format: [x1, y1, x2, y2]
 */
export const easings = {
  // Standard
  smooth: [0.25, 0.1, 0.25, 1.0] as const,

  // Entrances (decelerate)
  enterSoft: [0.0, 0.0, 0.2, 1.0] as const,
  enterDramatic: [0.0, 0.0, 0.0, 1.0] as const,

  // Exits (accelerate)
  exitSoft: [0.4, 0.0, 1.0, 1.0] as const,
  exitDramatic: [0.7, 0.0, 1.0, 1.0] as const,

  // Emphasis (overshoot)
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  springHeavy: [0.68, -0.55, 0.265, 1.55] as const,

  // Cinematic
  cinematic: [0.77, 0.0, 0.175, 1.0] as const,
  dramatic: [0.86, 0.0, 0.07, 1.0] as const,
} as const;

/**
 * GSAP easing strings.
 */
export const gsapEasings = {
  smoothReveal: 'power2.out',
  dramaticReveal: 'power4.out',
  elasticBounce: 'elastic.out(1, 0.5)',
  cinematicIn: 'power3.inOut',
  snapIn: 'back.out(1.7)',
} as const;

/**
 * Framer Motion spring configs.
 */
export const springs = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 14 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 20 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 10 },
  heavy: { type: 'spring' as const, stiffness: 80, damping: 20, mass: 2 },
  cinematic: { type: 'spring' as const, stiffness: 50, damping: 15, mass: 1.5 },
} as const;

/**
 * Duration scale in seconds (for Framer Motion).
 * Source: docs/motion/MOTION_SYSTEM.md — Duration Scale
 */
export const durations = {
  instant: 0.05,
  fast: 0.15,
  normal: 0.3,
  smooth: 0.5,
  cinematic: 0.8,
  epic: 1.2,
} as const;
