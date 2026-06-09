'use client';

// ============================================================
// FeaturedCreatorsSection — homepage creator universe showcase
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { CoverImage } from '@/components/ui/CoverImage';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useFeaturedCreators } from '@/hooks/useCreators';
import { cn } from '@/lib/utils/cn';
import { formatCreatorRoles, getCreatorImage, getCreatorInitials } from './creator-display';
import type { Creator, CreatorWork } from '@/types/creator';

interface NodePosition {
  className: string;
  x: number;
  y: number;
  color: string;
}

type ShowcaseItem =
  | (CreatorWork & { kind: 'work'; imageUrl?: never; initials?: never })
  | { kind: 'portrait'; id: string; title: string; imageUrl?: string; initials: string; coverSlug?: never; dominantColor?: string };

const NODE_POSITIONS: NodePosition[] = [
  { className: 'left-[6%] top-[10%] md:left-[18%] md:top-[8%]', x: 18, y: 8, color: 'var(--app-accent-primary)' },
  { className: 'right-[3%] top-[18%] md:right-[18%] md:top-[16%]', x: 82, y: 16, color: 'var(--app-accent-secondary)' },
  { className: 'right-[2%] top-[48%] md:right-[5%] md:top-[46%]', x: 95, y: 46, color: 'var(--app-accent-tertiary)' },
  { className: 'bottom-[17%] right-[5%] md:bottom-[18%] md:right-[18%]', x: 82, y: 82, color: 'var(--app-accent-primary)' },
  { className: 'bottom-[7%] left-[8%] md:bottom-[8%] md:left-[28%]', x: 28, y: 92, color: 'var(--app-accent-secondary)' },
  { className: 'left-[2%] top-[46%] md:left-[5%] md:top-[45%]', x: 5, y: 45, color: 'var(--app-accent-tertiary)' },
];

const CARD_TRANSFORMS = [
  'translateX(-30%) rotateY(-10deg) scale(0.9)',
  'translateX(0) rotateY(0deg) scale(1)',
  'translateX(30%) rotateY(10deg) scale(0.9)',
];

function getShowcaseItems(creator: Creator): ShowcaseItem[] {
  const works = creator.works ?? [];
  if (works.length > 0) {
    return Array.from({ length: 3 }, (_, index) => ({ ...works[index % works.length], kind: 'work' }));
  }

  const fallback = {
    kind: 'portrait' as const,
    id: `${creator.id}-portrait`,
    title: creator.name,
    imageUrl: getCreatorImage(creator),
    initials: getCreatorInitials(creator.name),
  };
  return [fallback, fallback, fallback];
}

function CreatorUniverseSkeleton() {
  return (
    <div className="relative mx-auto flex h-[680px] w-full max-w-6xl items-center justify-center md:h-[600px]" aria-hidden="true">
      <div className="creator-universe-center absolute z-20 flex h-72 w-72 items-center justify-center rounded-full md:h-96 md:w-96">
        <div className="absolute h-[180px] w-[120px] -translate-x-[30%] scale-90 animate-shimmer rounded-xl bg-bg-surface/70 md:h-[260px] md:w-[180px]" />
        <div className="absolute z-10 h-[200px] w-[140px] animate-shimmer rounded-xl bg-bg-surface/80 md:h-[280px] md:w-[200px]" />
        <div className="absolute h-[180px] w-[120px] translate-x-[30%] scale-90 animate-shimmer rounded-xl bg-bg-surface/70 md:h-[260px] md:w-[180px]" />
      </div>
      {NODE_POSITIONS.map((position, index) => (
        <div key={index} className={cn('absolute h-12 w-40 animate-shimmer rounded-full bg-bg-surface/70', position.className)} />
      ))}
    </div>
  );
}

