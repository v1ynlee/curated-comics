'use client';

// ============================================================
// TanStack Query hooks for titles
// Source of truth: docs/architecture/COMPONENT_ARCHITECTURE.md
// ============================================================

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTitles,
  fetchTitle,
  fetchFeaturedTitles,
  fetchRelatedTitles,
  type FetchTitlesOptions,
} from '@/services/titles';
import { keepPreviousData } from '@tanstack/react-query';

// ── Query keys ────────────────────────────────────────────────

export const titleKeys = {
  all: ['titles'] as const,
  lists: () => [...titleKeys.all, 'list'] as const,
  list: (opts: FetchTitlesOptions) => [...titleKeys.lists(), opts] as const,
  featured: () => [...titleKeys.all, 'featured'] as const,
  details: () => [...titleKeys.all, 'detail'] as const,
  detail: (slug: string) => [...titleKeys.details(), slug] as const,
  related: (id: string) => [...titleKeys.all, 'related', id] as const,
};

// ── Hooks ─────────────────────────────────────────────────────

/**
 * Paginated, filtered title list.
 * Uses keepPreviousData for smooth filter transitions.
 */
export function useTitles(opts: FetchTitlesOptions = {}) {
  return useQuery({
    queryKey: titleKeys.list(opts),
    queryFn: () => fetchTitles(opts),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Featured titles for the landing page.
 */
export function useFeaturedTitles(limit = 6) {
  return useQuery({
    queryKey: titleKeys.featured(),
    queryFn: () => fetchFeaturedTitles(limit),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Single title by slug.
 */
export function useTitle(slug: string) {
  return useQuery({
    queryKey: titleKeys.detail(slug),
    queryFn: () => fetchTitle(slug),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(slug),
  });
}

/**
 * Related titles for a given title.
 */
export function useRelatedTitles(titleId: string, genreSlugs: string[]) {
  return useQuery({
    queryKey: titleKeys.related(titleId),
    queryFn: () => fetchRelatedTitles(titleId, genreSlugs),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(titleId),
  });
}

/**
 * Prefetch a title on hover for instant navigation.
 */
export function usePrefetchTitle() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: titleKeys.detail(slug),
      queryFn: () => fetchTitle(slug),
      staleTime: 10 * 60 * 1000,
    });
  };
}
