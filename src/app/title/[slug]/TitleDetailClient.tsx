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
  ArrowLeft, BookOpen, Trophy, Star, ChevronDown,
  ExternalLink, Info, BookMarked, Images, Users2, Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RatingDisplay } from '@/components/title/RatingDisplay';
import { ReviewSection } from '@/components/title/ReviewSection';
import { RelatedTitles } from '@/components/title/RelatedTitles';
import { DetailsTab } from '@/components/title/tabs/DetailsTab';
import { ReadTab } from '@/components/title/tabs/ReadTab';
import { GalleryTab } from '@/components/title/tabs/GalleryTab';
import { CharactersTab } from '@/components/title/tabs/CharactersTab';
import { NewsTab } from '@/components/title/tabs/NewsTab';
import { useUIStore } from '@/stores/useUIStore';
import { TIER_CONFIG } from '@/types/title';
import { PLATFORM_CONFIG } from '@/lib/constants';
import type { Title } from '@/types/title';

// ── Tab config ────────────────────────────────────────────────

type TabId = 'details' | 'read' | 'gallery' | 'characters' | 'news';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'details',    label: 'Details',    icon: Info },
  { id: 'read',       label: 'Read',       icon: BookMarked },
  { id: 'gallery',    label: 'Gallery',    icon: Images },
  { id: 'characters', label: 'Characters', icon: Users2 },
  { id: 'news',       label: 'News',       icon: Newspaper },
];

// ── Read Dropdown ─────────────────────────────────────────────

