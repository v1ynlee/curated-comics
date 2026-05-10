// ============================================================
// Root Layout
// Source of truth: docs/design/TYPOGRAPHY_SYSTEM.md
//                  docs/architecture/COMPONENT_ARCHITECTURE.md
//
// Font strategy:
//   - DM Sans (body) — variable, preloaded
//   - Playfair Display (display) — variable, preloaded
//   - JetBrains Mono (data) — variable, lazy
//   - Caveat (accent) — variable, lazy
//   - Datatype — local font (not on Google), loaded via CSS
// ============================================================

import type { Metadata } from 'next';
import {
  DM_Sans,
  Playfair_Display,
  JetBrains_Mono,
  Caveat,
} from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import './globals.css';

// ── Font Definitions ──────────────────────────────────────────

// Body font — critical, preloaded
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  // Variable font — all weights available
});

// Display font — critical for hero, preloaded
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// Data/mono font — lazy loaded (stats, ratings)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'optional',
});

// Accent/handwritten font — lazy loaded (annotations)
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'optional',
});

// ── Metadata ──────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Comic Curated',
    template: '%s — Comic Curated',
  },
  description:
    'A cinematic personal comic-reading showcase — Korean manhwa, Chinese manhua, and Japanese manga.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comic-curated.com',
  ),
  openGraph: {
    type: 'website',
    siteName: 'Comic Curated',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── Root Layout ───────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[
        dmSans.variable,
        playfairDisplay.variable,
        jetbrainsMono.variable,
        caveat.variable,
        'h-full antialiased',
      ].join(' ')}
    >
      <head>
        {/*
          Skip-to-content link — accessibility requirement.
          Visually hidden until focused.
        */}
      </head>
      <body className="min-h-full bg-bg-deep text-text-primary font-body">
        {/* Skip navigation — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>

        <Providers>
          <main id="main-content" role="main">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
