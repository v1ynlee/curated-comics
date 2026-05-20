'use client';

// ============================================================
// ArticleActions — Client component for article row actions.
// Wraps destructive actions (Archive, Delete) with inline
// confirmation via ConfirmAction. Shows toast on completion.
// Handles errors gracefully with error toasts.
// Responsive: icon-only on mobile, icon+label on desktop.
// Touch targets: min 44px on mobile.
// ============================================================

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Archive, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ConfirmAction } from '@/components/studio/ConfirmAction';
import { useToast } from '@/components/ui/Toast';

// ── Types ─────────────────────────────────────────────────────

interface ArticleActionsProps {
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  publicationState: string;
  archiveAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

// ── Component ─────────────────────────────────────────────────

export function ArticleActions({
  articleId,
  articleSlug,
  articleTitle,
  publicationState,
  archiveAction,
  deleteAction,
}: ArticleActionsProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const [archiving, startArchive] = useTransition();
  const [deleting, startDelete] = useTransition();

  const handleArchive = () => {
    const formData = new FormData();
    formData.set('id', articleId);
    startArchive(async () => {
      const result = await archiveAction(formData);
      if (result.success) {
        addToast({
          type: 'success',
          message: `"${articleTitle}" archived.`,
        });
        router.refresh();
      } else {
        addToast({
          type: 'error',
          message: result.error ?? 'Failed to archive article.',
        });
      }
    });
  };

  const handleDelete = () => {
    const formData = new FormData();
    formData.set('id', articleId);
    startDelete(async () => {
      const result = await deleteAction(formData);
      if (result.success) {
        addToast({
          type: 'success',
          message: `"${articleTitle}" deleted.`,
        });
        router.refresh();
      } else {
        addToast({
          type: 'error',
          message: result.error ?? 'Failed to delete article.',
        });
      }
    });
  };

  // Shared button classes with proper touch targets
  const actionBtnBase = cn(
    'inline-flex items-center justify-center rounded-md',
    'font-heading text-[11px] font-bold',
    'transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
    // Mobile: icon-only with 44px touch target
    'min-h-[44px] min-w-[44px] p-2',
    // Desktop: icon + label with padding
    'sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-2',
  );

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {/* Edit — safe action, no confirmation needed */}
      <Link
        href={`/studio/articles/${articleSlug}`}
        className={cn(
          actionBtnBase,
          'bg-white/5 text-text-secondary',
          'hover:bg-white/10 hover:text-text-primary',
        )}
        aria-label={`Edit ${articleTitle}`}
      >
        <Pencil size={14} aria-hidden="true" />
        <span className="hidden sm:inline ml-1.5">Edit</span>
      </Link>

      {/* Archive — requires confirmation */}
      {publicationState !== 'archived' && (
        <ConfirmAction
          message="Archive?"
          confirmLabel="Archive"
          confirmVariant="warning"
          onConfirm={handleArchive}
          loading={archiving}
          trigger={
            <span
              className={cn(
                actionBtnBase,
                'bg-white/5 text-text-secondary',
                'hover:bg-yellow-500/10 hover:text-yellow-400',
              )}
              aria-label={`Archive ${articleTitle}`}
            >
              <Archive size={14} aria-hidden="true" />
              <span className="hidden sm:inline ml-1.5">Archive</span>
            </span>
          }
        />
      )}

      {/* Delete — requires confirmation */}
      <ConfirmAction
        message="Delete?"
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        loading={deleting}
        trigger={
          <span
            className={cn(
              actionBtnBase,
              'bg-white/5 text-text-secondary',
              'hover:bg-red-500/10 hover:text-red-400',
            )}
            aria-label={`Delete ${articleTitle}`}
          >
            <Trash2 size={14} aria-hidden="true" />
            <span className="hidden sm:inline ml-1.5">Delete</span>
          </span>
        }
      />
    </div>
  );
}
