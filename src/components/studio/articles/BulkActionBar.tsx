'use client';

import type { BulkOperation } from './article-dashboard-types';

interface BulkActionBarProps {
  selectedCount: number;
  pendingKey: string | null;
  confirmBulkDelete: boolean;
  onAction: (operation: BulkOperation) => void;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, pendingKey, confirmBulkDelete, onAction, onClear }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-accent-primary/25 bg-accent-primary/10 p-3 text-sm text-text-primary md:flex-row md:items-center md:justify-between">
      <span>{selectedCount} selected</span>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onAction('draft')} className="bulk-action-button" disabled={pendingKey === 'bulk-draft'}>
          Mark draft
        </button>
        <button type="button" onClick={() => onAction('published')} className="bulk-action-button" disabled={pendingKey === 'bulk-published'}>
          Publish
        </button>
        <button type="button" onClick={() => onAction('archived')} className="bulk-action-button" disabled={pendingKey === 'bulk-archived'}>
          Archive
        </button>
        <button
          type="button"
          onClick={() => onAction('delete')}
          className="rounded-md border border-semantic-danger/30 bg-semantic-danger/10 px-3 py-2 text-xs text-semantic-danger transition-colors duration-150 hover:bg-semantic-danger/15 disabled:opacity-50"
          disabled={pendingKey === 'bulk-delete'}
        >
          {confirmBulkDelete ? 'Confirm delete' : 'Delete'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-3 py-2 text-xs text-text-secondary transition-colors duration-150 hover:text-text-primary"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
