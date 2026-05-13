'use client';

// ============================================================
// TitleDetailClient — immersive title detail view
// ============================================================

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Trophy, Star, ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RatingDisplay } from '@/components/title/RatingDisplay';
import { ReviewSection } from '@/components/title/ReviewSection';
import { TitleMeta } from '@/components/title/TitleMeta';
import { RelatedTitles } from '@/components/title/RelatedTitles';
import { useUIStore } from '@/stores/useUIStore';
import { TIER_CONFIG } from '@/types/title';
import { PLATFORM_CONFIG } from '@/lib/constants';
import type { Title } from '@/types/title';

interface TitleDetailClientProps {
  title: Title;
}

// ── Read Dropdown ─────────────────────────────────────────────

function ReadDropdown({ links }: { links: Title['externalLinks'] }) {
  const [open, setOpen] = useState(false);

  if (links.length === 0) return null;

  // If only one link, render as a direct button
  if (links.length === 1) {
    const link = links[0];
    const platform = (PLATFORM_CONFIG as Record<string, { name: string; color: string }>)[link.platform] ?? {
      name: link.label ?? link.platform,
      color: '#8b5cf6',
    };
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg',
          'font-heading text-xs uppercase tracking-widest font-medium',
          'bg-gradient-to-br from-accent-primary to-[#6d28d9] text-white',
          'shadow-[0_2px_12px_rgba(139,92,246,0.4)]',
          'hover:shadow-[0_4px_20px_rgba(139,92,246,0.6)] hover:brightness-110',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
        aria-label={`Read on ${platform.name}`}
      >
        <BookOpen size={14} aria-hidden="true" />
        Read
        <ExternalLink size={11} className="opacity-70" aria-hidden="true" />
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg',
          'font-heading text-xs uppercase tracking-widest font-medium',
          'bg-gradient-to-br from-accent-primary to-[#6d28d9] text-white',
          'shadow-[0_2px_12px_rgba(139,92,246,0.4)]',
          'hover:shadow-[0_4px_20px_rgba(139,92,246,0.6)] hover:brightness-110',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
      >
        <BookOpen size={14} aria-hidden="true" />
        Read
        <ChevronDown
          size={12}
          aria-hidden="true"
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-overlay"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            {/* Dropdown */}
            <motion.ul
              role="listbox"
              aria-label="Reading platforms"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.0, 0.0, 0.2, 1.0] }}
              className={cn(
                'absolute left-0 top-full mt-2 z-modal',
                'min-w-[180px] rounded-lg overflow-hidden',
                'bg-bg-surface border border-white/10',
                'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
              )}
            >
              {links.map((link, i) => {
                const platform = (PLATFORM_CONFIG as Record<string, { name: string; color: string }>)[link.platform] ?? {
                  name: link.label ?? link.platform,
                  color: '#6B7280',
                };
                return (
                  <li key={i} role="option" aria-selected={false}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3',
                        'font-body text-sm text-text-secondary',
                        'hover:text-text-primary hover:bg-white/5',
                        'transition-colors duration-100',
                        'focus-visible:outline-2 focus-visible:outline-accent-primary',
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: platform.color }}
                        aria-hidden="true"
                      />
                      {link.label ?? platform.name}
                      <ExternalLink size={10} className="ml-auto opacity-40" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export function TitleDetailClient({ title }: TitleDetailClientProps) {
  const coverSlug = title.coverImage?.slug ?? title.slug;
  const dominantColor = title.coverImage?.dominantColor ?? '#1a1a2e';
  const theme = useUIStore((s) => s.theme);

  const backdropBg = theme === 'light'
    ? `color-mix(in srgb, ${dominantColor} 12%, var(--color-bg-deep))`
    : dominantColor;

  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;

  return (
    <article aria-labelledby="title-heading">

      {/* ── Blurred banner hero — top ~20% ─────────────────── */}
      <div
        className="relative h-[22vh] md:h-[28vh] overflow-hidden"
        aria-hidden="true"
      >
        {/* Cover image — heavily blurred, center-cropped */}
        <Image
          src={`/images/covers/${coverSlug}-1200w.avif`}
          alt=""
          fill
          priority
          className="object-cover object-center scale-110 blur-2xl"
          style={{ opacity: theme === 'light' ? 0.35 : 0.55 }}
          sizes="100vw"
        />
        {/* Tinted overlay using dominant color */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${dominantColor}60` }}
        />
        {/* Gradient fade to page bg at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              transparent 0%,
              color-mix(in srgb, var(--color-bg-deep) 60%, transparent) 70%,
              var(--color-bg-deep) 100%)`,
          }}
        />
      </div>

      {/* ── Cover + title info — overlaps the banner ───────── */}
      <div className="container-content -mt-24 md:-mt-32 pb-8 relative z-raised">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">

          {/* ── Cover art ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }}
            className="shrink-0 w-32 md:w-44 lg:w-52"
          >
            {/* Cover image with shadow */}
            <div
              className="relative rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                aspectRatio: '2/3',
                backgroundColor: theme === 'light'
                  ? `color-mix(in srgb, ${dominantColor} 20%, var(--color-bg-surface))`
                  : dominantColor,
              }}
            >
              <Image
                src={`/images/covers/${coverSlug}-640w.avif`}
                alt={`${title.titleEnglish} cover`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 128px, 208px"
              />
            </div>

            {/* Read button + tier + rating — below cover */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <ReadDropdown links={title.externalLinks} />

              {/* Tier */}
              {tierConfig && (
                <div
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
                  style={{
                    color: tierConfig.color,
                    backgroundColor: `${tierConfig.color}18`,
                    border: `1px solid ${tierConfig.color}35`,
                  }}
                  title={`Tier: ${tierConfig.label}`}
                >
                  <Trophy size={12} aria-hidden="true" />
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest">
                    {title.tier}
                  </span>
                </div>
              )}

              {/* Rating */}
              {title.ratings?.overall !== undefined && (
                <div
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
                  style={{
                    color: 'var(--color-accent-secondary)',
                    backgroundColor: 'color-mix(in srgb, var(--color-accent-secondary) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-accent-secondary) 30%, transparent)',
                  }}
                  role="meter"
                  aria-label={`Rating: ${title.ratings.overall.toFixed(1)} out of 10`}
                  aria-valuenow={title.ratings.overall}
                  aria-valuemin={1}
                  aria-valuemax={10}
                >
                  <Star size={12} aria-hidden="true" />
                  <span className="font-data text-[11px] font-bold">
                    {title.ratings.overall.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Title info ─────────────────────────────────── */}
          <div className="flex flex-col gap-3 flex-1 min-w-0 pt-2 md:pt-8">
            {/* Origin label */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary"
            >
              {title.origin}
            </motion.span>

            {/* Main title */}
            <motion.h1
              id="title-heading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }}
              className="font-display text-[clamp(1.75rem,4.5vw,3rem)] font-bold text-text-primary leading-tight"
            >
              {title.titleEnglish}
            </motion.h1>

            {/* Alternative titles — original + aliases */}
            {(title.titleOriginal || (title.titleAlternative && title.titleAlternative.length > 0)) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="font-body text-sm text-text-tertiary leading-relaxed"
                lang={
                  title.origin === 'manhwa' ? 'ko'
                  : title.origin === 'manga' ? 'ja'
                  : 'zh'
                }
              >
                {[
                  title.titleOriginal,
                  ...(title.titleAlternative ?? []),
                ]
                  .filter(Boolean)
                  .join(', ')}
              </motion.p>
            )}

            {/* Synopsis — directly below title area */}
            {title.synopsis && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="font-body text-sm text-text-secondary leading-relaxed max-w-2xl"
              >
                {title.synopsis}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="container-content py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* Main column */}
          <div className="flex flex-col gap-10 min-w-0">
            {/* Review */}
            {title.review && (
              <ScrollReveal>
                <ReviewSection
                  review={title.review}
                  vibeCheck={title.vibeCheck}
                  quotableLines={title.quotableLines}
                />
              </ScrollReveal>
            )}

            {/* Related titles */}
            <ScrollReveal>
              <RelatedTitles
                titleId={title.id}
                genreSlugs={title.genres.map((g) => g.slug)}
              />
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {/* Ratings */}
            {title.ratings && (
              <ScrollReveal>
                <div className="flex flex-col gap-3">
                  <h2 className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                    Ratings
                  </h2>
                  <RatingDisplay ratings={title.ratings} />
                </div>
              </ScrollReveal>
            )}

            {/* Meta */}
            <ScrollReveal index={1}>
              <TitleMeta title={title} />
            </ScrollReveal>

            {/* Back link */}
            <ScrollReveal index={2}>
              <Link
                href="/library"
                className={cn(
                  'flex items-center gap-2 font-heading text-xs uppercase tracking-widest',
                  'text-text-tertiary hover:text-text-secondary transition-colors',
                  'focus-visible:outline-accent-primary',
                )}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Back to Library
              </Link>
            </ScrollReveal>
          </aside>
        </div>
      </div>
    </article>
  );
}
