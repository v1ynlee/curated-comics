'use client';

// ============================================================
// Admin Login Page — Supabase Auth (email + password)
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/services/api';
import { cn } from '@/lib/utils/cn';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex flex-col gap-1 mb-8 text-center">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
            Comic Curated
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Admin Access
          </h1>
          <p className="font-body text-sm text-text-secondary">
            Sign in to manage your library.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                'w-full px-3 py-2.5 rounded-sm',
                'bg-surface-elevated border border-white/10',
                'font-body text-sm text-text-primary',
                'placeholder:text-text-tertiary',
                'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                'transition-colors hover:border-white/20',
              )}
              placeholder="owner@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={cn(
                'w-full px-3 py-2.5 rounded-sm',
                'bg-surface-elevated border border-white/10',
                'font-body text-sm text-text-primary',
                'placeholder:text-text-tertiary',
                'focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                'transition-colors hover:border-white/20',
              )}
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="font-body text-sm text-semantic-danger bg-semantic-danger/10 border border-semantic-danger/20 rounded-sm px-3 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full h-11 rounded-sm',
              'font-heading text-sm font-medium uppercase tracking-widest',
              'bg-accent-primary text-white',
              'hover:brightness-110 transition-all duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
