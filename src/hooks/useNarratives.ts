'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchHomepageNarratives } from '@/services/public/narratives';

export const narrativeKeys = {
  all: ['narratives'] as const,
  homepage: () => [...narrativeKeys.all, 'homepage'] as const,
};

export function useHomepageNarratives() {
  return useQuery({
    queryKey: narrativeKeys.homepage(),
    queryFn: fetchHomepageNarratives,
    staleTime: 10 * 60 * 1000,
  });
}
