'use client';

// ============================================================
// CreatorDetailClient — /creators/[slug] body
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { TitleCard } from '@/components/library/TitleCard';
import { TitleCardSkeleton } from '@/components/ui/Skeleton';
import { useCreatorProfile } from '@/hooks/useCreators';
import { cn } from '@/lib/utils/cn';
import { formatCreatorRoles, getCreatorImage, getCreatorInitials } from './creator-display';

interface CreatorDetailClientProps {
  slug: string;
}

function CreatorDetailSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="aspect-square animate-shimmer rounded-lg bg-surface-elevated" />
        <div className="flex flex-col justify-center gap-4">
          <div className="h-10 w-64 animate-shimmer rounded-sm bg-surface-elevated" />
          <div className="h-4 w-36 animate-shimmer rounded-sm bg-surface-elevated" />
          <div className="h-4 w-full max-w-xl animate-shimmer rounded-sm bg-surface-elevated" />
          <div className="h-4 w-4/5 max-w-lg animate-shimmer rounded-sm bg-surface-elevated" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <TitleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function CreatorDetailClient({ slug }: CreatorDetailClientProps) {
  const { data: profile, isLoading, isError } = useCreatorProfile(slug);

  if (isLoading) return <CreatorDetailSkeleton />;

  if (isError) {
    return (
      <div className="state-empty">
        <p className="font-body text-text-secondary">Could not load this creator.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="state-empty">
        <p className="font-heading text-lg text-text-primary">Creator not found</p>
        <Link href="/creators" className="font-body text-sm text-accent-primary hover:text-text-primary">
          Back to creators
        </Link>
      </div>
    );
  }

  const { creator, titles } = profile;
  const image = getCreatorImage(creator);

  return (
    <div className="flex flex-col gap-12">
      <Link
        href="/creators"
        className="inline-flex w-fit items-center gap-2 font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Creators
      </Link>

      <motion.header
        className="grid gap-6 md:grid-cols-[280px_1fr] md:items-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-surface-elevated">
          {image ? (
            <Image
              src={image}
              alt={`${creator.name} portrait placeholder`}
              fill
              sizes="(max-width: 768px) 100vw, 280px"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-heading text-5xl text-text-tertiary">
              {getCreatorInitials(creator.name)}
            </div>
          )}
        </div>

        <div className="flex max-w-3xl flex-col gap-4">
          <div>
            <p className="mb-2 font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary">
              {formatCreatorRoles(creator.roles)}
            </p>
            <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-none text-text-primary">
              {creator.name}
            </h1>
          </div>

          {creator.description && (
            <p className="max-w-2xl font-body text-base leading-relaxed text-text-secondary md:text-lg">
              {creator.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-data text-text-tertiary">
              {creator.titleCount} title{creator.titleCount === 1 ? '' : 's'} in library
            </span>
            {creator.website && (
              <a
                href={creator.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-accent-primary transition-colors hover:text-text-primary"
              >
                Website
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </motion.header>

      <section aria-labelledby="creator-titles-heading" className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="creator-titles-heading" className="font-heading text-sm font-semibold tracking-wide text-text-primary">
            Titles
          </h2>
          <span className="font-data text-xs text-text-tertiary">
            {titles.length} result{titles.length === 1 ? '' : 's'}
          </span>
        </div>

        {titles.length === 0 ? (
          <div className="state-empty">
            <p className="font-body text-text-secondary">No public titles are linked to this creator yet.</p>
          </div>
        ) : (
          <motion.ul
            role="list"
            aria-label={`${creator.name} titles`}
            className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {titles.map(({ title }, index) => (
              <li key={title.id}>
                <TitleCard title={title} index={index} />
              </li>
            ))}
          </motion.ul>
        )}
      </section>
    </div>
  );
}
