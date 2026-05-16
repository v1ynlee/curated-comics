'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTierGroups } from '@/services/public/tiers';

export const tierKeys = {
  all: ['tiers'] as const,
  groups: () => [...tierKeys.all, 'groups'] as const,
};

export function useTierGroups() {
  return useQuery({
    queryKey: tierKeys.groups(),
    queryFn: fetchTierGroups,
    staleTime: 10 * 60 * 1000,
  });
}
