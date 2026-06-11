'use client';

// ============================================================
// CardWrapper — Shared wrapper providing per-card save/cancel behavior
// Implements state machine: EDITING → SAVING → SAVED (disabled) → EDITING
// Each card has its own save button with icon, and a cancel button
// appears in the saved/disabled state to restore editing.
// Requirements: 12.1, 12.2, 12.3, 12.4
// ============================================================

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { Save, X, Loader2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

type CardState = 'editing' | 'saving' | 'saved';

export interface CardWrapperProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  isDirty?: boolean;
  isValid?: boolean;
  actions?: React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────

export function CardWrapper({
  title,
  icon,
  children,
  onSave,
  onCancel,
  disabled: externalDisabled = false,
  isDirty = true,
  isValid = true,
  actions,
}: CardWrapperProps) {
  const [cardState, setCardState] = useState<CardState>('editing');

  const contentDisabled = cardState === 'saved' || cardState === 'saving' || externalDisabled;
  const saveDisabled = contentDisabled || !isDirty || !isValid;
  const isSaving = cardState === 'saving';
  const isSaved = cardState === 'saved';
  const showCancel = isSaved || isDirty;

  // ── Save handler ──────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (saveDisabled) return;

    setCardState('saving');
    toast.loading(`Saving ${title.toLowerCase()}...`, { id: `card-${title}` });
    try {
      await onSave();
      setCardState('saved');
      toast.success(`${title} saved.`, { id: `card-${title}` });
    } catch (error) {
      // On error, return to editing state so user can retry
      setCardState('editing');
      toast.error(error instanceof Error ? error.message : `${title} save failed.`, { id: `card-${title}` });
    }
  }, [onSave, saveDisabled, title]);

  // ── Cancel handler ────────────────────────────────────────

  const handleCancel = useCallback(() => {
    onCancel?.();
    setCardState('editing');
    toast.info(`${title} changes restored.`);
  }, [onCancel, title]);

  // ── Render ────────────────────────────────────────────────

  return (
    <fieldset
      className={cn(
        'p-5 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        'transition-opacity duration-200',
        contentDisabled && 'opacity-70',
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
          {actions}
          {/* Cancel button — visible when there is state to restore */}
          {showCancel && (
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
            disabled={saveDisabled}
            aria-disabled={saveDisabled}
            aria-label={`Save ${title}`}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-accent-primary/20 text-accent-primary',
              'hover:bg-accent-primary/30',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
              saveDisabled && 'opacity-50 cursor-not-allowed',
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
      <fieldset disabled={contentDisabled} className={cn(isSaved && 'pointer-events-none select-none')}>
        {children}
      </fieldset>
    </fieldset>
  );
}
