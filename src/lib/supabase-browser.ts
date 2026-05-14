// ============================================================
// Supabase Browser Client — for client components that need
// cookie-based auth (compatible with server-side session reading).
// Uses @supabase/ssr's createBrowserClient which stores auth
// tokens in cookies instead of localStorage.
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser client that stores auth state in cookies.
 * Use this for auth operations (login, logout) so the server-side
 * proxy and route handlers can read the session from cookies.
 *
 * For data fetching in client components, you can still use the
 * regular client from @/services/api.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
