'use client';

// ============================================================
// MoodCard — individual mood category card
// Source of truth: docs/design/UI_UX_DIRECTION.md — Genre/Mood Discovery
//
// Emojis are replaced with lucide-react icons mapped by mood slug.
// ============================================================

import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Brain,
  Drama,
  Coffee,
  Flame,
  Sword,
  Zap,
  HeartCrack,
  Crown,
  Skull,
  RefreshCw,
  Building2,
  BarChart2,
  Palette,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Mood } from '@/types/title';

// Map mood slug → lucide icon component
const MOOD_ICONS: Record<string, React.ElementType> = {
  'depression-arc':    HeartCrack,
  'aura-farming':      Sparkles,
  'brainrot':          Brain,
  'manipulator-mc':    Drama,
  'comfy-sol':         Coffee,
  'revenge-fantasy':   Flame,
  'murim-addiction':   Sword,
  'power-fantasy':     Zap,
  'emotional-damage':  Heart,
  'villainess-era':    Crown,
  'necromancer-vibes': Skull,
  'regression-loop':   RefreshCw,
  'tower-climbing':    Building2,
  'system-addict':     BarChart2,
  'art-god':           Palette,
  'guilty-trash':      Trash2,
};

function getMoodIcon(slug: string): React.ElementType {
  return MOOD_ICONS[slug] ?? BookOpen;
}

interface MoodCardProps {
  mood: Mood;
  isActive: boolean;
  onSelect: (slug: string) => void;
  index?: number;
}

export function MoodCard({ mood, isActive, onSelect, index = 0 }: MoodCardProps) {
  const prefersReduced = usePrefersReducedMotion();
  const accentColor = mood.atmosphere.accentColor;
  const Icon = getMoodIcon(mood.slug);

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
      {/* Icon */}
      <span
        className="flex items-center justify-center w-8 h-8 rounded-md"
        aria-hidden="true"
        style={{
          color: accentColor,
          backgroundColor: `${accentColor}18`,
        }}
      >
        <Icon size={16} strokeWidth={1.75} />
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
