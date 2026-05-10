'use client';

// ============================================================
// ThemeProvider — applies data-theme attribute to <html>
// Reads from useUIStore (persisted in localStorage).
// ============================================================

import { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
