'use client';

// ============================================================
// ConfirmDialog — A simple modal confirmation dialog for Studio
// Used by the TitleEditor global Save Title button (Req 12.6)
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the confirm button when dialog opens
  useEffect(() => {
    if (open) {
      confirmButtonRef.current?.focus();
    }
  }, [open]);

  // Handle Escape key to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    },
    [onCancel, loading]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !loading) {
        onCancel();
      }
    },
    [onCancel, loading]
  );

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/60 backdrop-blur-sm',
        'animate-in fade-in duration-150',
      )}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={dialogRef}
        className={cn(
          'w-full max-w-md mx-4 p-6 rounded-xl',
          'bg-bg-surface border border-white/10',
          'shadow-2xl shadow-black/40',
          'animate-in zoom-in-95 duration-150',
        )}
      >
        <h2
          id="confirm-dialog-title"
          className="font-heading text-lg font-bold text-text-primary mb-2"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="font-body text-sm text-text-secondary mb-6"
        >
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(
              'px-4 py-2.5 rounded-lg',
              'font-heading text-sm font-medium',
              'text-text-secondary hover:text-text-primary',
              'bg-bg-deep/60 border border-white/10',
              'hover:bg-bg-deep/80 transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2.5 rounded-lg',
              'font-heading text-sm font-bold',
              'bg-accent-primary text-white',
              'hover:bg-accent-primary/90 transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {loading ? 'Saving...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
