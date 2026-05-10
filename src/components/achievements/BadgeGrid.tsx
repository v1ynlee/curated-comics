'use client';

// ============================================================
// BadgeGrid — achievement showcase with rarity grouping
// Source of truth: docs/design/UI_UX_DIRECTION.md — Achievement Gallery
// ============================================================

import { cn } from '@/lib/cn';
import { BadgeCard } from './BadgeCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Achievement, AchievementRarity } from '@/types/achievements';

const RARITY_ORDER: AchievementRarity[] = ['legendary', 'epic', 'rare', 'common'];

const RARITY_LABELS: Record<AchievementRarity, string> = {
  legendary: 'Legendary',
  epic: 'Epic',
  rare: 'Rare',
  common: 'Common',
};

interface BadgeGridProps {
  achievements: Achievement[];
  isLoading?: boolean;
  className?: string;
}

export function BadgeGrid({ achievements, isLoading = false, className }: BadgeGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6', className)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl" aria-hidden="true">🏆</span>
        <p className="font-body text-text-secondary">No achievements yet.</p>
      </div>
    );
  }

  // Group by rarity
  const grouped = new Map<AchievementRarity, Achievement[]>();
  for (const rarity of RARITY_ORDER) {
    grouped.set(rarity, []);
  }
  for (const a of achievements) {
    grouped.get(a.rarity)?.push(a);
  }

  // Unlocked count
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Summary */}
      <div className="flex items-center gap-3">
        <span className="font-data text-2xl font-bold text-accent-primary">
          {unlockedCount}
        </span>
        <span className="font-body text-text-secondary text-sm">
          / {achievements.length} achievements unlocked
        </span>
      </div>

      {/* Rarity groups */}
      {RARITY_ORDER.map((rarity) => {
        const group = grouped.get(rarity) ?? [];
        if (group.length === 0) return null;

        return (
          <section key={rarity} aria-labelledby={`rarity-${rarity}`}>
            <h3
              id={`rarity-${rarity}`}
              className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary mb-3"
            >
              {RARITY_LABELS[rarity]}
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {group.map((achievement, i) => (
                <BadgeCard
                  key={achievement.id}
                  achievement={achievement}
                  index={i}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
