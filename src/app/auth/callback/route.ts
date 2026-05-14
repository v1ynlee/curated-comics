// ============================================================
// Auth Callback Route — /auth/callback
// Handles Supabase PKCE magic link code exchange.
//
// Flow:
// 1. User clicks magic link in email
// 2. Supabase verifies the token and redirects here with a `code` param
// 3. This route exchanges the code for a session (setting auth cookies)
// 4. Redirects to the final destination (/studio by default)
//
// This works because the browser client uses flowType: 'pkce' which
// causes Supabase to send a `code` query parameter instead of hash
// fragment tokens. The code can be read server-side and exchanged
// for a proper cookie-based session.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/studio';

  if (code) {
    const redirectUrl = new URL(next, request.url);
    const supabaseResponse = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return supabaseResponse;
    }

    // Log the error for debugging
    console.error('[auth/callback] Code exchange failed:', error.message);
  }

  // If no code or exchange failed, redirect to login with error
  const loginUrl = new URL('/studio/login', request.url);
  loginUrl.searchParams.set('reason', 'session_expired');
  return NextResponse.redirect(loginUrl);
}
