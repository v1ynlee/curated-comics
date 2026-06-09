'use client';

// ============================================================
// VibeBadge — animated glowing badge (top-left of card)
//
// Design: bold uppercase text with pulsing neon glow animation
// No pill background — typography-forward, cinematic feel
// ============================================================

import { cn } from '@/lib/utils/cn';
import type { VibeBadge } from '@/types/title';

const BADGE_COLOR: Record<VibeBadge, string> = {
  NEW:      '#fbbf24',
  TRENDING: '#22d3ee',
  PEAK:     '#c084fc',
  CURSED:   '#f87171',
};

interface VibeBadgeProps {
  badge: VibeBadge;
  className?: string;
}

export function VibeBadge({ badge, className }: VibeBadgeProps) {
  const color = BADGE_COLOR[badge];

  return (
    <span
      className={cn('vibe-badge-glow', className)}
      style={{ '--badge-color': color } as React.CSSProperties}
      aria-label={`Status: ${badge}`}
    >
      {badge}
    </span>
  );
}
