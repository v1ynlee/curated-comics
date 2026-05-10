'use client';

// ============================================================
// KeyboardShortcutsHelp — modal showing all keyboard shortcuts
// Triggered by pressing '?' anywhere on the site.
// ============================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('show-keyboard-help', handler);
    return () => window.removeEventListener('show-keyboard-help', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-overlay bg-bg-deep/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-modal',
              'w-[min(90vw,400px)] p-6 rounded-sm',
              'bg-bg-surface border border-white/10',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2
                id="shortcuts-title"
                className="font-heading text-sm font-bold uppercase tracking-widest text-text-primary"
              >
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-text-tertiary hover:text-text-primary transition-colors focus-visible:outline-accent-primary rounded-sm"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Shortcuts list */}
            <ul className="flex flex-col gap-2" role="list">
              {KEYBOARD_SHORTCUTS.map(({ keys, description }) => (
                <li
                  key={keys.join('+')}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="font-body text-sm text-text-secondary">
                    {description}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {keys.map((key, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <kbd
                          className={cn(
                            'font-data text-xs px-2 py-0.5 rounded-sm',
                            'bg-surface-elevated border border-white/10 text-text-secondary',
                          )}
                        >
                          {key}
                        </kbd>
                        {i < keys.length - 1 && (
                          <span className="text-text-tertiary text-xs">then</span>
                        )}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <p className="font-body text-xs text-text-tertiary mt-5 text-center">
              Press <kbd className="font-data text-xs px-1.5 py-0.5 rounded-sm bg-surface-elevated border border-white/10">Esc</kbd> to close
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
