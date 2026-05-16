// ============================================================
// Studio Layout — Isolated layout for the /studio route group
// No public nav/footer. Dark theme by default. Full-width content.
// Login page gets a standalone view (no header chrome).
// Requirements: 4.1, 4.2, 4.3, 9.1, 9.2, 9.5, 17.7
// ============================================================

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { StudioShell } from '@/components/studio/StudioShell';

// Inter — primary body typeface for the Studio area (Requirement 4.3)
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
      className={`min-h-screen bg-bg-deep text-text-primary ${inter.variable}`}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <StudioShell>{children}</StudioShell>
    </div>
  );
}