function CreatorAvatar({ creator, active }: { creator: Creator; active: boolean }) {
  const image = getCreatorImage(creator);

  return (
    <span
      className={cn(
        'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-bg-surface md:h-10 md:w-10',
        active ? 'border-accent-primary/70' : 'border-white/10',
      )}
      aria-hidden="true"
    >
      {image ? (
        <Image src={image} alt="" fill sizes="40px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-heading text-[10px] text-text-secondary">
          {getCreatorInitials(creator.name)}
        </span>
      )}
    </span>
  );
}

function CreatorWorkCard({ item, index, activeCreator }: { item: ShowcaseItem; index: number; activeCreator: Creator }) {
  const isPrimary = index === 1;

  return (
    <div
      className={cn(
        'creator-universe-glass absolute overflow-hidden rounded-xl border transition-all duration-500',
        isPrimary
          ? 'z-30 border-accent-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.24)]'
          : 'z-10 border-white/10 opacity-80 shadow-2xl',
      )}
      style={{ transform: CARD_TRANSFORMS[index] }}
    >
      <div className={cn('relative', isPrimary ? 'h-[220px] w-[156px] md:h-[280px] md:w-[200px]' : 'h-[205px] w-[142px] md:h-[260px] md:w-[180px]')}>
        {item.kind === 'work' ? (
          <CoverImage
            slug={item.coverSlug}
            alt={item.title}
            dominantColor={item.dominantColor}
            origin={item.origin}
            tier={item.tier}
            sizes={isPrimary ? '(max-width: 768px) 156px, 200px' : '(max-width: 768px) 142px, 180px'}
            className="h-full w-full"
          />
        ) : item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={`${activeCreator.name} portrait`}
            fill
            sizes={isPrimary ? '(max-width: 768px) 156px, 200px' : '(max-width: 768px) 142px, 180px'}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-surface font-heading text-3xl text-text-secondary">
            {item.initials}
          </div>
        )}
      </div>
    </div>
  );
}

