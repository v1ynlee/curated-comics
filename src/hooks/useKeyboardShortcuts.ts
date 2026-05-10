'use client';

// ============================================================
// useKeyboardShortcuts — global keyboard shortcut handler
// Source of truth: docs/roadmap/ROADMAP.md — Phase 5
//
// Shortcuts:
//   /        → Focus search (or open search page)
//   g h      → Go Home
//   g l      → Go Library
//   g d      → Go Discover
//   g t      → Go Tiers
//   g s      → Go Stats
//   ?        → Show keyboard shortcuts help
//   Escape   → Close modals / clear focus
// ============================================================

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type ShortcutHandler = () => void;

interface Shortcut {
  key: string;
  description: string;
  handler: ShortcutHandler;
}

export function useKeyboardShortcuts(
  extraShortcuts: Shortcut[] = [],
  enabled = true,
) {
  const router = useRouter();
  const pendingKey = useRef<string | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape to blur inputs
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Skip modifier combos (Ctrl, Alt, Meta) except Shift
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key;

      // ── Single-key shortcuts ──────────────────────────────

      if (key === '/') {
        e.preventDefault();
        router.push('/search');
        return;
      }

      if (key === '?') {
        e.preventDefault();
        // Dispatch custom event for the help modal
        window.dispatchEvent(new CustomEvent('show-keyboard-help'));
        return;
      }

      // ── Two-key "g + X" navigation shortcuts ─────────────

      if (key === 'g') {
        pendingKey.current = 'g';
        // Clear pending after 1 second
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        pendingTimer.current = setTimeout(() => {
          pendingKey.current = null;
        }, 1000);
        return;
      }

      if (pendingKey.current === 'g') {
        pendingKey.current = null;
        if (pendingTimer.current) clearTimeout(pendingTimer.current);

        switch (key) {
          case 'h': router.push('/'); break;
          case 'l': router.push('/library'); break;
          case 'd': router.push('/discover'); break;
          case 't': router.push('/tiers'); break;
          case 's': router.push('/stats'); break;
        }
        return;
      }

      // ── Extra shortcuts ───────────────────────────────────
      for (const shortcut of extraShortcuts) {
        if (shortcut.key === key) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, [router, extraShortcuts, enabled]);
}

// ── Shortcut definitions (for help display) ───────────────────

export const KEYBOARD_SHORTCUTS = [
  { keys: ['/'], description: 'Search titles' },
  { keys: ['g', 'h'], description: 'Go to Home' },
  { keys: ['g', 'l'], description: 'Go to Library' },
  { keys: ['g', 'd'], description: 'Go to Discover' },
  { keys: ['g', 't'], description: 'Go to Tiers' },
  { keys: ['g', 's'], description: 'Go to Stats' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close / blur' },
] as const;
