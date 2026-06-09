'use client';

// ============================================================
// VibeCard — cinematic mood discovery card
//
// Clicking navigates to /discover?vibe=<slug>.
// No isActive prop, no UI state change on click.
// Visual feedback: hover only (border glow + title neon + cover zoom).
// ============================================================

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { CoverCollage } from './CoverCollage';
import { VibeBadge } from './VibeBadge';
import type { EnrichedMood } from '@/types/title';

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays === 0) return 'Just now';
  if (diffDays < 30)  return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface VibeCardProps {
  mood: EnrichedMood;
  index?: number;
}

// Card dimensions
// CARD_HEIGHT is explicit — removes all content-driven height variability.
// Info area = CARD_HEIGHT - COLLAGE_HEIGHT = 360 - 210 = 150px always.
// Description is line-clamp-3 → max 3 lines reserved even for 1-line text.
const CARD_WIDTH    = 260;
const COLLAGE_HEIGHT = 210;
const CARD_HEIGHT   = 360; // fixed — ALL cards are this height, period

// Primary purple — consistent brand glow for all cards
const PURPLE = '#8b5cf6';

export function VibeCard({ mood, index = 0 }: VibeCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const accent = mood.atmosphere.accentColor;
  const updatedAgo = relativeTime(mood.lastTitleAddedAt);

  // Navigate to /discover/[slug] — dedicated page per vibe
  const handleClick = useCallback(() => {
    router.push(`/discover/${mood.slug}`);
  }, [router, mood.slug]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  }, [handleClick]);

  // Hover-only glow — purple for brand consistency
  const titleGlow = isHovered
    ? `0 0 8px ${PURPLE}cc, 0 0 20px ${PURPLE}55`
    : 'none';

  const borderGlow = isHovered
    ? `0 0 0 2px ${PURPLE}dd, 0 0 18px ${PURPLE}55, 0 0 36px ${PURPLE}22`
    : `0 0 0 1px rgba(255,255,255,0.07)`;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Browse ${mood.name} — ${mood.titleCount} titles`}
      className={cn(
        'relative flex-shrink-0 flex flex-col cursor-pointer select-none',
        'rounded-lg overflow-hidden',
        'bg-surface-elevated',
        'focus-visible:outline-none',
        // Mobile: full width. Desktop (sm+): fixed width for horizontal scroll.
        // Width is in className NOT inline style — inline style would override
        // the responsive breakpoint and prevent full-width on mobile.
        'w-full sm:w-[260px]',
      )}
      style={{
        height: CARD_HEIGHT,
        boxShadow: borderGlow,
        transition: 'box-shadow 300ms ease',
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: Math.min(index * 0.05, 0.5),
      }}
    >
      {/* ── Collage area ─────────────────────────────────────── */}
      <div className="relative" style={{ height: COLLAGE_HEIGHT }}>
        <CoverCollage
          covers={mood.collageCovers}
          accentColor={accent}
          isHovered={isHovered}
          height={COLLAGE_HEIGHT}
        />

        {/* Badge — top-left over collage */}
        {mood.badge && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <VibeBadge badge={mood.badge} />
          </div>
        )}
      </div>

      {/* ── Info area — flex-1 so it fills remaining height ────── */}
      {/* This is what makes all cards the same height:             */}
      {/* collage = fixed px, info = flex-1 = fills the rest        */}
      <div
        className="flex flex-col flex-1 gap-2 p-4 pt-3.5"
        style={{
          background: 'var(--color-surface-base)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Title row + item count */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-heading font-bold text-base leading-tight flex-1 min-w-0"
            style={{
              color: isHovered ? PURPLE : 'var(--color-text-primary)',
              textShadow: titleGlow,
              transition: 'color 300ms ease, text-shadow 300ms ease',
            }}
          >
            {mood.name}
          </h3>

          {/* Item count — neutral chip */}
          <span
            className="flex-shrink-0 font-data text-[10px] font-semibold leading-none px-2 py-1 rounded whitespace-nowrap"
            style={{
              color: 'var(--color-text-muted)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            {mood.titleCount} {mood.titleCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Editor note — line-clamp-3 reserves space for max 3 lines */}
        {/* Cards with 1–2 line descriptions still occupy the same height */}
        {mood.editorNote && (
          <p
            className="font-body text-xs leading-snug text-text-secondary line-clamp-3"
            style={{ opacity: isHovered ? 0.9 : 0.65, transition: 'opacity 300ms ease' }}
          >
            {mood.editorNote}
          </p>
        )}

        {/* Metadata — always pinned to the bottom of the info panel */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          {updatedAgo && (
            <span className="font-data text-[10px] text-text-muted leading-none">
              {updatedAgo}
            </span>
          )}
          {mood.titlesAddedThisMonth > 0 && (
            <>
              {updatedAgo && <span className="text-text-muted text-[10px]">·</span>}
              <span
                className="font-data text-[10px] leading-none transition-opacity duration-300"
                style={{
                  color: PURPLE,
                  opacity: isHovered ? 1 : 0.45,
                }}
              >
                +{mood.titlesAddedThisMonth} this mo
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
