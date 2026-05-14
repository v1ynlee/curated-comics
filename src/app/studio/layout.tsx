// ============================================================
// Studio Layout — Isolated layout for the /studio route group
// No public nav/footer. Dark theme by default. Sidebar + content.
// Login page gets a standalone view (no sidebar).
// Requirements: 9.1, 9.2, 9.5, 17.7
// ============================================================

import type { Metadata } from 'next';
import { StudioShell } from '@/components/studio/StudioShell';

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
    <div className="min-h-screen bg-bg-deep text-text-primary font-body">
      <StudioShell>{children}</StudioShell>
    </div>
  );
}
