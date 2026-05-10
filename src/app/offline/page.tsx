// ============================================================
// Offline Page — shown by service worker when network unavailable
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div aria-hidden="true" className="particle-field absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-deep via-bg-mid to-bg-surface" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-tertiary opacity-[0.04] blur-[100px]" />
      </div>

      <div className="container-content flex flex-col items-center gap-6 text-center">
        <span className="text-6xl" aria-hidden="true">📡</span>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">
            You&apos;re Offline
          </h1>
          <p className="font-body text-text-secondary max-w-sm">
            No internet connection. Previously visited pages are still available.
          </p>
        </div>

        <Link
          href="/"
          className="font-heading text-xs uppercase tracking-widest text-accent-primary hover:text-accent-primary/80 transition-colors focus-visible:outline-accent-primary"
        >
          ← Try Home
        </Link>
      </div>
    </div>
  );
}
