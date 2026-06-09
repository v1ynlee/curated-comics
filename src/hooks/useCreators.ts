'use client';

// ============================================================
// TanStack Query hooks for creators
// ============================================================

import { useQuery } from '@tanstack/react-query';
import {
  fetchCreatorProfile,
  fetchCreators,
  fetchFeaturedCreators,
} from '@/services/public/creators';

export const creatorKeys = {
  all: ['creators'] as const,
  lists: () => [...creatorKeys.all, 'list'] as const,
  list: () => [...creatorKeys.lists()] as const,
  featured: (limit: number) => [...creatorKeys.all, 'featured', limit] as const,
  profiles: () => [...creatorKeys.all, 'profile'] as const,
  profile: (slug: string) => [...creatorKeys.profiles(), slug] as const,
};

export function useCreators() {
  return useQuery({
    queryKey: creatorKeys.list(),
    queryFn: fetchCreators,
    staleTime: 15 * 60 * 1000,
  });
}

export function useFeaturedCreators(limit = 4) {
  return useQuery({
    queryKey: creatorKeys.featured(limit),
    queryFn: () => fetchFeaturedCreators(limit),
    staleTime: 15 * 60 * 1000,
  });
}

export function useCreatorProfile(slug: string) {
  return useQuery({
    queryKey: creatorKeys.profile(slug),
    queryFn: () => fetchCreatorProfile(slug),
    staleTime: 15 * 60 * 1000,
    enabled: Boolean(slug),
  });
}
