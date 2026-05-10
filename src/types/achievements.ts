// ============================================================
// Achievement / Badge Types
// Source of truth: docs/architecture/CONTENT_STRUCTURE.md
// ============================================================

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type AchievementConditionType =
  | 'count'
  | 'genre'
  | 'rating'
  | 'streak'
  | 'special';

export interface AchievementCondition {
  type: AchievementConditionType;
  target: number;
  current: number;
  filter?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  progress: number; // 0–100
  unlocked: boolean;
  unlockedDate?: string;
  rarity: AchievementRarity;
  color: string;
  glowEffect: boolean;
}
