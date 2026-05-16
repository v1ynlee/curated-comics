'use client';

// ============================================================
// StudioShell — Client wrapper that renders the header + page
// transitions for authenticated Studio routes.
// The login page renders standalone (no header chrome).
// Requirements: 3.1, 3.2, 3.3
// ============================================================

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { StudioHeader } from '@/components/studio/StudioHeader';
import { StudioPageTransition } from '@/components/studio/StudioPageTransition';
import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser';

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/studio/login';
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUser({ email: data.user.email });
      }
    });
  }, []);

  // Login page: standalone full-screen layout, no header
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // Authenticated Studio routes: header + full-width content
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip navigation for accessibility */}
      <a
        href="#studio-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-md"
      >
        Skip to studio content
      </a>

      {/* Top header bar */}
      <StudioHeader user={user} />

      {/* Main content area — full viewport width */}
      {/* Requirement 4.1: min 24px top margin between header and first page title */}
      {/* Requirement 4.2: min 16px bottom margin below page titles (applied via studio-content-spacing) */}
      <main
        id="studio-content"
        role="main"
        className="flex-1 w-full pt-6"
      >
        <StudioPageTransition>
          {children}
        </StudioPageTransition>
      </main>
    </div>
  );
}
