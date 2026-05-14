'use client';

// ============================================================
// ReadingUrlManager — Manage external reading links for a title
// Supports adding, inline editing, and removing reading URLs
// with platform name, URL, and display label fields.
// Requirements: 10.4
// ============================================================

import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

// ── Types ─────────────────────────────────────────────────────

export interface ReadingUrl {
  id: string;
  url: string;
  platform: string;
  label: string;
}

export interface ReadingUrlInput {
  url: string;
  platform: string;
  label: string;
}

// ── Props ─────────────────────────────────────────────────────

interface ReadingUrlManagerProps {
  titleId: string;
  urls: ReadingUrl[];
  onAdd: (url: ReadingUrlInput) => Promise<void>;
  onUpdate: (id: string, data: Partial<ReadingUrlInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ── Shared styles ─────────────────────────────────────────────

const inputClass = cn(
  'w-full px-3 py-2 rounded-lg',
  'bg-bg-deep/60 border border-white/10',
  'font-body text-sm text-text-primary placeholder:text-text-tertiary',
  'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
  'transition-colors duration-150',
);

// ── Inline Add Form ───────────────────────────────────────────

interface AddFormProps {
  onSubmit: (data: ReadingUrlInput) => Promise<void>;
  onCancel: () => void;
}

function AddForm({ onSubmit, onCancel }: AddFormProps) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [label, setLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !platform.trim() || !label.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ url: url.trim(), platform: platform.trim(), label: label.trim() });
      setUrl('');
      setPlatform('');
      setLabel('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'p-4 rounded-lg',
        'bg-bg-surface/40 border border-accent-primary/20',
      )}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="new-platform" className="block text-xs font-medium text-text-secondary mb-1">
            Platform
          </label>
          <input
            id="new-platform"
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. Tappytoon"
            className={inputClass}
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="new-label" className="block text-xs font-medium text-text-secondary mb-1">
            Display Label
          </label>
          <input
            id="new-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Read on Tappytoon"
            className={inputClass}
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="new-url" className="block text-xs font-medium text-text-secondary mb-1">
            URL
          </label>
          <input
            id="new-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          type="submit"
          disabled={submitting || !url.trim() || !platform.trim() || !label.trim()}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'bg-accent-primary/20 text-accent-primary font-heading text-xs font-bold',
            'hover:bg-accent-primary/30 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {submitting ? 'Adding...' : 'Save Link'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium',
            'text-text-secondary hover:text-text-primary',
            'hover:bg-white/5 transition-colors duration-150',
          )}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Reading URL Row ───────────────────────────────────────────

interface UrlRowProps {
  entry: ReadingUrl;
  onUpdate: (id: string, data: Partial<ReadingUrlInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function UrlRow({ entry, onUpdate, onDelete }: UrlRowProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editUrl, setEditUrl] = useState(entry.url);
  const [editPlatform, setEditPlatform] = useState(entry.platform);
  const [editLabel, setEditLabel] = useState(entry.label);

  const startEdit = useCallback(() => {
    setEditUrl(entry.url);
    setEditPlatform(entry.platform);
    setEditLabel(entry.label);
    setEditing(true);
    setConfirmDelete(false);
  }, [entry]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const saveEdit = useCallback(async () => {
    const updates: Partial<ReadingUrlInput> = {};
    if (editUrl.trim() !== entry.url) updates.url = editUrl.trim();
    if (editPlatform.trim() !== entry.platform) updates.platform = editPlatform.trim();
    if (editLabel.trim() !== entry.label) updates.label = editLabel.trim();

    if (Object.keys(updates).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onUpdate(entry.id, updates);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [entry, editUrl, editPlatform, editLabel, onUpdate]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [entry.id, onDelete]);

  // ── Edit mode ──
  if (editing) {
    return (
      <div
        className={cn(
          'p-4 rounded-lg',
          'bg-bg-surface/40 border border-accent-primary/20',
        )}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`edit-platform-${entry.id}`} className="block text-xs font-medium text-text-secondary mb-1">
              Platform
            </label>
            <input
              id={`edit-platform-${entry.id}`}
              type="text"
              value={editPlatform}
              onChange={(e) => setEditPlatform(e.target.value)}
              placeholder="Platform"
              className={inputClass}
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor={`edit-label-${entry.id}`} className="block text-xs font-medium text-text-secondary mb-1">
              Display Label
            </label>
            <input
              id={`edit-label-${entry.id}`}
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="Label"
              className={inputClass}
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor={`edit-url-${entry.id}`} className="block text-xs font-medium text-text-secondary mb-1">
              URL
            </label>
            <input
              id={`edit-url-${entry.id}`}
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={saveEdit}
            disabled={saving || !editUrl.trim() || !editPlatform.trim() || !editLabel.trim()}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'bg-accent-primary/20 text-accent-primary font-heading text-xs font-bold',
              'hover:bg-accent-primary/30 transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium',
              'text-text-secondary hover:text-text-primary',
              'hover:bg-white/5 transition-colors duration-150',
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Display mode ──
  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        'transition-all duration-150',
        'hover:border-white/10',
      )}
    >
      {/* Platform badge */}
      <span
        className={cn(
          'shrink-0 inline-block px-2 py-0.5 rounded text-xs font-medium border',
          'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30',
        )}
      >
        {entry.platform}
      </span>

      {/* Label and URL */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary font-medium truncate">{entry.label}</p>
        <p className="text-xs text-text-tertiary truncate">{entry.url}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        {confirmDelete ? (
          <>
            <span className="text-xs text-semantic-danger mr-1">Delete?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                'bg-semantic-danger/20 text-semantic-danger',
                'hover:bg-semantic-danger/30 transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-semantic-danger focus-visible:outline-offset-1',
                'disabled:opacity-50',
              )}
              aria-label={`Confirm delete ${entry.platform} link`}
            >
              {deleting ? '...' : 'Yes'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                'text-text-secondary hover:text-text-primary',
                'hover:bg-white/5 transition-colors duration-150',
              )}
              aria-label="Cancel delete"
            >
              No
            </button>
          </>
        ) : (
          <>
            {/* Edit button */}
            <button
              type="button"
              onClick={startEdit}
              className={cn(
                'p-1.5 rounded-md',
                'text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
              )}
              aria-label={`Edit ${entry.platform} link`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={cn(
                'p-1.5 rounded-md',
                'text-text-tertiary hover:text-semantic-danger hover:bg-semantic-danger/10',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-semantic-danger focus-visible:outline-offset-1',
              )}
              aria-label={`Delete ${entry.platform} link`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export function ReadingUrlManager({
  titleId: _titleId,
  urls,
  onAdd,
  onUpdate,
  onDelete,
}: ReadingUrlManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = useCallback(
    async (data: ReadingUrlInput) => {
      await onAdd(data);
      setShowAddForm(false);
    },
    [onAdd],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider">
          Reading Links
        </h3>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'bg-accent-primary/20 text-accent-primary font-heading text-xs font-bold',
              'hover:bg-accent-primary/30 transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add Link
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} />
      )}

      {/* URL list */}
      {urls.length === 0 ? (
        <div className="p-6 rounded-lg bg-bg-surface/20 border border-white/5 text-center">
          <p className="text-text-tertiary text-sm">
            No reading links added yet. Click &ldquo;Add Link&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="Reading links list">
          {urls.map((entry) => (
            <div key={entry.id} role="listitem">
              <UrlRow entry={entry} onUpdate={onUpdate} onDelete={onDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
