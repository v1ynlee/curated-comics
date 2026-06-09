'use client';

// ============================================================
// UI Store — global UI state
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnimationTier, MoodType } from '@/types/ui';

export type Theme = 'dark' | 'light' | 'system';

interface UIState {
  navVisible: boolean;
  mobileMenuOpen: boolean;
  currentMood: MoodType | null;
  animationTier: AnimationTier;
  reducedMotion: boolean;
  theme: Theme;

  setNavVisible: (visible: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCurrentMood: (mood: MoodType | null) => void;
  setAnimationTier: (tier: AnimationTier) => void;
  setReducedMotion: (reduced: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      navVisible: true,
      mobileMenuOpen: false,
      currentMood: null,
      animationTier: 'high',
      reducedMotion: false,
      theme: 'dark',

      setNavVisible: (visible) => set({ navVisible: visible }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setCurrentMood: (mood) => set({ currentMood: mood }),
      setAnimationTier: (tier) => set({ animationTier: tier }),
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'cc-ui-store',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
