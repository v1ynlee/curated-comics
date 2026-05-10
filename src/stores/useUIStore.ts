'use client';

// ============================================================
// UI Store — global UI state
// Source of truth: docs/architecture/COMPONENT_ARCHITECTURE.md
// ============================================================

import { create } from 'zustand';
import type { AnimationTier, MoodType } from '@/types/ui';

interface UIState {
  // Navigation
  navVisible: boolean;
  mobileMenuOpen: boolean;

  // Mood atmosphere
  currentMood: MoodType | null;

  // Performance / accessibility
  animationTier: AnimationTier;
  reducedMotion: boolean;

  // Actions
  setNavVisible: (visible: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCurrentMood: (mood: MoodType | null) => void;
  setAnimationTier: (tier: AnimationTier) => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  navVisible: true,
  mobileMenuOpen: false,
  currentMood: null,
  animationTier: 'high',
  reducedMotion: false,

  setNavVisible: (visible) => set({ navVisible: visible }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setCurrentMood: (mood) => set({ currentMood: mood }),
  setAnimationTier: (tier) => set({ animationTier: tier }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
}));
