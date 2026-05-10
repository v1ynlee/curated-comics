'use client';

// ============================================================
// MoodSelector — mood/genre picker with atmospheric transitions
// Source of truth: docs/design/UI_UX_DIRECTION.md — Genre/Mood Discovery
// ============================================================

import { MoodCard } from './MoodCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Mood } from '@/types/title';

interface MoodSelectorProps {
  moods: Mood[];
  activeMoodSlug: string | null;
  onSelect: (slug: string | null) => void;
  isLoading?: boolean;
}

export function MoodSelector({
  moods,
  activeMoodSlug,
  onSelect,
  isLoading = false,
}: MoodSelectorProps) {
  const handleSelect = (slug: string) => {
    // Toggle: clicking active mood deselects it
    onSelect(activeMoodSlug === slug ? null : slug);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
          Browse by Vibe
        </h2>
        {activeMoodSlug && (
          <button
            onClick={() => onSelect(null)}
            className="font-body text-xs text-accent-primary hover:text-accent-primary/80 transition-colors focus-visible:outline-accent-primary"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
          role="group"
          aria-label="Mood categories"
        >
          {moods.map((mood, i) => (
            <MoodCard
              key={mood.slug}
              mood={mood}
              isActive={activeMoodSlug === mood.slug}
              onSelect={handleSelect}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
