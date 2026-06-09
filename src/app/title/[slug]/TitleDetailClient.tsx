'use client';

// ============================================================
// TitleDetailClient — immersive title detail view
//
// Layout:
//   Desktop: side-by-side cover + title info, then tab body
//   Mobile:  centered cover → title → divider → tier+rating →
//            synopsis → tabs → related titles (bottom)
//
// Banner: blurred cover image behind the header area.
//   The blur is applied ONLY to the image element itself via
//   CSS filter. The banner container uses overflow:hidden and
//   is positioned BELOW the fixed nav (not behind it) using
//   a top padding equal to the nav height.
//   isolation:isolate prevents the blur from leaking upward.
// ============================================================

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trophy, Star,
  Info, BookMarked, Images, Users2, Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RatingDisplay } from '@/components/title/RatingDisplay';
import { ReviewSection } from '@/components/title/ReviewSection';
import { RelatedTitles } from '@/components/title/RelatedTitles';
import { DetailsTab } from '@/components/title/tabs/DetailsTab';
import { ReadTab } from '@/components/title/tabs/ReadTab';
import { GalleryTab } from '@/components/title/tabs/GalleryTab';
import { CharactersTab } from '@/components/title/tabs/CharactersTab';
import { ReviewsTab } from '@/components/title/tabs/ReviewsTab';
import { NewsTab } from '@/components/title/tabs/NewsTab';
import { useUIStore } from '@/stores/useUIStore';
import { TIER_CONFIG } from '@/types/title';
import type { Title } from '@/types/title';

// ── Tab config ────────────────────────────────────────────────

type TabId = 'details' | 'read' | 'gallery' | 'characters' | 'reviews' | 'news';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'details',    label: 'Details',    icon: Info },
  { id: 'read',       label: 'Read',       icon: BookMarked },
  { id: 'gallery',    label: 'Gallery',    icon: Images },
  { id: 'characters', label: 'Characters', icon: Users2 },
  { id: 'reviews',    label: 'Reviews',    icon: Star },
  { id: 'news',       label: 'News',       icon: Newspaper },
];

