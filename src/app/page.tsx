// ============================================================
// Landing Page — Cinematic Scroll-Driven Experience
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/roadmap/ROADMAP.md — Phase 1: Landing Page
// ============================================================

import type { Metadata } from 'next';
import { Hero } from '@/components/cinematic/Hero';
import { NarrativeFlow } from '@/components/cinematic/NarrativeFlow';
import { FeaturedCreatorsSection } from '@/components/creators/FeaturedCreatorsSection';
import { FeaturedSection } from '@/components/cinematic/FeaturedSection';

export const metadata: Metadata = {
  title: 'Comic Curated',
  description:
    'A cinematic personal comic-reading showcase — Korean manhwa, Chinese manhua, and Japanese manga.',
};

export default function HomePage() {
  return (
    <>
      {/* Cinematic hero */}
      <Hero />

      {/* Scroll-driven discovery narrative */}
      <NarrativeFlow />

      {/* Featured creator showcase */}
      <FeaturedCreatorsSection />

      {/* Featured titles showcase */}
      <FeaturedSection />
    </>
  );
}
