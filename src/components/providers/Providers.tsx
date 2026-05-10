'use client';

// ============================================================
// Providers — root provider composition
// Order matters: QueryProvider wraps everything, Lenis is
// inside so it can access the DOM after hydration.
// ============================================================

import { QueryProvider } from './QueryProvider';
import { LenisProvider } from './LenisProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LenisProvider>{children}</LenisProvider>
    </QueryProvider>
  );
}
