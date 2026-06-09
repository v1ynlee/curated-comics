'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, MoreVertical, Save, Send, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { StudioField } from '@/components/studio/shared/StudioField';
import type { PublicationState } from '@/types/article';

type PublishAction = 'draft' | 'published' | 'scheduled';

interface ArticlePublishingPanelProps {
  mode: 'create' | 'edit';
  publicationState: PublicationState;
  scheduledDate?: string;
  canSave: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  onPublicationStateChange: (value: PublicationState) => void;
  onScheduledDateChange: (value: string | undefined) => void;
  onSave: (publicationState?: PublicationState) => void;
}

export function ArticlePublishingPanel({
  mode,
  publicationState,
  scheduledDate,
  canSave,
  isSubmitting,
  isUploading,
  onPublicationStateChange,
  onScheduledDateChange,
  onSave,
}: ArticlePublishingPanelProps) {
  const initialAction: PublishAction = publicationState === 'scheduled' || publicationState === 'published'
    ? publicationState
    : 'published';
  const [selectedAction, setSelectedAction] = useState<PublishAction>(initialAction);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = PUBLISH_ACTIONS.find((action) => action.value === selectedAction) ?? PUBLISH_ACTIONS[0];
  const SelectedIcon = selectedOption.icon;
  const disabled = isSubmitting;

  function selectAction(value: PublishAction) {
    setSelectedAction(value);
    onPublicationStateChange(value);
    setOpen(false);
    toast.info(value === 'published' ? 'Publish selected.' : value === 'scheduled' ? 'Schedule selected.' : 'Draft selected.');
  }

  function handlePrimaryAction() {
    if (!canSave) {
      toast.warning('Add a title and body before saving.');
      return;
    }
    if (selectedAction === 'scheduled' && !scheduledDate) {
      toast.warning('Choose a scheduled date first.');
      return;
    }
    toast.info(selectedAction === 'published' ? 'Publish requested.' : selectedAction === 'scheduled' ? 'Schedule requested.' : 'Draft save requested.');
    onSave(selectedAction);
  }

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="rounded-lg border border-white/10 bg-bg-surface/35 p-3">
      <div className="flex flex-col items-start gap-3">
        <div className="flex gap-0">
          <button
            type="button"
            disabled={disabled}
            onClick={handlePrimaryAction}
            className="inline-flex min-h-11 min-w-36 items-center justify-center gap-2 rounded-l-md bg-accent-primary px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-primary/90 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SelectedIcon size={16} aria-hidden="true" />
            {selectedOption.label}
          </button>
          <div ref={ref} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Select publishing action"
              disabled={isSubmitting}
              onClick={() => setOpen((current) => !current)}
              className="inline-flex min-h-11 w-11 items-center justify-center rounded-r-md border-l border-white/20 bg-accent-primary text-white transition-colors duration-150 hover:bg-accent-primary/90 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MoreVertical size={16} aria-hidden="true" />
            </button>
            {open && (
              <div className="studio-dropdown-panel absolute right-0 top-full z-40 mt-1 w-48 overflow-hidden rounded-md border border-white/10 bg-bg-surface py-1 shadow-lg shadow-black/15" role="menu">
                {PUBLISH_ACTIONS.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={action.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selectedAction === action.value}
                      onClick={() => selectAction(action.value)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-100 hover:bg-white/5 hover:text-text-primary',
                        selectedAction === action.value ? 'text-accent-primary' : 'text-text-secondary',
                      )}
                    >
                      <ActionIcon size={14} aria-hidden="true" />
                      {action.menuLabel}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedAction === 'scheduled' && (
        <div className="mt-3 max-w-sm">
          <StudioField label="Scheduled date" htmlFor="article-scheduled-date">
            <input
              id="article-scheduled-date"
              type="datetime-local"
              value={scheduledDate ?? ''}
              onChange={(event) => onScheduledDateChange(event.target.value || undefined)}
              className="studio-input min-h-10 py-2 text-sm"
            />
          </StudioField>
          {!scheduledDate && <p className="mt-2 text-xs text-text-tertiary">Add a scheduled date before publishing later.</p>}
        </div>
      )}

      {(isSubmitting || isUploading) && (
        <p className="mt-3 text-xs text-text-tertiary">
          {isUploading ? 'Uploading thumbnail...' : mode === 'create' ? 'Creating article...' : 'Saving article...'}
        </p>
      )}
    </div>
  );
}

const PUBLISH_ACTIONS: { value: PublishAction; label: string; menuLabel: string; icon: LucideIcon }[] = [
  { value: 'published', label: 'Publish', menuLabel: 'Publish', icon: Send },
  { value: 'draft', label: 'Save Draft', menuLabel: 'Save Draft', icon: Save },
  { value: 'scheduled', label: 'Schedule', menuLabel: 'Schedule', icon: CalendarClock },
];
