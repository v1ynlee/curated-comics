'use client';

// ============================================================
// RelatedTitles — immersive, curated recommendation list
// ============================================================

import { cn } from '@/lib/utils/cn';
import { useRelatedTitles } from '@/hooks/useTitles';
import { TIER_CONFIG } from '@/types/title';
import type { Title } from '@/types/title';
import Image from 'next/image';
import Link from 'next/link';

interface RelatedTitlesProps {
  titleId: string;
  genreSlugs: string[];
  className?: string;
}

function RelatedTitleRow({ title }: { title: Title }) {
  const coverSlug = title.coverImage?.slug ?? title.slug;

  return (
    <Link 
      href={`/title/${title.slug}`}
      className="group relative flex overflow-hidden rounded-xl bg-surface-elevated/10 border border-white/5 transition-all duration-500 hover:border-white/10 hover:bg-surface-elevated/20"
      role="listitem"
    >
      {/* Background Blur Overlay */}
      <div 
        className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-700"
        style={{
          backgroundImage: `url(/images/covers/${coverSlug}-640w.avif)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px)',
        }}
      />
      
      {/* Gradient to smooth out the background */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-surface via-bg-surface/90 to-bg-surface/40" />

      <div className="relative flex items-center gap-6 p-4 w-full">
        {/* Thumbnail */}
        <div className="relative w-16 md:w-20 aspect-[2/3] rounded-md overflow-hidden shrink-0 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
          <Image
            src={`/images/covers/${coverSlug}-640w.avif`}
            alt={title.titleEnglish}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 64px, 80px"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3">
            <span className="font-heading text-[9px] uppercase tracking-widest text-text-tertiary">
              {title.origin}
            </span>
            {title.tier && TIER_CONFIG[title.tier] && (
               <span 
                 className="font-heading text-[9px] uppercase tracking-widest font-bold opacity-80" 
                 style={{ color: TIER_CONFIG[title.tier].color }}
               >
                 {title.tier} Tier
               </span>
            )}
          </div>
          <h3 className="font-display text-lg md:text-xl font-bold text-text-secondary group-hover:text-text-primary transition-colors truncate">
            {title.titleEnglish}
          </h3>
          <p className="font-body text-xs text-text-tertiary line-clamp-1 md:line-clamp-2 mt-1">
            {title.synopsis || title.genres.map(g => g.name).join(', ')}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function RelatedTitles({ titleId, genreSlugs, className }: RelatedTitlesProps) {
  const { data: titles, isLoading } = useRelatedTitles(titleId, genreSlugs);

  if (!isLoading && (!titles || titles.length === 0)) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className={cn('flex flex-col gap-6', className)}
    >
      <div className="flex items-center gap-3 mb-2">
        <h2
          id="related-heading"
          className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary"
        >
          Curated For You
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        role="list"
        aria-label="Related titles"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-surface-elevated/20 animate-pulse border border-white/5" />
            ))
          : titles?.slice(0, 4).map((title) => (
              <RelatedTitleRow key={title.id} title={title} />
            ))}
      </div>
    </section>
  );
}