function ReadDropdown({ links }: { links: Title['externalLinks'] }) {
  const [open, setOpen] = useState(false);
  if (links.length === 0) return null;

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
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'font-heading text-xs uppercase tracking-widest font-medium',
          'bg-gradient-to-br from-accent-primary to-[#6d28d9] text-white',
          'shadow-[0_2px_12px_rgba(139,92,246,0.4)]',
          'hover:shadow-[0_4px_20px_rgba(139,92,246,0.6)] hover:brightness-110',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
        aria-label={`Read on ${platform.name}`}
      >
        <BookOpen size={13} aria-hidden="true" />
        Read
        <ExternalLink size={10} className="opacity-70" aria-hidden="true" />
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
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'font-heading text-xs uppercase tracking-widest font-medium',
          'bg-gradient-to-br from-accent-primary to-[#6d28d9] text-white',
          'shadow-[0_2px_12px_rgba(139,92,246,0.4)]',
          'hover:shadow-[0_4px_20px_rgba(139,92,246,0.6)] hover:brightness-110',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        )}
      >
        <BookOpen size={13} aria-hidden="true" />
        Read
        <ChevronDown size={11} aria-hidden="true" className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.ul
              role="listbox"
              aria-label="Reading platforms"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
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
                      className="flex items-center gap-3 px-4 py-3 font-body text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-accent-primary"
                    >
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: platform.color }} aria-hidden="true" />
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
      className="flex gap-0 overflow-x-auto scrollbar-none border-b border-white/5"
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
              'relative flex items-center gap-1.5 px-3 py-3 shrink-0',
              'font-heading text-[11px] uppercase tracking-widest',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            <Icon size={12} aria-hidden="true" />
            {label}
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-x-0 -bottom-px h-px bg-accent-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
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
        IMPORTANT: overflow-hidden + isolation:isolate prevents
        the blur from leaking into the fixed nav above.
        The blur is applied ONLY to the <Image> element via
        className="blur-2xl", NOT to the container.
        The container sits below the nav — it does NOT overlap it.
      */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 'clamp(160px, 28vw, 280px)',
          isolation: 'isolate',
        }}
        aria-hidden="true"
      >
        {/* The actual blurred image — blur is on the img, not the container */}
        <Image
          src={`/images/covers/${coverSlug}-1200w.avif`}
          alt=""
          fill
          priority
          className="object-cover object-center blur-2xl scale-110"
          style={{ opacity: theme === 'light' ? 0.4 : 0.6 }}
          sizes="100vw"
        />
        {/* Dominant color tint */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${dominantColor}55` }}
        />
        {/* Fade to page bg at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              transparent 0%,
              color-mix(in srgb, var(--color-bg-deep) 50%, transparent) 65%,
              var(--color-bg-deep) 100%)`,
          }}
        />
      </div>

      {/* ── Back button — top-left, overlaps banner ─────────── */}
      <div className="container-content">
        <Link
          href="/library"
          className={cn(
            'inline-flex items-center gap-1.5 -mt-8 mb-4 relative z-raised',
            'font-heading text-xs uppercase tracking-widest',
            'text-text-tertiary hover:text-text-secondary transition-colors',
            'focus-visible:outline-accent-primary rounded-sm',
          )}
          aria-label="Back to Library"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Library
        </Link>
      </div>

      {/* ── Cover + title info ──────────────────────────────── */}
      <div className="container-content -mt-2 pb-6">

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
              <p className="font-body text-xs text-text-tertiary leading-relaxed">
                {[title.titleOriginal, ...(title.titleAlternative ?? [])].filter(Boolean).join(', ')}
              </p>
            )}
          </motion.div>

          {/* Divider */}
          <div className="w-16 h-px bg-white/10" aria-hidden="true" />

          {/* Tier + Rating row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <ReadDropdown links={title.externalLinks} />
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
            {title.ratings?.overall !== undefined && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
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
                <span className="font-data text-[11px] font-bold">{title.ratings.overall.toFixed(1)}</span>
              </div>
            )}
          </motion.div>

          {/* Synopsis */}
          {title.synopsis && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="font-body text-sm text-text-secondary leading-relaxed max-w-sm text-left"
            >
              {title.synopsis}
            </motion.p>
          )}
        </div>

        {/* ── DESKTOP layout: side-by-side ───────────────────── */}
        <div className="hidden md:flex gap-10 items-start">

          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="shrink-0 w-44 lg:w-52"
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
                sizes="208px"
              />
            </div>

            {/* Action row below cover */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <ReadDropdown links={title.externalLinks} />
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
                  <span className="font-data text-[11px] font-bold">{title.ratings.overall.toFixed(1)}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Title info */}
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
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="font-body text-sm text-text-tertiary leading-relaxed"
              >
                {[title.titleOriginal, ...(title.titleAlternative ?? [])].filter(Boolean).join(', ')}
              </motion.p>
            )}
            {title.synopsis && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="font-body text-sm text-text-secondary leading-relaxed max-w-2xl"
              >
                {title.synopsis}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab system ─────────────────────────────────────────── */}
      <div className="container-content pb-8">

        {/* Desktop: two-column — tabs left, ratings right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* Tab panel */}
          <div>
            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            <div
              id={`tabpanel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.0, 0.0, 0.2, 1.0] }}
                >
                  {activeTab === 'details'    && <DetailsTab title={title} />}
                  {activeTab === 'read'       && <ReadTab links={title.externalLinks} />}
                  {activeTab === 'gallery'    && <GalleryTab titleId={title.id} />}
                  {activeTab === 'characters' && <CharactersTab titleId={title.id} />}
                  {activeTab === 'news'       && <NewsTab />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Review — shown below tabs when on details */}
            {activeTab === 'details' && title.review && (
              <ScrollReveal>
                <div className="mt-8 pt-8 border-t border-white/5">
                  <ReviewSection
                    review={title.review}
                    vibeCheck={undefined}
                    quotableLines={title.quotableLines}
                  />
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Sidebar — ratings (desktop only) */}
          <aside className="hidden lg:flex flex-col gap-6">
            {title.ratings && (
              <ScrollReveal>
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-elevated/20 border border-white/5">
                  <h2 className="font-heading text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                    Ratings
                  </h2>
                  <RatingDisplay ratings={title.ratings} />
                </div>
              </ScrollReveal>
            )}
          </aside>
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
