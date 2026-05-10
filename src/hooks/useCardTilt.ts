'use client';

// ============================================================
// useCardTilt — 3D tilt effect on hover using mouse position
// Source of truth: docs/motion/ANIMATION_GUIDELINES.md — Rule 7
// ============================================================

import { useState, useCallback } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useIsDesktop } from './useMediaQuery';

interface TiltState {
  rotateX: number;
  rotateY: number;
  isHovered: boolean;
}

interface UseCardTiltReturn {
  tiltStyle: React.CSSProperties;
  handlers: {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

/**
 * Returns CSS transform style and event handlers for a 3D card tilt effect.
 * Only active on desktop and when reduced motion is not preferred.
 *
 * @param maxDeg - Maximum rotation in degrees (default: 8)
 */
export function useCardTilt(maxDeg = 8): UseCardTiltReturn {
  const prefersReduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    isHovered: false,
  });

  const enabled = isDesktop && !prefersReduced;

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      // Capture rect on each move for accuracy
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setTilt({
        rotateX: y * -maxDeg,
        rotateY: x * maxDeg,
        isHovered: true,
      });
    },
    [enabled, maxDeg],
  );

  const onMouseEnter = useCallback(() => {
    if (!enabled) return;
    setTilt((prev) => ({ ...prev, isHovered: true }));
  }, [enabled]);

  const onMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  }, []);

  const tiltStyle: React.CSSProperties = enabled
    ? {
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) ${tilt.isHovered ? 'scale(1.02)' : 'scale(1)'}`,
        transition: tilt.isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.4s ease-out',
        willChange: tilt.isHovered ? 'transform' : 'auto',
      }
    : {};

  return {
    tiltStyle,
    handlers: {
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
    },
  };
}
