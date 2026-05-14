// ============================================================
// Auth Callback Route — /auth/callback
// Handles Supabase magic link token exchange.
// When a user clicks the magic link in their email, Supabase redirects
// here with a `code` query parameter. This route exchanges the code
// for a session (setting auth cookies) and redirects to the final destination.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/studio';

  if (code) {
    const supabaseResponse = NextResponse.redirect(new URL(next, request.url));

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
  }

  // If no code or exchange failed, redirect to login with error
  const loginUrl = new URL('/studio/login', request.url);
  loginUrl.searchParams.set('reason', 'session_expired');
  return NextResponse.redirect(loginUrl);
}
