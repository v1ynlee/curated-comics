// ============================================================
// Service Worker — PWA offline support
// Source of truth: docs/roadmap/ROADMAP.md — Phase 5
//                  docs/performance/PERFORMANCE_STRATEGY.md
//
// Strategy:
//   - Static assets (JS, CSS, fonts, images): Cache-first
//   - HTML pages: Network-first with cache fallback
//   - API/Supabase: Network-only (no caching of dynamic data)
// ============================================================

const CACHE_NAME = 'comic-curated-v1';
const STATIC_CACHE = 'cc-static-v1';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/library',
  '/discover',
  '/tiers',
  '/stats',
  '/offline',
];

// ── Install ───────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Silently fail if some URLs aren't available
      }),
    ),
  );
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls — always network
  if (url.hostname.includes('supabase.co')) return;

  // Skip admin routes — always network
  if (url.pathname.startsWith('/admin')) return;

  // Skip API routes — always network
  if (url.pathname.startsWith('/api/')) return;

  // Static assets (JS, CSS, fonts, images) — cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }),
      ),
    );
    return;
  }

  // HTML pages — network-first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached ?? caches.match('/offline') ?? new Response('Offline', { status: 503 }),
          ),
        ),
    );
    return;
  }
});
