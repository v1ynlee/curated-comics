// ============================================================
// Proxy (Next.js 16 — replaces middleware.ts)
// Protects /studio routes: redirects unauthenticated users to /studio/login.
// Redirects legacy /admin routes to /studio.
// Refreshes Supabase Auth session on every request.
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: do not remove this call
  const { data: { user } } = await supabase.auth.getUser();

  // Studio route detection
  const isStudioRoute = request.nextUrl.pathname.startsWith('/studio');
  const isStudioLogin = request.nextUrl.pathname === '/studio/login';

  // Redirect unauthenticated users away from studio (except login page)
  if (isStudioRoute && !isStudioLogin && !user) {
    const loginUrl = new URL('/studio/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    loginUrl.searchParams.set('reason', 'session_expired');
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from studio login page
  if (isStudioLogin && user) {
    return NextResponse.redirect(new URL('/studio', request.url));
  }

  // Legacy /admin redirect to /studio
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/studio', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/studio/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
