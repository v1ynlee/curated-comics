'use client';

// ============================================================
// CardWrapper — Shared wrapper providing per-card save/cancel behavior
// Implements state machine: EDITING → SAVING → SAVED (disabled) → EDITING
// Each card has its own save button with icon, and a cancel button
// appears in the saved/disabled state to restore editing.
// Requirements: 12.1, 12.2, 12.3, 12.4
// ============================================================

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Save, X, Loader2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

type CardState = 'editing' | 'saving' | 'saved';

export interface CardWrapperProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────

export function CardWrapper({
  title,
  icon,
  children,
  onSave,
  disabled: externalDisabled = false,
}: CardWrapperProps) {
  const [cardState, setCardState] = useState<CardState>('editing');

  const isDisabled = cardState === 'saved' || cardState === 'saving' || externalDisabled;
  const isSaving = cardState === 'saving';
  const isSaved = cardState === 'saved';

  // ── Save handler ──────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (isDisabled) return;

    setCardState('saving');
    try {
      await onSave();
      setCardState('saved');
    } catch {
      // On error, return to editing state so user can retry
      setCardState('editing');
    }
  }, [onSave, isDisabled]);

  // ── Cancel handler ────────────────────────────────────────

  const handleCancel = useCallback(() => {
    setCardState('editing');
  }, []);

  // ── Render ────────────────────────────────────────────────

  return (
    <fieldset
      disabled={isDisabled}
      className={cn(
        'p-5 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        'transition-opacity duration-200',
        isDisabled && 'opacity-70',
      )}
    >
      {/* Header row: icon + title + action buttons */}
      <div className="flex items-center justify-between mb-4">
        <legend className="flex items-center gap-2 font-heading text-sm font-bold text-text-primary uppercase tracking-wider">
          {icon && (
            <span className="text-accent-primary" aria-hidden="true">
              {icon}
            </span>
          )}
          {title}
        </legend>

        <div className="flex items-center gap-2">
          {/* Cancel button — visible only in saved state */}
          {isSaved && (
            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'bg-white/5 border border-white/10 text-text-secondary',
                'hover:bg-white/10 hover:text-text-primary',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              )}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              Cancel
            </button>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isDisabled}
            aria-label={`Save ${title}`}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-accent-primary/20 text-accent-primary',
              'hover:bg-accent-primary/30',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              isDisabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Card content — children are disabled via fieldset when in saved/saving state */}
      <div className={cn(isSaved && 'pointer-events-none select-none')}>
        {children}
      </div>
    </fieldset>
  );
}
