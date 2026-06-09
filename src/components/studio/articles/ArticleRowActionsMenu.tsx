'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Archive, Eye, MoreVertical, Pencil, Pin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StudioArticleRow } from '@/types/studio';

interface ArticleRowActionsMenuProps {
  article: StudioArticleRow;
  pendingKey: string | null;
  onToggleFeatured: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ArticleRowActionsMenu({
  article,
  pendingKey,
  onToggleFeatured,
  onArchive,
  onDelete,
}: ArticleRowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
        setConfirmingDelete(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setConfirmingDelete(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const previewHref = article.publicationState === 'published' ? `/news/${article.slug}` : `/studio/articles/${article.slug}`;

  const menuItemClass = cn(
    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors duration-100',
    'hover:bg-white/5 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-[-2px]',
  );

  return (
    <div ref={ref} className="relative inline-flex justify-end">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Open actions for ${article.title}`}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 w-6 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
      >
        <MoreVertical size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="studio-dropdown-panel absolute right-0 top-full z-40 mt-1 w-48 overflow-hidden rounded-md border border-white/10 bg-bg-surface py-1 shadow-lg shadow-black/15" role="menu">
          <Link href={`/studio/articles/${article.slug}`} className={menuItemClass} role="menuitem" onClick={() => setOpen(false)}>
            <Pencil size={14} aria-hidden="true" />
            Edit
          </Link>
          <Link href={previewHref} className={menuItemClass} role="menuitem" onClick={() => setOpen(false)}>
            <Eye size={14} aria-hidden="true" />
            Preview
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={pendingKey === `pin-${article.id}`}
            onClick={() => {
              onToggleFeatured();
              setOpen(false);
            }}
            className={cn(menuItemClass, article.featured && 'text-accent-secondary', 'disabled:cursor-not-allowed disabled:opacity-50')}
          >
            <Pin size={14} aria-hidden="true" />
            {article.featured ? 'Unpin' : 'Pin'}
          </button>
          {article.publicationState !== 'archived' && (
            <button
              type="button"
              role="menuitem"
              disabled={pendingKey === `archive-${article.id}`}
              onClick={() => {
                onArchive();
                setOpen(false);
              }}
              className={cn(menuItemClass, 'disabled:cursor-not-allowed disabled:opacity-50')}
            >
              <Archive size={14} aria-hidden="true" />
              Archive
            </button>
          )}
          {confirmingDelete ? (
            <div className="border-t border-white/10 p-2">
              <button
                type="button"
                disabled={pendingKey === `delete-${article.id}`}
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
                className="mb-1 flex w-full items-center justify-center rounded-md border border-semantic-danger/30 bg-semantic-danger/10 px-3 py-2 text-sm text-semantic-danger transition-colors duration-150 hover:bg-semantic-danger/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm text-text-tertiary transition-colors duration-150 hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmingDelete(true)}
              className={cn(menuItemClass, 'text-semantic-danger hover:text-semantic-danger')}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
