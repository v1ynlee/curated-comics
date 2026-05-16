'use client';

// ============================================================
// TitleCard — individual title card with blur-up image + tilt
// Source of truth: docs/design/UI_UX_DIRECTION.md
//                  docs/motion/MOTION_SYSTEM.md — Card Interaction
//                  docs/motion/ANIMATION_GUIDELINES.md — Rule 7
// ============================================================

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Tag } from '@/components/ui/Tag';
import { CoverImage } from '@/components/ui/CoverImage';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePrefetchTitle } from '@/hooks/useTitles';
import { useCardTilt } from '@/hooks/useCardTilt';
import { formatRating } from '@/lib/utils/utils';
import { TIER_CONFIG } from '@/types/title';
import type { Title } from '@/types/title';

interface TitleCardProps {
  title: Title;
  index?: number;
  /** Show larger featured treatment */
  featured?: boolean;
  className?: string;
}

export function TitleCard({
  title,
  index = 0,
  featured = false,
  className,
}: TitleCardProps) {
  const prefersReduced = usePrefersReducedMotion();
  const prefetchTitle = usePrefetchTitle();
  const { tiltStyle, handlers } = useCardTilt(6);

  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;
  const overallRating = title.ratings?.overall;

  return (
    <motion.article
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        delay: Math.min(index * 0.05, 0.4),
        duration: 0.5,
        ease: [0.0, 0.0, 0.2, 1.0],
      }}
      className={cn('group relative flex flex-col', className)}
      aria-label={title.titleEnglish}
      style={tiltStyle}
      onMouseMove={handlers.onMouseMove as React.MouseEventHandler<HTMLElement>}
      onMouseEnter={handlers.onMouseEnter as React.MouseEventHandler<HTMLElement>}
      onMouseLeave={handlers.onMouseLeave as React.MouseEventHandler<HTMLElement>}
    >
      <Link
        href={`/title/${title.slug}`}
        className="flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 rounded-sm"
        onMouseEnter={() => prefetchTitle(title.slug)}
        onFocus={() => prefetchTitle(title.slug)}
      >
        {/* Cover image */}
        <div className="relative overflow-hidden rounded-lg">
          <CoverImage
            slug={title.coverImage?.slug ?? title.slug}
            alt={`${title.titleEnglish} cover`}
            blurDataURL={title.coverImage?.blurDataURL}
            dominantColor={title.coverImage?.dominantColor}
            origin={title.origin}
            tier={title.tier}
            rounded
            className={cn(
              'w-full transition-transform duration-500',
              'group-hover:scale-[1.03]',
            )}
            sizes={
              featured
                ? '(max-width: 768px) 100vw, 50vw'
                : '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
            }
          />

          {/* Hover overlay */}
          <div
            className={cn(
              'absolute inset-0 flex flex-col justify-end p-3',
              'bg-gradient-to-t from-bg-deep/90 via-bg-deep/30 to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            )}
            aria-hidden="true"
          >
            {/* Rating */}
            {overallRating !== undefined && (
              <span className="font-data text-sm font-medium text-text-accent">
                {formatRating(overallRating)}
                <span className="text-text-tertiary text-xs"> / 10</span>
              </span>
            )}

            {/* Top genres */}
            <div className="flex flex-wrap gap-1 mt-1">
              {title.genres.slice(0, 2).map((genre) => (
                <Tag
                  key={genre.slug}
                  label={genre.name}
                  color={genre.color}
                  size="xs"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info below image */}
        <div className="flex flex-col gap-0.5 px-0.5">
          <h3
            className={cn(
              'font-body font-semibold text-text-primary leading-snug',
              featured ? 'text-lg' : 'text-sm',
              'line-clamp-2',
            )}
          >
            {title.titleEnglish}
          </h3>

          <div className="flex items-center gap-2">
            <span className="font-heading text-[10px] uppercase tracking-widest text-text-tertiary">
              {title.origin}
            </span>
            {title.chaptersRead > 0 && (
              <>
                <span className="text-text-tertiary/40 text-[10px]">·</span>
                <span className="font-data text-[10px] text-text-tertiary">
                  {title.chaptersRead} ch
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
