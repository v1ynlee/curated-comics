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
import { useUIStore, type Theme } from '@/stores/useUIStore';

// Extend Document type for View Transition API
type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  // Track whether this is the initial mount (no animation on first render)
  const isFirstMount = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    const doc = document as VTDocument;

    const applyTheme = () => {
      root.setAttribute('data-theme', resolveTheme(theme));
    };

    const applyThemeWithTransition = () => {
      if (typeof doc.startViewTransition === 'function') {
        try {
          const transition = doc.startViewTransition(applyTheme);
          // Suppress unhandled rejection from AbortError on rapid toggles.
          transition.finished.catch(() => {});
        } catch {
          applyTheme();
        }
      } else {
        applyTheme();
      }
    };

    // On first mount just set the attribute — no animation needed
    if (isFirstMount.current) {
      isFirstMount.current = false;
      applyTheme();
    } else {
      applyThemeWithTransition();
    }

    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyThemeWithTransition);
    return () => media.removeEventListener('change', applyThemeWithTransition);
  }, [theme]);

  return <>{children}</>;
}
