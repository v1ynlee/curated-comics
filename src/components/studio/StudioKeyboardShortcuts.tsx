'use client';

// ============================================================
// StudioKeyboardShortcuts — Global keyboard shortcuts for Studio.
// Lightweight listener that provides efficiency shortcuts for
// daily CMS use. Product-register delight: invisible to novices,
// speeds up expert interaction.
//
// Shortcuts:
//   Ctrl/Cmd + N  → Navigate to "new" page (context-dependent)
//   /             → Focus the first search input on the page
//   Escape        → Blur focused input
// ============================================================

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function StudioKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas/contenteditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // ── Escape: blur focused input ──────────────────────────
      if (e.key === 'Escape' && isInput) {
        (target as HTMLInputElement).blur();
        return;
      }

      // Don't process other shortcuts when in an input
      if (isInput) return;

      // ── Ctrl/Cmd + N: New item (context-dependent) ──────────
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();

        if (pathname.startsWith('/studio/articles')) {
          router.push('/studio/articles/new');
        } else if (pathname.startsWith('/studio/titles')) {
          router.push('/studio/titles/new');
        } else {
          // Default: new title (most common action)
          router.push('/studio/titles/new');
        }
        return;
      }

      // ── / : Focus search input ──────────────────────────────
      if (e.key === '/') {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[aria-label*="earch"]'
        );
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, pathname]);

  // Render nothing — this is a behavior-only component
  return null;
}
