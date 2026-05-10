'use client';

// ============================================================
// ThemeProvider — applies data-theme attribute to <html>
// Uses View Transition API for smooth ripple theme switching.
// Falls back to instant switch on unsupported browsers.
// ============================================================

import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    // View Transition API — smooth crossfade/ripple between themes
    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      typeof (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition === 'function'
    ) {
      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => {
          root.setAttribute('data-theme', theme);
        });
    } else {
      // Fallback: CSS transition handles the smoothness
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return <>{children}</>;
}
