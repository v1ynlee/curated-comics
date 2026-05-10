import Link from 'next/link';
import type { Metadata } from 'next';
import { BookX } from 'lucide-react';

export const metadata: Metadata = { title: '404 — Not Found' };

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div aria-hidden="true" className="particle-field absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-deep via-bg-mid to-bg-surface" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-semantic-danger opacity-[0.04] blur-[100px]" />
      </div>

      <div className="container-content flex flex-col items-center gap-6 text-center">
        <span className="font-data text-[8rem] font-black leading-none text-semantic-danger/20 select-none" aria-hidden="true">
          404
        </span>

        <div className="flex flex-col items-center gap-3 -mt-8">
          <BookX size={40} className="text-semantic-danger/60" aria-hidden="true" />
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Page Not Found
          </h1>
          <p className="font-body text-text-secondary max-w-sm">
            This title doesn&apos;t exist in the archive. Maybe it was dropped?
          </p>
        </div>

        <Link
          href="/"
          className="font-heading text-xs uppercase tracking-widest text-accent-primary hover:text-accent-primary/80 transition-colors focus-visible:outline-accent-primary"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
