'use client';

// ============================================================
// usePrefersReducedMotion
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 9
// ============================================================

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerSnapshot() {
  // SSR: assume no reduced motion preference
  return false;
}

/**
 * Returns true if the user has requested reduced motion.
 * Uses useSyncExternalStore for React 18+ concurrent-safe subscription.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
