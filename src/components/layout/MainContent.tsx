'use client';

// ============================================================
// MainContent — root layout <main> + footer wrapper.
// Applies mobile header offset (pt-14) and bottom nav offset (pb-16)
// on all routes including /studio/*.
// Footer is rendered on all routes.
// ============================================================

import { cn } from '@/lib/utils/cn';
import { Footer } from '@/components/layout/Footer';

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main
        id="main-content"
        role="main"
        className={cn(
          'min-h-screen',
          // Offset for fixed headers and bottom nav
          // Mobile: pt-14 (56px mobile header) + pb-16 (64px bottom nav)
          // Desktop: pt-16 (64px desktop header)
          'pt-14 pb-16 md:pt-16 md:pb-0',
        )}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
