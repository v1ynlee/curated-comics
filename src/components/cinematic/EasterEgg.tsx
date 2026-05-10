'use client';

// ============================================================
// EasterEgg — Konami code activation + celebration effect
// Source of truth: docs/roadmap/ROADMAP.md — Phase 5
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const MESSAGES = [
  'You found the Konami code!',
  'Aura level: MAXIMUM',
  'SSS+ Reader detected',
  'Brainrot confirmed',
  'You are built different',
];

export function EasterEgg() {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');
  const prefersReduced = usePrefersReducedMotion();

  const handleActivate = useCallback(() => {
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(msg);
    setActive(true);
    setTimeout(() => setActive(false), 3500);
  }, []);

  useKonamiCode(handleActivate);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-toast pointer-events-none"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className="px-6 py-3 rounded-sm bg-surface-elevated border border-accent-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          >
            <p className="font-heading text-sm font-bold text-text-primary whitespace-nowrap">
              {message}
            </p>
          </div>

          {/* Particle burst — CSS only, reduced motion safe */}
          {!prefersReduced && (
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent-primary"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
