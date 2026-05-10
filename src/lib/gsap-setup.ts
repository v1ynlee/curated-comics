// ============================================================
// GSAP + ScrollTrigger Setup
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md
//
// Import this module ONCE in a client component that wraps
// the app (e.g. Providers). It registers plugins and sets
// up the Lenis ↔ ScrollTrigger sync.
// ============================================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

export function registerGSAP() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  // Disable lag smoothing so Lenis RAF drives everything
  gsap.ticker.lagSmoothing(0);
  registered = true;
}

export { gsap, ScrollTrigger };
