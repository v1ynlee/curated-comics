'use client';

// ============================================================
// MainContent — root layout <main> + footer wrapper.
// Applies mobile header offset (pt-14) on public routes only.
// Studio routes have their own header/layout and need no offset.
// Footer is also suppressed on studio routes.
// ============================================================

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Footer } from '@/components/layout/Footer';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname.startsWith('/studio');

  return (
    <>
      <main
        id="main-content"
        role="main"
        className={cn(
          'min-h-screen',
          // Public pages: offset for fixed mobile header (hidden at md+)
          // Studio pages: no offset — StudioShell manages its own layout
          !isStudio && 'pt-14 pb-16 md:pt-0 md:pb-0',
        )}
      >
        {children}
      </main>
      {/* Footer is suppressed on /studio/* — StudioShell owns that layout */}
      {!isStudio && <Footer />}
    </>
  );
}
