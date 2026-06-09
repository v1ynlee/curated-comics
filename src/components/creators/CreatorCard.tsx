'use client';

// ============================================================
// CreatorCard — public creator preview card
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { formatCreatorRoles, getCreatorImage, getCreatorInitials } from './creator-display';
import type { Creator } from '@/types/creator';

interface CreatorCardProps {
  creator: Creator;
  index?: number;
  featured?: boolean;
  className?: string;
}

export function CreatorCard({ creator, index = 0, featured = false, className }: CreatorCardProps) {
  const prefersReduced = usePrefersReducedMotion();
  const image = getCreatorImage(creator);

  return (
    <motion.article
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group h-full', className)}
    >
      <Link
        href={`/creators/${creator.slug}`}
        className={cn(
          'flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-surface-elevated/35',
          'transition-colors duration-200 hover:border-text-primary/20 hover:bg-surface-elevated/50',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
      >
        <div className={cn('relative overflow-hidden bg-bg-surface', featured ? 'aspect-[16/10]' : 'aspect-[4/3]')}>
          {image ? (
            <Image
              src={image}
              alt={`${creator.name} portrait placeholder`}
              fill
              sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-surface text-3xl font-heading text-text-tertiary">
              {getCreatorInitials(creator.name)}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-deep/80 to-transparent" aria-hidden="true" />
        </div>

        <div className={cn('flex flex-1 flex-col gap-3 p-4', featured && 'md:p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={cn('font-body font-semibold leading-tight text-text-primary', featured ? 'text-xl' : 'text-base')}>
                {creator.name}
              </h3>
              <p className="mt-1 font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                {formatCreatorRoles(creator.roles)}
              </p>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary" aria-hidden="true" />
          </div>

          {creator.description && (
            <p className={cn('font-body text-sm leading-relaxed text-text-secondary', featured ? 'line-clamp-3' : 'line-clamp-2')}>
              {creator.description}
            </p>
          )}

          <p className="mt-auto font-data text-xs text-text-tertiary">
            {creator.titleCount} title{creator.titleCount === 1 ? '' : 's'}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}

export function CreatorCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-surface-elevated/25">
      <div className={cn('animate-shimmer bg-surface-elevated', featured ? 'aspect-[16/10]' : 'aspect-[4/3]')} />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-2/3 animate-shimmer rounded-sm bg-surface-elevated" />
        <div className="h-3 w-24 animate-shimmer rounded-sm bg-surface-elevated" />
        <div className="h-3 w-full animate-shimmer rounded-sm bg-surface-elevated" />
        <div className="h-3 w-4/5 animate-shimmer rounded-sm bg-surface-elevated" />
      </div>
    </div>
  );
}
