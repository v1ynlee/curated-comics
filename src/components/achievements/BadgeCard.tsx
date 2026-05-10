'use client';

// ============================================================
// BadgeCard — individual achievement badge (locked/unlocked)
// Source of truth: docs/design/UI_UX_DIRECTION.md — Achievement Gallery
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ProgressRing } from './ProgressRing';
import type { Achievement } from '@/types/achievements';

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const RARITY_COLORS: Record<string, string> = {
  common: '#10b981',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#ffd700',
};

interface BadgeCardProps {
  achievement: Achievement;
  index?: number;
}

export function BadgeCard({ achievement, index = 0 }: BadgeCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const rarityColor = RARITY_COLORS[achievement.rarity] ?? achievement.color;
  const isUnlocked = achievement.unlocked;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{
          delay: Math.min(index * 0.04, 0.4),
          duration: 0.4,
          ease: [0.0, 0.0, 0.2, 1.0],
        }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowDetail(true)}
        className={cn(
          'relative flex flex-col items-center gap-3 p-4 rounded-sm text-center',
          'border transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          isUnlocked
            ? 'border-white/10 bg-surface-elevated/60'
            : 'border-white/5 bg-surface-elevated/20 opacity-60',
        )}
        style={
          isUnlocked
            ? {
                borderColor: `${rarityColor}30`,
                boxShadow: achievement.glowEffect
                  ? `0 0 20px ${rarityColor}20`
                  : undefined,
              }
            : undefined
        }
        aria-label={`${achievement.name} — ${isUnlocked ? 'Unlocked' : `${achievement.progress}% complete`}`}
      >
        {/* Progress ring + icon */}
        <ProgressRing
          progress={isUnlocked ? 100 : achievement.progress}
          size={52}
          color={isUnlocked ? rarityColor : '#6b6b80'}
        >
          <span
            className={cn(
              'font-data text-xs font-bold',
              isUnlocked ? 'text-text-primary' : 'text-text-tertiary',
            )}
            aria-hidden="true"
          >
            {isUnlocked ? '✓' : `${achievement.progress}%`}
          </span>
        </ProgressRing>

        {/* Name */}
        <span
          className={cn(
            'font-heading text-[10px] font-bold uppercase tracking-widest leading-tight',
            isUnlocked ? 'text-text-primary' : 'text-text-tertiary',
          )}
          style={isUnlocked ? { color: rarityColor } : undefined}
        >
          {achievement.name}
        </span>

        {/* Rarity badge */}
        <span
          className="font-heading text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm"
          style={{
            color: rarityColor,
            backgroundColor: `${rarityColor}15`,
            border: `1px solid ${rarityColor}30`,
          }}
        >
          {RARITY_LABELS[achievement.rarity]}
        </span>

        {/* Lock overlay */}
        {!isUnlocked && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-sm"
            aria-hidden="true"
          >
            <Lock size={20} className="text-text-tertiary/40" />
          </div>
        )}
      </motion.button>

      {/* Detail modal */}
      <AnimatePresence>
        {showDetail && (
          <BadgeDetailModal
            achievement={achievement}
            rarityColor={rarityColor}
            onClose={() => setShowDetail(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Detail Modal ──────────────────────────────────────────────

function BadgeDetailModal({
  achievement,
  rarityColor,
  onClose,
}: {
  achievement: Achievement;
  rarityColor: string;
  onClose: () => void;
}) {
  const isUnlocked = achievement.unlocked;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-overlay bg-bg-deep/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-modal-title"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-modal',
          'w-[min(90vw,360px)] p-6 rounded-sm',
          'bg-bg-surface border border-white/10',
        )}
        style={{
          borderColor: `${rarityColor}30`,
          boxShadow: `0 0 40px ${rarityColor}15`,
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-text-tertiary hover:text-text-primary transition-colors focus-visible:outline-accent-primary rounded-sm"
          aria-label="Close"
        >
          <X size={16} aria-hidden="true" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-4 text-center">
          <ProgressRing
            progress={isUnlocked ? 100 : achievement.progress}
            size={72}
            strokeWidth={4}
            color={isUnlocked ? rarityColor : '#6b6b80'}
          >
            <span className="font-data text-sm font-bold text-text-primary" aria-hidden="true">
              {isUnlocked ? '✓' : `${achievement.progress}%`}
            </span>
          </ProgressRing>

          <div className="flex flex-col gap-1">
            <h2
              id="badge-modal-title"
              className="font-heading text-sm font-bold uppercase tracking-widest"
              style={{ color: rarityColor }}
            >
              {achievement.name}
            </h2>
            <span
              className="font-heading text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm self-center"
              style={{
                color: rarityColor,
                backgroundColor: `${rarityColor}15`,
                border: `1px solid ${rarityColor}30`,
              }}
            >
              {RARITY_LABELS[achievement.rarity]}
            </span>
          </div>

          <p className="font-body text-sm text-text-secondary leading-relaxed">
            {achievement.description}
          </p>

          {/* Progress */}
          {!isUnlocked && (
            <div className="w-full flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="font-data text-xs text-text-tertiary">Progress</span>
                <span className="font-data text-xs text-text-secondary">
                  {achievement.condition.current} / {achievement.condition.target}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${achievement.progress}%`,
                    backgroundColor: rarityColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Unlock date */}
          {isUnlocked && achievement.unlockedDate && (
            <p className="font-data text-xs text-text-tertiary">
              Unlocked {new Date(achievement.unlockedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}
