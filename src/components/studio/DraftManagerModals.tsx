'use client';

import { CheckCircle2 } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import type { StudioDraft } from '@/hooks/useDraftManager';

interface DraftManagerModalsProps<TData> {
  draft: StudioDraft<TData> | null;
  showRecovery: boolean;
  showUnsaved: boolean;
  onContinueDraft: () => void;
  onStartFresh: () => void;
  onDeleteDraft: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

function formatDraftDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value));
}

export function DraftManagerModals<TData>({
  draft,
  showRecovery,
  showUnsaved,
  onContinueDraft,
  onStartFresh,
  onDeleteDraft,
  onSaveDraft,
  onDiscard,
  onCancel,
}: DraftManagerModalsProps<TData>) {
  return (
    <>
      {showUnsaved && (
        <ModalPortal>
          <div className="fixed left-0 top-0 z-modal flex h-[100dvh] w-[100dvw] items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-lg border border-white/10 bg-bg-surface p-5 shadow-lg shadow-black/30">
              <h2 className="font-heading text-lg font-semibold text-text-primary">You have unsaved changes.</h2>
              <p className="mt-2 font-body text-sm text-text-secondary">Leaving now will discard your edits.</p>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={onCancel} className="rounded-md px-3 py-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">Cancel</button>
                <button type="button" onClick={onDiscard} className="rounded-md border border-white/10 px-3 py-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">Discard Changes</button>
                <button type="button" onClick={onSaveDraft} className="rounded-md bg-accent-primary px-3 py-2 font-heading text-sm text-white hover:bg-accent-primary/90">Save Draft</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {showRecovery && draft && (
        <ModalPortal>
          <div className="fixed left-0 top-0 z-modal flex h-[100dvh] w-[100dvw] items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg rounded-lg border border-white/10 bg-bg-surface p-5 shadow-lg shadow-black/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent-primary" aria-hidden="true" />
                <div>
                  <h2 className="font-heading text-lg font-semibold text-text-primary">Draft Found</h2>
                  <p className="mt-1 font-body text-sm text-text-secondary">You have an unsaved draft from {formatDraftDate(draft.savedAt)}.</p>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-white/10 bg-bg-deep/35 p-3">
                <p className="font-body text-sm font-medium text-text-primary">{draft.title}</p>
                <p className="mt-1 line-clamp-2 font-body text-xs text-text-tertiary">{draft.preview || 'No preview available.'}</p>
                <p className="mt-2 font-data text-xs text-text-tertiary">Last modified {formatDraftDate(draft.savedAt)}</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={onDeleteDraft} className="rounded-md px-3 py-2 font-body text-sm text-text-tertiary hover:bg-white/5 hover:text-text-primary">Delete Draft</button>
                <button type="button" onClick={onStartFresh} className="rounded-md border border-white/10 px-3 py-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">Start Fresh</button>
                <button type="button" onClick={onContinueDraft} className="rounded-md bg-accent-primary px-3 py-2 font-heading text-sm text-white hover:bg-accent-primary/90">Continue Draft</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
