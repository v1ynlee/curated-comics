'use client';

// ============================================================
// ServiceWorkerRegistration — registers the PWA service worker
// Only runs in production to avoid dev cache issues.
// ============================================================

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => {
          // Non-fatal — site works without SW
          console.warn('[SW] Registration failed:', err);
        });
    }
  }, []);

  return null;
}
