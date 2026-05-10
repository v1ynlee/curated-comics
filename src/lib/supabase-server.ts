// ============================================================
// Supabase Server Client — for Server Components and Route Handlers
// Uses @supabase/ssr for cookie-based auth in Next.js App Router.
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in Server Components and Route Handlers.
 * Reads/writes auth cookies via next/headers.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — cookies can't be set.
            // This is fine if middleware handles session refresh.
          }
        },
      },
    },
  );
}

/**
 * Get the current authenticated user from the server.
 * Returns null if not authenticated.
 */
export async function getServerUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