// ── Tab bar ───────────────────────────────────────────────────

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Title sections"
      className="flex gap-2 overflow-x-auto scrollbar-none border-b border-white/10 pb-[-1px] mb-6"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${id}`}
            onClick={() => onChange(id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 shrink-0',
              'font-heading text-xs uppercase tracking-widest rounded-t-lg',
              'transition-all duration-300',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              isActive 
                ? 'text-accent-primary bg-white/5 shadow-[inset_0_-2px_0_var(--color-accent-primary)]' 
                : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5',
            )}
          >
            <Icon size={14} aria-hidden="true" className={cn("transition-transform duration-300", isActive && "scale-110")} />
            {label}
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-primary rounded-t-sm shadow-[0_0_8px_var(--color-accent-primary)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

interface TitleDetailClientProps {
  title: Title;
}

export function TitleDetailClient({ title }: TitleDetailClientProps) {
  const coverSlug = title.coverImage?.slug ?? title.slug;
  const dominantColor = title.coverImage?.dominantColor ?? '#1a1a2e';
  const theme = useUIStore((s) => s.theme);
  const [activeTab, setActiveTab] = useState<TabId>('details');

  const tierConfig = title.tier ? TIER_CONFIG[title.tier] : null;

  return (
    <article aria-labelledby="title-heading">

      {/*
        ── Blurred banner ──────────────────────────────────────
        Desktop: pt-16 pushes banner below the fixed nav (h-16)
        so the dark tint never bleeds into the nav background.
        Mobile: layout's pt-14 already handles this.

        The image uses CSS background-image with inline transform
        scale(1.1) to hide blur edges — avoids Tailwind scale-110
        cross-browser issues.
      */}
      <div
        className="relative overflow-hidden -mt-14 md:-mt-16"
        style={{
          height: 'clamp(220px, 36vw, 360px)',
          isolation: 'isolate',
        }}
      >
        {/* Blurred cover image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(/images/covers/${coverSlug}-1200w.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: 'blur(20px)',
            transform: 'scale(1.22)',
            opacity: theme === 'light' ? 1.7 : 0.85,
          }}
          aria-hidden="true"
        />
        {/* Subtle dominant color tint — very light so image shows through */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${dominantColor}30` }}
          aria-hidden="true"
        />
        {/* Gradient fade — only at the bottom 40%, not full height */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              transparent 0%,
              transparent 45%,
              color-mix(in srgb, var(--color-bg-deep) 60%, transparent) 85%,
              var(--color-bg-deep) 100%)`,
          }}
          aria-hidden="true"
        />

      </div>

      {/* ── Cover + title info — overlaps banner by ~50% ───── */}
      {/*
        The negative margin pulls the cover section up so it
        overlaps the bottom half of the banner.
        clamp(90px, 16vw, 160px) = ~50% of banner height.
      */}
      <div
        className="container-content pb-6 relative z-raised flex flex-col gap-5 md:gap-6"
        style={{ marginTop: 'calc(clamp(90px, 16vw, 160px) * -1)' }}
      >
        {/* ── Breadcrumb Navigation ──────── */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-white/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 w-full mb-1">
          <Link
            href="/library"
            className="hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            Library
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white/90 truncate max-w-[150px] md:max-w-[300px]">{title.titleEnglish}</span>
        </nav>

        {/* ── MOBILE layout: centered stack ──────────────────── */}
        <div className="flex flex-col items-center text-center md:hidden gap-4">

          {/* Cover — centered */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-36 shrink-0"
          >
            <div
              className="relative rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
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
                sizes="144px"
              />
            </div>
          </motion.div>

          {/* Title — centered */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col gap-1.5"
          >
            <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-text-tertiary">
              {title.origin}
            </span>
            <h1
              id="title-heading"
              className="font-display text-[clamp(1.5rem,6vw,2.25rem)] font-bold text-text-primary leading-tight"
            >
              {title.titleEnglish}
            </h1>
            {(title.titleOriginal || (title.titleAlternative && title.titleAlternative.length > 0)) && (
              <div className="flex flex-col gap-1 mt-2 text-left w-full max-w-sm">
                {title.titleEnglish && (
                  <p className="font-body text-[11px] text-text-tertiary">
                    <span className="font-heading uppercase tracking-widest text-white/40 mr-2">English</span>
                    {title.titleEnglish}
                  </p>
                )}
                {title.titleOriginal && (
                  <p className="font-body text-[11px] text-text-tertiary">
                    <span className="font-heading uppercase tracking-widest text-white/40 mr-2">Original</span>
                    {title.titleOriginal}
                  </p>
                )}
                {title.titleAlternative && title.titleAlternative.length > 0 && (
                  <p className="font-body text-[11px] text-text-tertiary">
                    <span className="font-heading uppercase tracking-widest text-white/40 mr-2">Alternative</span>
                    {title.titleAlternative.join(', ')}
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Divider */}
          <div className="w-16 h-px bg-white/10" aria-hidden="true" />

          {/* Tier + Rating row — always show both pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            {tierConfig && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ color: tierConfig.color, backgroundColor: `${tierConfig.color}18`, border: `1px solid ${tierConfig.color}35` }}
                title={`Tier: ${tierConfig.label}`}
              >
                <Trophy size={12} aria-hidden="true" />
                <span className="font-heading text-[10px] font-bold uppercase tracking-widest">{title.tier}</span>
              </div>
            )}
            {/* Star rating — always rendered; shows score or em-dash */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{
                color: 'var(--color-accent-secondary)',
                backgroundColor: 'color-mix(in srgb, var(--color-accent-secondary) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-accent-secondary) 30%, transparent)',
              }}
              role="meter"
              aria-label={title.ratings?.overall !== undefined ? `Rating: ${title.ratings.overall.toFixed(1)} out of 10` : 'Not yet rated'}
              aria-valuenow={title.ratings?.overall}
              aria-valuemin={1}
              aria-valuemax={10}
            >
              <Star size={12} aria-hidden="true" />
              <span className="font-data text-[11px] font-bold">
                {title.ratings?.overall !== undefined ? title.ratings.overall.toFixed(1) : '—'}
              </span>
            </div>
          </motion.div>

          {/* Synopsis (Moved below title area) */}
          {title.synopsis && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="font-body text-sm text-text-secondary leading-relaxed max-w-sm text-left mt-2"
            >
              {title.synopsis}
            </motion.p>
          )}
        </div>

        {/* ── DESKTOP layout: side-by-side ───────────────────── */}
        <div className="hidden md:flex gap-10 items-start">

          {/* Left column: cover image + synopsis below */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="shrink-0 flex flex-col gap-4 w-44 lg:w-52"
          >
            {/* Cover image */}
            <div
              className="relative rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
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
                sizes="208px"
              />
            </div>

            {/* Synopsis moved away from here */}
          </motion.div>

          {/* Right column: origin → title → alt titles → pills → read */}
          <div className="flex flex-col gap-3 flex-1 min-w-0 pt-4">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="font-heading text-xs uppercase tracking-[0.25em] text-text-tertiary"
            >
              {title.origin}
            </motion.span>
            <motion.h1
              id="title-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-display text-[clamp(1.75rem,4vw,3rem)] font-bold text-text-primary leading-tight"
            >
              {title.titleEnglish}
            </motion.h1>
            {(title.titleOriginal || (title.titleAlternative && title.titleAlternative.length > 0)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="flex flex-col gap-1.5 mt-2"
              >
                {title.titleEnglish && (
                  <p className="font-body text-xs text-text-tertiary">
                    <span className="font-heading text-[10px] uppercase tracking-widest text-white/40 mr-2">English</span>
                    {title.titleEnglish}
                  </p>
                )}
                {title.titleOriginal && (
                  <p className="font-body text-xs text-text-tertiary">
                    <span className="font-heading text-[10px] uppercase tracking-widest text-white/40 mr-2">Original</span>
                    {title.titleOriginal}
                  </p>
                )}
                {title.titleAlternative && title.titleAlternative.length > 0 && (
                  <p className="font-body text-xs text-text-tertiary">
                    <span className="font-heading text-[10px] uppercase tracking-widest text-white/40 mr-2">Alternative</span>
                    {title.titleAlternative.join(', ')}
                  </p>
                )}
              </motion.div>
            )}

            {/* Synopsis — moved to directly below title info */}
            {title.synopsis && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="font-body text-sm text-text-secondary leading-relaxed mt-2 max-w-2xl"
              >
                {title.synopsis}
              </motion.p>
            )}

            {/* Trophy + Star — below title text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center gap-2 flex-wrap"
            >
              {tierConfig && (
                <div
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
                  style={{ color: tierConfig.color, backgroundColor: `${tierConfig.color}18`, border: `1px solid ${tierConfig.color}35` }}
                  title={`Tier: ${tierConfig.label}`}
                >
                  <Trophy size={12} aria-hidden="true" />
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest">{title.tier}</span>
                </div>
              )}
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
                style={{
                  color: 'var(--color-accent-secondary)',
                  backgroundColor: 'color-mix(in srgb, var(--color-accent-secondary) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-accent-secondary) 30%, transparent)',
                }}
                role="meter"
                aria-label={title.ratings?.overall !== undefined ? `Rating: ${title.ratings.overall.toFixed(1)} out of 10` : 'Not yet rated'}
                aria-valuenow={title.ratings?.overall}
                aria-valuemin={1}
                aria-valuemax={10}
              >
                <Star size={12} aria-hidden="true" />
                <span className="font-data text-[11px] font-bold">
                  {title.ratings?.overall !== undefined ? title.ratings.overall.toFixed(1) : '—'}
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── Tab system ─────────────────────────────────────────── */}
      <div className="container-content pb-8">

        {/* Desktop: two-column — tabs left, ratings right */}
          {/* Tab panel — full width now since we moved ratings to Reviews tab */}
          <div className="w-full">
            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            <div
              id={`tabpanel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              className="min-h-[400px]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 'details'    && <DetailsTab title={title} />}
                  {activeTab === 'read'       && <ReadTab links={title.externalLinks} />}
                  {activeTab === 'gallery'    && <GalleryTab titleId={title.id} />}
                  {activeTab === 'characters' && <CharactersTab titleId={title.id} />}
                  {activeTab === 'reviews'    && <ReviewsTab title={title} />}
                  {activeTab === 'news'       && <NewsTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        {/* ── Related titles — always at bottom ──────────────── */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <ScrollReveal>
            <RelatedTitles
              titleId={title.id}
              genreSlugs={title.genres.map((g) => g.slug)}
            />
          </ScrollReveal>
        </div>
      </div>
    </article>
  );
}
