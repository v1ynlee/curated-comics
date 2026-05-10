'use client';

// ============================================================
// QueryProvider — TanStack Query client setup
// Source of truth: docs/architecture/COMPONENT_ARCHITECTURE.md
//                  docs/performance/PERFORMANCE_STRATEGY.md
// ============================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient per component instance (not module-level)
  // so it's not shared across requests in SSR.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,       // 5 minutes
            gcTime: 30 * 60 * 1000,          // 30 minutes
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
