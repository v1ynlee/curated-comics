'use client';

// ============================================================
// Library Store — browsing state
// Source of truth: docs/architecture/COMPONENT_ARCHITECTURE.md
// ============================================================

import { create } from 'zustand';
import type { CategoryType, SortOption, ViewMode } from '@/types/library';

interface LibraryState {
  // Filters
  activeCategory: CategoryType;
  activeGenres: string[];
  activeMoods: string[];
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';

  // View
  viewMode: ViewMode;

  // Actions
  setCategory: (category: CategoryType) => void;
  toggleGenre: (genre: string) => void;
  toggleMood: (mood: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setSortDirection: (dir: 'asc' | 'desc') => void;
  setViewMode: (mode: ViewMode) => void;
  resetFilters: () => void;
}

const defaultState = {
  activeCategory: 'all' as CategoryType,
  activeGenres: [] as string[],
  activeMoods: [] as string[],
  searchQuery: '',
  sortBy: 'recent-read' as SortOption,
  sortDirection: 'desc' as const,
  viewMode: 'grid' as ViewMode,
};

export const useLibraryStore = create<LibraryState>((set) => ({
  ...defaultState,

  setCategory: (category) => set({ activeCategory: category }),

  toggleGenre: (genre) =>
    set((state) => ({
      activeGenres: state.activeGenres.includes(genre)
        ? state.activeGenres.filter((g) => g !== genre)
        : [...state.activeGenres, genre],
    })),

  toggleMood: (mood) =>
    set((state) => ({
      activeMoods: state.activeMoods.includes(mood)
        ? state.activeMoods.filter((m) => m !== mood)
        : [...state.activeMoods, mood],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortDirection: (dir) => set({ sortDirection: dir }),
  setViewMode: (mode) => set({ viewMode: mode }),
  resetFilters: () => set(defaultState),
}));
