'use client';

// ============================================================
// ConfirmAction — Inline confirmation for destructive actions.
// Replaces the trigger button with a confirmation UI in-place.
// Auto-cancels after 10 seconds. Escape key cancels.
// NOT a modal — stays inline in the same position.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ── Types ─────────────────────────────────────────────────────

interface ConfirmActionProps {
  /** The trigger button content (rendered when not confirming) */
  trigger: React.ReactNode;
  /** Confirmation message shown to the user */
  message: string;
  /** Label for the confirm button */
  confirmLabel: string;
  /** Visual variant for the confirm button */
  confirmVariant: 'danger' | 'warning';
  /** Called when user confirms the action */
  onConfirm: () => void | Promise<void>;
  /** Called when user cancels (optional) */
  onCancel?: () => void;
  /** Whether the action is currently executing */
  loading?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

// ── Component ─────────────────────────────────────────────────

export function ConfirmAction({
  trigger,
  message,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cancel = useCallback(() => {
    setConfirming(false);
    onCancel?.();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [onCancel]);

  const startConfirm = useCallback(() => {
    setConfirming(true);
    // Auto-cancel after 10 seconds
    timeoutRef.current = setTimeout(() => {
      setConfirming(false);
    }, 10000);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await onConfirm();
    setConfirming(false);
  }, [onConfirm]);

  // Escape key cancels
  useEffect(() => {
    if (!confirming) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirming, cancel]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const confirmButtonClasses = cn(
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
    'font-heading text-[11px] font-bold',
    'transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    confirmVariant === 'danger' && [
      'bg-semantic-danger/20 text-semantic-danger border border-semantic-danger/30',
      'hover:bg-semantic-danger/30',
      'focus-visible:outline-semantic-danger',
    ],
    confirmVariant === 'warning' && [
      'bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30',
      'hover:bg-semantic-warning/30',
      'focus-visible:outline-semantic-warning',
    ],
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {!confirming ? (
          <motion.div
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={startConfirm}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startConfirm();
              }
            }}
          >
            {trigger}
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <span className="font-body text-xs text-text-secondary">
              {message}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={confirmButtonClasses}
                aria-describedby="confirm-action-warning"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden="true"
                    />
                    Wait…
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
              <button
                type="button"
                onClick={cancel}
                className={cn(
                  'inline-flex items-center px-2 py-1.5 rounded-md',
                  'font-heading text-[11px] font-bold text-text-tertiary',
                  'hover:text-text-secondary transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
                )}
              >
                Cancel
              </button>
            </div>
            <span id="confirm-action-warning" className="sr-only">
              This action cannot be undone.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
