'use client';

// ============================================================
// MoodCard — individual mood category card
// Source of truth: docs/design/UI_UX_DIRECTION.md — Genre/Mood Discovery
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Mood } from '@/types/title';

interface MoodCardProps {
  mood: Mood;
  isActive: boolean;
  onSelect: (slug: string) => void;
  index?: number;
}

export function MoodCard({ mood, isActive, onSelect, index = 0 }: MoodCardProps) {
  const prefersReduced = usePrefersReducedMotion();
  const accentColor = mood.atmosphere.accentColor;

  return (
    <motion.button
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        delay: Math.min(index * 0.04, 0.3),
        duration: 0.45,
        ease: [0.0, 0.0, 0.2, 1.0],
      }}
      whileHover={prefersReduced ? undefined : { y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(mood.slug)}
      aria-pressed={isActive}
      className={cn(
        'relative flex flex-col items-start gap-2 p-4 rounded-sm text-left',
        'border transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
        isActive
          ? 'border-white/20 bg-surface-elevated'
          : 'border-white/5 bg-surface-elevated/30 hover:border-white/10 hover:bg-surface-elevated/50',
      )}
      style={
        isActive
          ? {
              borderColor: `${accentColor}40`,
              backgroundColor: `${accentColor}10`,
              boxShadow: `0 0 20px ${accentColor}15`,
            }
          : undefined
      }
    >
      {/* Emoji */}
      <span className="text-2xl leading-none" aria-hidden="true">
        {mood.emoji}
      </span>

      {/* Name */}
      <span
        className={cn(
          'font-heading text-xs font-bold uppercase tracking-widest leading-tight',
          isActive ? 'text-text-primary' : 'text-text-secondary',
        )}
        style={isActive ? { color: accentColor } : undefined}
      >
        {mood.name}
      </span>

      {/* Description */}
      <span className="font-body text-[11px] text-text-tertiary leading-snug line-clamp-2">
        {mood.description}
      </span>

      {/* Active indicator */}
      {isActive && (
        <motion.span
          layoutId="mood-active-dot"
          className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accentColor }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
