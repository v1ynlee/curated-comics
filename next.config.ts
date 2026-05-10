// ============================================================
// Next.js Configuration
// Source of truth: docs/performance/PERFORMANCE_STRATEGY.md
//                  docs/performance/IMAGE_PIPELINE.md
// ============================================================

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,

  // ── Image Optimization ──────────────────────────────────────
  images: {
    // Prefer AVIF, fall back to WebP
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes for fixed-width images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache processed images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Allow Supabase storage images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ── Compiler ────────────────────────────────────────────────
  compiler: {
    // Remove console.* in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Headers ─────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
