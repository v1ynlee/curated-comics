// ============================================================
// UI State Types
// Source of truth: docs/architecture/COMPONENT_ARCHITECTURE.md
// ============================================================

import type { Mood } from './title';

export type AnimationTier = 'low' | 'mid' | 'high';

export type MoodType = Mood['slug'];

export interface UIState {
  navVisible: boolean;
  mobileMenuOpen: boolean;
  currentMood: MoodType | null;
  animationTier: AnimationTier;
  reducedMotion: boolean;
}
