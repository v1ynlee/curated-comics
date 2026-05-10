// ============================================================
// PWA Web App Manifest
// Source of truth: docs/roadmap/ROADMAP.md — Phase 5
// ============================================================

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Comic Curated',
    short_name: 'CC',
    description: 'A cinematic personal comic-reading showcase — Korean manhwa, Chinese manhua, and Japanese manga.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08080f',
    theme_color: '#08080f',
    orientation: 'portrait',
    categories: ['entertainment', 'books'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Library',
        url: '/library',
        description: 'Browse the reading archive',
      },
      {
        name: 'Discover',
        url: '/discover',
        description: 'Find titles by mood',
      },
      {
        name: 'Stats',
        url: '/stats',
        description: 'Reading statistics',
      },
    ],
  };
}
