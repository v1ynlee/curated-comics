'use client';

// ============================================================
// Studio Login Page — Magic Link Authentication
// Cinematic, premium login experience for the Owner.
// Uses Supabase OTP (magic link) instead of email/password.
// ============================================================

import { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { cn } from '@/lib/cn';

/** Inner component that reads search params (must be inside Suspense) */
function StudioLoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/studio';
  const reason = searchParams.get('reason');
  const prefersReducedMotion = useReducedMotion();

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Motion config: instant transitions when reduced motion is preferred
  const motionConfig = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] as const };

  const shortMotionConfig = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] as const };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Build the redirect URL for after magic link verification
    // Points to the auth callback route which exchanges the code for a session
    const origin = window.location.origin;
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent-quaternary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig}
        className="w-full max-w-md relative z-base"
      >
        {/* Card container */}
        <div
          className={cn(
            'rounded-lg p-8 md:p-10',
            'bg-bg-surface/60 backdrop-blur-xl',
            'border border-white/10',
            'shadow-[0_0_80px_-20px_rgba(139,92,246,0.15)]',
          )}
        >
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8 text-center">
            <motion.span
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2, duration: 0.5 }}
              className="font-heading text-[10px] uppercase tracking-[0.3em] text-accent-primary"
            >
              Comic Curated
            </motion.span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
              Studio
            </h1>
            <p className="font-body text-sm text-text-secondary mt-1">
              Enter your email to receive a magic link.
            </p>
          </div>

          {/* Session expiration warning */}
          <AnimatePresence>
            {reason === 'session_expired' && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : undefined}
                className="mb-6"
              >
                <div
                  role="alert"
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-sm',
                    'bg-semantic-warning/10 border border-semantic-warning/20',
                  )}
                >
                  <svg
                    className="w-4 h-4 text-semantic-warning shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="font-body text-sm text-semantic-warning">
                    Your session has expired. Please sign in again.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={shortMotionConfig}
                className="text-center py-6"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-semantic-success/10 border border-semantic-success/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-semantic-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
                  Check your inbox
                </h2>
                <p className="font-body text-sm text-text-secondary mb-6 max-w-xs mx-auto">
                  We sent a magic link to{' '}
                  <span className="text-text-primary font-medium">{email}</span>.
                  Click the link to access Studio.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  className={cn(
                    'font-heading text-xs uppercase tracking-widest',
                    'text-text-tertiary hover:text-text-secondary',
                    'transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                  )}
                >
                  Use a different email
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : undefined}
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className={cn(
                      'w-full px-4 py-3 rounded-sm',
                      'bg-bg-deep/80 border border-white/10',
                      'font-body text-sm text-text-primary',
                      'placeholder:text-text-tertiary',
                      'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                      'transition-colors duration-150 hover:border-white/20',
                    )}
                    placeholder="you@example.com"
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={prefersReducedMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : undefined}
                      role="alert"
                      className="font-body text-sm text-semantic-danger bg-semantic-danger/10 border border-semantic-danger/20 rounded-sm px-4 py-2.5"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'relative w-full h-12 rounded-sm overflow-hidden',
                    'font-heading text-sm font-medium uppercase tracking-widest',
                    'bg-accent-primary text-white',
                    'hover:brightness-110 transition-all duration-150',
                    'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'btn-shimmer',
                  )}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                      />
                      Sending link…
                    </span>
                  ) : (
                    'Send Magic Link'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <p className="text-center mt-6 font-body text-xs text-text-tertiary">
          Owner access only. Unauthorized attempts are logged.
        </p>
      </motion.div>
    </div>
  );
}

/** Page wrapper with Suspense boundary for useSearchParams */
export default function StudioLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        </div>
      }
    >
      <StudioLoginForm />
    </Suspense>
  );
}
