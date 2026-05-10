'use client';

// ============================================================
// ThemeProvider — applies data-theme attribute to <html>
// Uses View Transition API for smooth crossfade theme switching.
//
// AbortError guard: if a transition is already running when the
// theme changes again, we skip the animation and apply instantly
// to avoid "Transition was skipped" unhandled rejections.
// ============================================================

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/useUIStore';

// Extend Document type for View Transition API
type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  // Track whether this is the initial mount (no animation on first render)
  const isFirstMount = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    const doc = document as VTDocument;

    // On first mount just set the attribute — no animation needed
    if (isFirstMount.current) {
      isFirstMount.current = false;
      root.setAttribute('data-theme', theme);
      return;
    }

    // View Transition API available — smooth crossfade
    if (typeof doc.startViewTransition === 'function') {
      // Wrap in try/catch: AbortError fires when a new transition
      // interrupts an in-progress one. We catch it silently and
      // fall back to an instant attribute set.
      try {
        const transition = doc.startViewTransition(() => {
          root.setAttribute('data-theme', theme);
        });
        // Suppress unhandled rejection from AbortError on rapid toggles
        transition.finished.catch(() => {
          // Transition was skipped/aborted — attribute was already set
          // inside the callback, so no further action needed.
        });
      } catch {
        // Synchronous throw (shouldn't happen, but guard anyway)
        root.setAttribute('data-theme', theme);
      }
    } else {
      // Fallback: CSS transition on all elements handles the smoothness
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return <>{children}</>;
}
