// ============================================================
// GSAP + ScrollTrigger Setup
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md
//
// IMPORTANT: Do NOT import gsap or ScrollTrigger at module
// level in components. Always use getGSAP() inside useEffect
// to ensure plugins are registered before use.
//
// This module is client-only. It must never run on the server.
// ============================================================

let _gsap: typeof import('gsap').gsap | null = null;
let _ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger | null = null;
let _registered = false;

/**
 * Lazily initialise GSAP + ScrollTrigger.
 * Safe to call multiple times — only registers once.
 * Must be called inside useEffect (client-only).
 */
export async function getGSAP() {
  if (typeof window === 'undefined') return null;

  if (!_gsap) {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    _gsap = gsap;
    _ScrollTrigger = ScrollTrigger;
  }

  if (!_registered && _gsap && _ScrollTrigger) {
    _gsap.registerPlugin(_ScrollTrigger);
    _gsap.ticker.lagSmoothing(0);
    _registered = true;
  }

  return { gsap: _gsap!, ScrollTrigger: _ScrollTrigger! };
}

/**
 * Synchronous version — only works after getGSAP() has been
 * awaited at least once. Returns null if not yet initialised.
 */
export function getGSAPSync() {
  if (!_registered || !_gsap || !_ScrollTrigger) return null;
  return { gsap: _gsap, ScrollTrigger: _ScrollTrigger };
}

/**
 * @deprecated Use getGSAP() inside useEffect instead.
 * Kept for backward compatibility with LenisProvider.
 */
export function registerGSAP() {
  // No-op — registration now happens lazily in getGSAP()
}
