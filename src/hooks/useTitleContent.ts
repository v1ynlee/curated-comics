'use client';

// ============================================================
// useTitleContent — hooks for gallery and characters
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { fetchTitleGallery, fetchTitleCharacters } from '@/services/public/titleContent';

export function useTitleGallery(titleId: string) {
  return useQuery({
    queryKey: ['title-gallery', titleId],
    queryFn: () => fetchTitleGallery(titleId),
    staleTime: 1000 * 60 * 10, // 10 min
    enabled: !!titleId,
  });
}

export function useTitleCharacters(titleId: string) {
  return useQuery({
    queryKey: ['title-characters', titleId],
    queryFn: () => fetchTitleCharacters(titleId),
    staleTime: 1000 * 60 * 10,
    enabled: !!titleId,
  });
}
