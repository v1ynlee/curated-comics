'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchReadingStatistics } from '@/services/stats';
import { fetchAchievements } from '@/services/achievements';

export const statsKeys = {
  all: ['stats'] as const,
  reading: () => [...statsKeys.all, 'reading'] as const,
  achievements: () => [...statsKeys.all, 'achievements'] as const,
};

export function useReadingStatistics() {
  return useQuery({
    queryKey: statsKeys.reading(),
    queryFn: fetchReadingStatistics,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: statsKeys.achievements(),
    queryFn: fetchAchievements,
    staleTime: 10 * 60 * 1000,
  });
}
