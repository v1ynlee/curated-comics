'use client';

// ============================================================
// RelatedTitles — horizontal scroll carousel of related titles
// Source of truth: docs/design/UI_UX_DIRECTION.md
// ============================================================

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { TitleCard } from '@/components/library/TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { useRelatedTitles } from '@/hooks/useTitles';

interface RelatedTitlesProps {
  titleId: string;
  genreSlugs: string[];
  className?: string;
}

export function RelatedTitles({ titleId, genreSlugs, className }: RelatedTitlesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: titles, isLoading } = useRelatedTitles(titleId, genreSlugs);

  if (!isLoading && (!titles || titles.length === 0)) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className={cn('flex flex-col gap-4', className)}
    >
      <h2
        id="related-heading"
        className="font-heading text-sm uppercase tracking-[0.2em] text-text-tertiary"
      >
        You Might Also Like
      </h2>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        role="list"
        aria-label="Related titles"
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-36 shrink-0 snap-start">
                <TitleCardSkeleton />
              </div>
            ))
          : titles?.map((title, i) => (
              <div key={title.id} className="w-36 shrink-0 snap-start" role="listitem">
                <TitleCard title={title} index={i} />
              </div>
            ))}
      </div>
    </section>
  );
}
