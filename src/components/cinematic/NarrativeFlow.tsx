'use client';

// ============================================================
// NarrativeFlow — scroll-driven discovery narrative for landing
// Composes multiple NarrativeSections into a cinematic journey.
// Cover slugs are hardcoded defaults; future: configurable from Studio.
// ============================================================

import { NarrativeSection } from './NarrativeSection';
import { useHomepageNarratives } from '@/hooks/useNarratives';

/**
 * Default narrative sections for the landing page.
 * Each section represents a discovery path with curated cover imagery.
 * TODO: Make configurable from Studio dashboard (curation settings).
 */
const NARRATIVE_SECTIONS = [
  {
    heading: 'New to manhwa? Start here.',
    subtitle:
      'Handpicked gateway titles that hook you from chapter one. No filler, no slow burns, just instant immersion into worlds you won\'t want to leave.',
    ctaText: 'Explore Starter Picks',
    ctaHref: '/discover?mood=starter',
    coverSlugs: [
      'solo-leveling',
      'tower-of-god',
      'the-beginning-after-the-end',
      'omniscient-readers-viewpoint',
    ],
    accentColor: '#8b5cf6', // violet — discovery, curiosity
  },
  {
    heading: 'Wholesome characters, warm stories.',
    subtitle:
      'For the days you need comfort. Adorable leads, found families, gentle humor, and the kind of warmth that makes you smile at your screen.',
    ctaText: 'Find Comfort Reads',
    ctaHref: '/discover?mood=wholesome',
    coverSlugs: [
      'spy-x-family',
      'dungeon-meshi',
      'eleceed',
      'i-love-yoo',
    ],
    accentColor: '#f59e0b', // warm gold — comfort, warmth
  },
  {
    heading: 'Dark fantasy. Overpowered protagonists.',
    subtitle:
      'When you want stakes, power systems, and protagonists who break the ceiling. Murim, regression, reincarnation, and raw ambition.',
    ctaText: 'Unleash the Power',
    ctaHref: '/discover?mood=dark-fantasy',
    coverSlugs: [
      'nano-machine',
      'return-mount-hua',
      'heavenly-demon-reborn',
      'fist-demon-mount-hua',
    ],
    accentColor: '#ef4444', // crimson — intensity, power
  },
] as const;

export function NarrativeFlow() {
  const { data: curatedNarratives = [] } = useHomepageNarratives();
  const sections = curatedNarratives.length > 0
    ? curatedNarratives.map((item) => ({
        heading: item.title,
        subtitle: item.subtitle ?? item.description ?? '',
        description: item.subtitle ? item.description : undefined,
        ctaText: item.ctaText ?? 'Explore',
        ctaHref: item.ctaHref ?? '/discover',
        coverSlugs: item.coverSlugs.length > 0 ? item.coverSlugs : ['solo-leveling', 'tower-of-god', 'omniscient-reader', 'return-mount-hua'],
        accentColor: item.accentColor,
      }))
    : NARRATIVE_SECTIONS;

  return (
    <div className="relative" aria-label="Discovery sections">
      {sections.map((section, i) => (
        <NarrativeSection
          key={section.ctaHref}
          heading={section.heading}
          subtitle={section.subtitle}
          description={'description' in section ? section.description : undefined}
          ctaText={section.ctaText}
          ctaHref={section.ctaHref}
          coverSlugs={[...section.coverSlugs]}
          accentColor={section.accentColor}
          index={i}
        />
      ))}
    </div>
  );
}
