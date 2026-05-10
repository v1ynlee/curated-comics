// ============================================================
// Root Layout
// Source of truth: docs/design/TYPOGRAPHY_SYSTEM.md
//                  docs/architecture/COMPONENT_ARCHITECTURE.md
// ============================================================

import type { Metadata } from 'next';
import {
  DM_Sans,
  Playfair_Display,
  JetBrains_Mono,
  Caveat,
} from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { ServiceWorkerRegistration } from '@/components/providers/ServiceWorkerRegistration';
import { Navigation } from '@/components/layout/Navigation';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/layout/PageTransition';
import { CustomCursor } from '@/components/cinematic/CustomCursor';
import { EasterEgg } from '@/components/cinematic/EasterEgg';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

// ── Font Definitions ──────────────────────────────────────────

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'optional',
});

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
  metadataBase: new URL(SITE_URL),
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
  // PWA theme color
  other: {
    'theme-color': '#08080f',
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
        {/* RSS feed discovery */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Comic Curated — New Titles"
          href="/feed.xml"
        />
        {/* PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
          {/* PWA service worker */}
          <ServiceWorkerRegistration />

          {/* Custom cursor — desktop only, high-perf only */}
          <CustomCursor />

          {/* Easter egg — Konami code */}
          <EasterEgg />

          {/* Keyboard shortcuts help modal */}
          <KeyboardShortcutsHelp />

          {/* Desktop floating nav */}
          <Navigation />

          {/* Page content with transitions */}
          <PageTransition>
            <main
              id="main-content"
              role="main"
              className="min-h-screen pb-16 md:pb-0"
            >
              {children}
            </main>
            <Footer />
          </PageTransition>

          {/* Mobile bottom nav */}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
