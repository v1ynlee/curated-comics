'use client';

// ============================================================
// TanStack Query hooks for moods
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { fetchMoods, fetchMood } from '@/services/moods';

export const moodKeys = {
  all: ['moods'] as const,
  list: () => [...moodKeys.all, 'list'] as const,
  detail: (slug: string) => [...moodKeys.all, 'detail', slug] as const,
};

export function useMoods() {
  return useQuery({
    queryKey: moodKeys.list(),
    queryFn: fetchMoods,
    staleTime: 30 * 60 * 1000, // Moods rarely change
  });
}

export function useMood(slug: string) {
  return useQuery({
    queryKey: moodKeys.detail(slug),
    queryFn: () => fetchMood(slug),
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(slug),
  });
}
