'use client';

// ============================================================
// useKonamiCode — Easter egg: ↑↑↓↓←→←→BA
// Source of truth: docs/roadmap/ROADMAP.md — Phase 5
//
// Fires a callback when the Konami code is entered.
// ============================================================

import { useEffect, useRef } from 'react';

const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonamiCode(onActivate: () => void) {
  const progress = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KONAMI[progress.current]) {
        progress.current++;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          onActivate();
        }
      } else {
        // Reset on wrong key, but check if it starts a new sequence
        progress.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onActivate]);
}
