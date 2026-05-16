// ============================================================
// Root Layout
// ============================================================

import type { Metadata } from 'next';
import {
  DM_Sans,
  Playfair_Display,
  JetBrains_Mono,
  Caveat,
} from 'next/font/google';
import localFont from 'next/font/local';
import { Providers } from '@/components/providers/Providers';
import { ServiceWorkerRegistration } from '@/components/providers/ServiceWorkerRegistration';
import { Navigation } from '@/components/layout/Navigation';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/layout/PageTransition';
import { CustomCursor } from '@/components/cinematic/CustomCursor';
import { EasterEgg } from '@/components/cinematic/EasterEgg';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';
import { BackToTop } from '@/components/ui/BackToTop';
import { SITE_URL } from '@/lib/utils/constants';
import './globals.css';

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

// ── Local fonts ─────────────────────────────────────────────
// Morvein — cinematic display font used in the hero heading.
const morvein = localFont({
  src: '../fonts/Morvein/Morvien-Regular.woff2',
  variable: '--font-morvein',
  display: 'swap',
  weight: '400',
});

// Child Hood — page section heading font (Library, Discover, Tiers, Stats).
// Loaded from src/fonts/ so it's bundled with the project.
const childHood = localFont({
  src: '../fonts/Child-Hood/Child Hood.woff2',
  variable: '--font-child-hood',
  display: 'swap',
  weight: '400',
});

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
  other: {
    'theme-color': '#08080f',
  },
};

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
        morvein.variable,
        childHood.variable,
        'antialiased',
      ].join(' ')}
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Comic Curated — New Titles"
          href="/feed.xml"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-bg-deep text-text-primary font-body overflow-x-hidden">
        {/* Skip navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>

        <Providers>
          <ServiceWorkerRegistration />
          <CustomCursor />
          <EasterEgg />
          <KeyboardShortcutsHelp />

          {/*
            Navigation sits OUTSIDE PageTransition so it is never inside
            a Framer Motion stacking context. This is the fix for nav
            being unclickable — PageTransition creates a stacking context
            that was covering the fixed nav.
          */}
          <Navigation />
          {/* Mobile-only top header — desktop nav handles md+ */}
          <MobileHeader />

          <PageTransition>
            <main
              id="main-content"
              role="main"
              className="min-h-screen pt-14 pb-16 md:pt-0 md:pb-0"
            >
              {children}
            </main>
            <Footer />
          </PageTransition>

          <MobileNav />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
