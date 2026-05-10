'use client';

// ============================================================
// Discover Page — Mood/Genre Discovery
// Source of truth: docs/roadmap/ROADMAP.md — Phase 2: Mood/Genre Discovery
//                  docs/design/UI_UX_DIRECTION.md — Genre/Mood Discovery
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoodSelector } from '@/components/discover/MoodSelector';
import { MoodAtmosphere } from '@/components/discover/MoodAtmosphere';
import { DiscoveryGrid } from '@/components/discover/DiscoveryGrid';
import { useMoods } from '@/hooks/useMoods';
import type { Mood } from '@/types/title';

export default function DiscoverPage() {
  const [activeMoodSlug, setActiveMoodSlug] = useState<string | null>(null);
  const { data: moods = [], isLoading } = useMoods();

  const activeMood: Mood | null =
    moods.find((m) => m.slug === activeMoodSlug) ?? null;

  return (
    <div className="relative min-h-screen">
      {/* Per-mood atmospheric background */}
      <MoodAtmosphere
        atmosphere={activeMood?.atmosphere ?? null}
        moodKey={activeMoodSlug ?? 'default'}
      />

      <div className="container-content pt-24 pb-16 relative">
        {/* Page header */}
        <motion.div
          className="flex flex-col gap-2 mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          <span className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
            Mood-Based Discovery
          </span>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] font-bold text-text-primary leading-tight">
            Discover
          </h1>
          <p className="font-body text-text-secondary max-w-md">
            Find your next read by vibe. Each mood is a different frequency —
            tune in and explore.
          </p>
        </motion.div>

        {/* Mood selector */}
        <div className="mb-12">
          <MoodSelector
            moods={moods}
            activeMoodSlug={activeMoodSlug}
            onSelect={setActiveMoodSlug}
            isLoading={isLoading}
          />
        </div>

        {/* Discovery grid */}
        <DiscoveryGrid activeMood={activeMood} />
      </div>
    </div>
  );
}
