// ============================================================
// Studio Layout — Isolated layout for the /studio route group
// Uses the global header/footer (via root layout) but applies
// Studio-specific font and page transition.
// Login page gets a standalone view (no chrome) via its own layout.
// ============================================================

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { StudioPageTransition } from '@/components/studio/StudioPageTransition';
import { StudioKeyboardShortcuts } from '@/components/studio/StudioKeyboardShortcuts';

// Inter — primary body typeface for the Studio area
const inter = localFont({
  src: '../../fonts/Inter/Inter_28pt-Medium.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '500',
});

export const metadata: Metadata = {
  title: {
    default: 'Studio — Comic Curated',
    template: '%s — Studio',
  },
  description: 'Comic Curated Studio — Creative workspace for content management.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable}`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Skip navigation for accessibility */}
      <a
        href="#studio-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-md"
      >
        Skip to studio content
      </a>

      <div id="studio-content" className="pt-6">
        <StudioKeyboardShortcuts />
        <StudioPageTransition>
          {children}
        </StudioPageTransition>
      </div>
    </div>
  );
}
