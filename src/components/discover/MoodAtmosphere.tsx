'use client';

// ============================================================
// MoodAtmosphere — per-mood visual background treatment
// Source of truth: docs/design/UI_UX_DIRECTION.md — Genre/Mood Discovery
//                  docs/motion/MOTION_SYSTEM.md — Category 4
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePerformanceTier } from '@/hooks/usePerformanceTier';
import type { MoodAtmosphere as MoodAtmosphereType } from '@/types/title';

interface MoodAtmosphereProps {
  atmosphere: MoodAtmosphereType | null;
  moodKey: string; // Used as AnimatePresence key for transitions
}

export function MoodAtmosphere({ atmosphere, moodKey }: MoodAtmosphereProps) {
  const prefersReduced = usePrefersReducedMotion();
  const tier = usePerformanceTier();

  if (!atmosphere) return null;

  const { gradient, accentColor, particleColor } = atmosphere;
  const showParticles = !prefersReduced && tier !== 'low' && particleColor;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={moodKey}
        aria-hidden="true"
        className="particle-field absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReduced ? 0.01 : 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 transition-colors duration-700"
          style={{
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[gradient.length - 1]} 100%)`,
          }}
        />

        {/* Accent orbs */}
        <div
          className="absolute left-1/4 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
          style={{ backgroundColor: `${accentColor}18` }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full blur-[100px]"
          style={{ backgroundColor: `${accentColor}10` }}
        />

        {/* Particles */}
        {showParticles && (
          <div className="absolute inset-0">
            {Array.from({ length: tier === 'high' ? 10 : 5 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  left: `${8 + (i * 9.1) % 84}%`,
                  top: `${12 + (i * 13.3) % 76}%`,
                  width: i % 3 === 0 ? '3px' : '2px',
                  height: i % 3 === 0 ? '3px' : '2px',
                  backgroundColor: particleColor,
                  opacity: 0.2 + (i % 3) * 0.08,
                  animationDelay: `${i * 0.6}s`,
                  animationDuration: `${4 + (i % 5)}s`,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
