'use client';

// ============================================================
// StudioShell — Client wrapper that conditionally renders
// the sidebar + page transitions for authenticated Studio routes.
// The login page renders standalone (no sidebar chrome).
// Requirements: 9.1, 9.2, 9.5, 17.7
// ============================================================

import { usePathname } from 'next/navigation';
import { StudioNav } from '@/components/studio/StudioNav';
import { StudioPageTransition } from '@/components/studio/StudioPageTransition';

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/studio/login';

  // Login page: standalone full-screen layout, no sidebar
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // Authenticated Studio routes: sidebar + page transitions
  return (
    <div className="flex min-h-screen">
      {/* Skip navigation for accessibility */}
      <a
        href="#studio-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-md"
      >
        Skip to studio content
      </a>

      {/* Sidebar navigation */}
      <StudioNav />

      {/* Main content area — offset by sidebar on desktop, header on mobile */}
      <main
        id="studio-content"
        role="main"
        className="flex-1 min-h-screen flex flex-col pt-14 md:pt-0"
      >
        <StudioPageTransition>
          {children}
        </StudioPageTransition>
      </main>
    </div>
  );
}
