'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-deep">
      <div className="container-content flex flex-col items-center gap-6 text-center">
        <AlertTriangle size={48} className="text-semantic-warning" aria-hidden="true" />

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Something went wrong
          </h1>
          <p className="font-body text-text-secondary max-w-sm">
            An unexpected error occurred. The archive is still intact — try again.
          </p>
        </div>

        <button
          onClick={reset}
          className="font-heading text-xs uppercase tracking-widest px-4 py-2 rounded-sm bg-accent-primary text-white hover:brightness-110 transition-all focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
