'use client';

// ============================================================
// TitleDetailClient — immersive title detail view
// Source of truth: docs/design/UI_UX_DIRECTION.md — Title Detail View
//                  docs/design/MOBILE_EXPERIENCE.md
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RatingDisplay } from '@/components/title/RatingDisplay';
import { ReviewSection } from '@/components/title/ReviewSection';
import { ExternalLinks } from '@/components/title/ExternalLinks';
import { TitleMeta } from '@/components/title/TitleMeta';
import { RelatedTitles } from '@/components/title/RelatedTitles';
import type { Title } from '@/types/title';

interface TitleDetailClientProps {
  title: Title;
}

export function TitleDetailClient({ title }: TitleDetailClientProps) {
  const coverSlug = title.coverImage?.slug ?? title.slug;
  const dominantColor = title.coverImage?.dominantColor ?? '#1a1a2e';

  return (
    <article aria-labelledby="title-heading">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-end">
        {/* Blurred backdrop — isolated so it doesn't clip the fixed nav */}
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
          style={{ backgroundColor: dominantColor }}
        >
          <Image
            src={`/images/covers/${coverSlug}-1200w.avif`}
            alt=""
            fill
            className="object-cover opacity-20 blur-2xl scale-110"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/70 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="container-content pb-12 pt-32 md:pt-24 flex flex-col md:flex-row gap-8 md:gap-12 items-end">
          {/* Cover art */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }}
            className="shrink-0 w-36 md:w-48 lg:w-56 rounded-sm overflow-hidden shadow-2xl"
          >
            <div
              className="relative"
              style={{ aspectRatio: '2/3', backgroundColor: dominantColor }}
            >
              <Image
                src={`/images/covers/${coverSlug}-640w.avif`}
                alt={`${title.titleEnglish} cover`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 144px, 224px"
              />
            </div>
          </motion.div>

          {/* Title info */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            {/* Origin label */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary"
            >
              {title.origin}
            </motion.span>

            {/* Title */}
            <motion.h1
              id="title-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] }}
              className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-text-primary leading-tight"
            >
              {title.titleEnglish}
            </motion.h1>

            {/* Original title */}
            {title.titleOriginal && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-body text-lg text-text-tertiary"
                lang={
                  title.origin === 'manhwa'
                    ? 'ko'
                    : title.origin === 'manga'
                    ? 'ja'
                    : 'zh'
                }
              >
                {title.titleOriginal}
              </motion.p>
            )}

            {/* Overall rating */}
            {title.ratings?.overall !== undefined && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-baseline gap-2"
                role="meter"
                aria-label="Overall rating"
                aria-valuenow={title.ratings.overall}
                aria-valuemin={1}
                aria-valuemax={10}
              >
                <span className="font-data text-4xl font-bold text-accent-primary">
                  {title.ratings.overall.toFixed(1)}
                </span>
                <span className="font-data text-lg text-text-tertiary">/ 10</span>
              </motion.div>
            )}

            {/* Synopsis */}
            {title.synopsis && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="font-body text-base text-text-secondary leading-relaxed max-w-2xl line-clamp-3"
              >
                {title.synopsis}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="container-content py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Main column */}
          <div className="flex flex-col gap-12 min-w-0">
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

            {/* External links */}
            {title.externalLinks.length > 0 && (
              <ScrollReveal index={2}>
                <ExternalLinks links={title.externalLinks} />
              </ScrollReveal>
            )}

            {/* Back link */}
            <ScrollReveal index={3}>
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
