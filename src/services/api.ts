// ============================================================
// Supabase Client Setup
// Source of truth: docs/database/DATABASE_SCHEMA_PLANNING.md
//
// Two clients:
//   - Browser client (singleton) — for client components
//   - Server client — for server components / route handlers
//
// Environment variables required:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In development, warn but don't crash — Supabase setup is Phase 0 infra
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[Supabase] Missing environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
    );
  }
}

/**
 * Browser-safe Supabase client.
 * Uses the anon key — subject to Row Level Security policies.
 * Used for data fetching in client components.
 * For auth operations (login/logout), use createSupabaseBrowserClient() from @/lib/supabase-browser.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