function CreatorUniverse({ creators }: { creators: Creator[] }) {
  const prefersReduced = usePrefersReducedMotion();
  const [activeCreatorId, setActiveCreatorId] = useState<string | null>(null);
  const visibleCreators = creators.slice(0, NODE_POSITIONS.length);
  const activeCreator = visibleCreators.find((creator) => creator.id === activeCreatorId) ?? visibleCreators[0];

  if (!activeCreator) return null;

  const activeIndex = Math.max(0, visibleCreators.findIndex((creator) => creator.id === activeCreator.id));
  const activePosition = NODE_POSITIONS[activeIndex];
  const activeItems = getShowcaseItems(activeCreator);

  return (
    <div className="relative mx-auto h-[680px] w-full max-w-6xl md:h-[600px]">
      <svg className="absolute inset-0 z-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {visibleCreators.map((creator, index) => {
          const position = NODE_POSITIONS[index];
          const active = creator.id === activeCreator.id;
          return (
            <line
              key={creator.id}
              x1="50"
              y1="50"
              x2={position.x}
              y2={position.y}
              stroke={active ? 'color-mix(in srgb, var(--app-accent-primary) 70%, transparent)' : 'color-mix(in srgb, var(--app-text-primary) 14%, transparent)'}
              strokeWidth={active ? 2 : 1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {visibleCreators.map((creator, index) => {
        const position = NODE_POSITIONS[index];
        const active = creator.id === activeCreator.id;

        return (
          <button
            key={creator.id}
            type="button"
            onMouseEnter={() => setActiveCreatorId(creator.id)}
            onFocus={() => setActiveCreatorId(creator.id)}
            className={cn(
              'absolute z-20 flex cursor-pointer items-center gap-2 rounded-full border py-2 pl-2 pr-3 text-left backdrop-blur-md transition-all duration-300 md:pr-5',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              active
                ? 'scale-105 border-accent-primary/80 bg-bg-surface/90 shadow-[0_0_20px_rgba(139,92,246,0.28)] md:scale-110'
                : 'border-white/10 bg-bg-surface/70 hover:border-accent-primary/60 hover:shadow-[0_0_16px_rgba(139,92,246,0.18)]',
              position.className,
            )}
            aria-pressed={active}
            aria-label={`Show works by ${creator.name}`}
          >
            <CreatorAvatar creator={creator} active={active} />
            <span className="max-w-[8.5rem] truncate font-heading text-sm font-semibold text-text-primary md:max-w-none md:text-xl">
              {creator.name}
            </span>
          </button>
        );
      })}

      <div className="creator-universe-center absolute left-1/2 top-1/2 z-10 flex h-72 w-72 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full [perspective:1000px] md:h-96 md:w-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCreator.id}
            className="relative flex h-full w-full items-center justify-center transition-all duration-500"
            initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ duration: prefersReduced ? 0 : 0.3, ease: 'easeOut' }}
          >
            {activeItems.map((item, index) => (
              <CreatorWorkCard key={`${activeCreator.id}-${item.id}-${index}`} item={item} index={index} activeCreator={activeCreator} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 w-[min(92vw,34rem)] -translate-x-1/2 text-center md:bottom-0">
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-text-tertiary">
          {formatCreatorRoles(activeCreator.roles)}
        </p>
        <p className="mt-2 font-body text-sm leading-relaxed text-text-secondary">
          {activeCreator.description ?? `${activeCreator.name} has ${activeCreator.titleCount} linked titles in the library.`}
        </p>
      </div>

      {activePosition && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] transition-colors duration-700"
          style={{ background: `radial-gradient(circle, color-mix(in srgb, ${activePosition.color} 13%, transparent) 0%, transparent 70%)` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function FeaturedCreatorsSection() {
  const { data: creators = [], isLoading, isError } = useFeaturedCreators(6);
  const hasCreators = creators.length > 0;

  return (
    <section aria-labelledby="featured-creators-heading" className="creator-universe-section relative min-h-[900px] w-full overflow-hidden py-20 pt-32 text-text-primary">
      <div className="creator-universe-boundary creator-universe-boundary-top" aria-hidden="true" />
      <div className="creator-universe-boundary creator-universe-boundary-bottom" aria-hidden="true" />
      <div className="creator-universe-divider top-0" aria-hidden="true" />
      <div className="creator-universe-divider bottom-0" aria-hidden="true" />
      <div className="creator-universe-particle left-[15%] top-[20%] h-2 w-2" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="creator-universe-particle left-[80%] top-[60%] h-3 w-3" style={{ animationDelay: '2s' }} aria-hidden="true" />
      <div className="creator-universe-particle left-[30%] top-[80%] h-1 w-1" style={{ animationDelay: '5s' }} aria-hidden="true" />

      <div className="container-content relative z-10 mb-16 text-center">
        <h2 id="featured-creators-heading" className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-[-0.02em] text-text-primary">
          Explore Worlds by Their Creators
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-body text-base leading-6 text-text-secondary">
          Discover stories through the artists, authors, and studios behind them.
        </p>
      </div>

      <div className="container-content relative z-10">
        {isLoading ? (
          <CreatorUniverseSkeleton />
        ) : isError ? (
          <div className="state-empty">
            <p className="font-body text-text-secondary">Could not load featured creators.</p>
          </div>
        ) : hasCreators ? (
          <CreatorUniverse creators={creators} />
        ) : (
          <div className="state-empty">
            <p className="font-body text-text-secondary">Creator profiles are being curated.</p>
          </div>
        )}
      </div>

      {hasCreators && (
        <div className="relative z-20 mt-12 flex justify-center">
          <Link
            href="/creators"
            className="creator-universe-glass flex items-center gap-2 rounded-full border border-accent-primary/30 px-8 py-4 font-heading text-sm font-semibold text-accent-primary transition-all duration-300 hover:bg-accent-primary/10 hover:shadow-[0_0_30px_rgba(139,92,246,0.28)] focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
          >
            Explore All Creators
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
