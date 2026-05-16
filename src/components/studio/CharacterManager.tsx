'use client';

// ============================================================
// CharacterManager — Manage characters for a title in Studio CMS
// Supports add, inline edit, delete with confirmation, and
// drag-and-drop reordering via @dnd-kit.
// Requirements: 10.2
// ============================================================

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils/cn';

// ── Types ─────────────────────────────────────────────────────

export interface Character {
  id: string;
  name: string;
  role: 'main' | 'supporting' | 'antagonist' | 'side';
  description: string | null;
  sortOrder: number;
}

export interface CharacterInput {
  name: string;
  role: 'main' | 'supporting' | 'antagonist' | 'side';
  description?: string;
}

interface CharacterManagerProps {
  titleId: string;
  characters: Character[];
  onAdd: (character: CharacterInput) => Promise<void>;
  onUpdate: (id: string, data: Partial<CharacterInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────

const ROLE_OPTIONS: { value: Character['role']; label: string }[] = [
  { value: 'main', label: 'Main' },
  { value: 'supporting', label: 'Supporting' },
  { value: 'antagonist', label: 'Antagonist' },
  { value: 'side', label: 'Side' },
];

const ROLE_COLORS: Record<Character['role'], string> = {
  main: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30',
  supporting: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30',
  antagonist: 'bg-semantic-danger/20 text-semantic-danger border-semantic-danger/30',
  side: 'bg-white/10 text-text-secondary border-white/20',
};

// ── Shared styles ─────────────────────────────────────────────

const inputClass = cn(
  'w-full px-3 py-2 rounded-lg',
  'bg-bg-deep/60 border border-white/10',
  'font-body text-sm text-text-primary placeholder:text-text-tertiary',
  'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
  'transition-colors duration-150',
);

const selectClass = cn(
  'px-3 py-2 rounded-lg',
  'bg-bg-deep/60 border border-white/10',
  'font-body text-sm text-text-primary',
  'focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30',
  'transition-colors duration-150',
);

// ── Sortable Character Row ────────────────────────────────────

interface SortableCharacterRowProps {
  character: Character;
  onUpdate: (id: string, data: Partial<CharacterInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function SortableCharacterRow({ character, onUpdate, onDelete }: SortableCharacterRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editName, setEditName] = useState(character.name);
  const [editRole, setEditRole] = useState(character.role);
  const [editDescription, setEditDescription] = useState(character.description ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: character.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // ── Inline edit handlers ──────────────────────────────────

  const handleNameBlur = useCallback(async () => {
    setIsEditingName(false);
    const trimmed = editName.trim();
    if (trimmed && trimmed !== character.name) {
      await onUpdate(character.id, { name: trimmed });
    } else {
      setEditName(character.name);
    }
  }, [editName, character.name, character.id, onUpdate]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      }
      if (e.key === 'Escape') {
        setEditName(character.name);
        setIsEditingName(false);
      }
    },
    [character.name],
  );

  const handleRoleChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRole = e.target.value as Character['role'];
      setEditRole(newRole);
      setIsEditingRole(false);
      if (newRole !== character.role) {
        await onUpdate(character.id, { role: newRole });
      }
    },
    [character.id, character.role, onUpdate],
  );

  const handleDescriptionBlur = useCallback(async () => {
    setIsEditingDescription(false);
    const trimmed = editDescription.trim();
    if (trimmed !== (character.description ?? '')) {
      await onUpdate(character.id, { description: trimmed || undefined });
    }
  }, [editDescription, character.description, character.id, onUpdate]);

  const handleDescriptionKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditDescription(character.description ?? '');
        setIsEditingDescription(false);
      }
    },
    [character.description],
  );

  // ── Delete with confirmation ──────────────────────────────

  const handleDeleteClick = useCallback(() => {
    setConfirmingDelete(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(character.id);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }, [character.id, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  // ── Truncate description for display ──────────────────────

  const truncatedDescription = character.description
    ? character.description.length > 80
      ? character.description.slice(0, 80) + '…'
      : character.description
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group p-4 rounded-lg',
        'bg-bg-surface/40 border border-white/5',
        'transition-all duration-150',
        isDragging && 'opacity-50 shadow-lg shadow-accent-primary/10 border-accent-primary/20',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          type="button"
          className={cn(
            'mt-1 shrink-0 cursor-grab active:cursor-grabbing',
            'text-text-tertiary hover:text-text-secondary transition-colors',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1 rounded',
          )}
          aria-label={`Reorder ${character.name || 'character'}`}
          {...attributes}
          {...listeners}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M5 3h2v2H5V3zm4 0h2v2H9V3zM5 7h2v2H5V7zm4 0h2v2H9V7zm-4 4h2v2H5v-2zm4 0h2v2H9v-2z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Character content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Name — inline editable */}
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className={cn(inputClass, 'w-48')}
                autoFocus
                aria-label="Edit character name"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className={cn(
                  'font-heading text-sm font-bold text-text-primary',
                  'hover:text-accent-primary transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1 rounded',
                  !character.name && 'italic text-text-tertiary',
                )}
                aria-label={`Edit name: ${character.name || 'unnamed'}`}
              >
                {character.name || 'Unnamed character'}
              </button>
            )}

            {/* Role badge — click to edit */}
            {isEditingRole ? (
              <select
                value={editRole}
                onChange={handleRoleChange}
                onBlur={() => setIsEditingRole(false)}
                className={cn(selectClass, 'text-xs py-1 px-2')}
                autoFocus
                aria-label="Edit character role"
              >
                {ROLE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingRole(true)}
                className={cn(
                  'inline-block px-2 py-0.5 rounded text-xs font-medium border',
                  'cursor-pointer hover:opacity-80 transition-opacity duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
                  ROLE_COLORS[character.role],
                )}
                aria-label={`Edit role: ${character.role}`}
              >
                {character.role}
              </button>
            )}
          </div>

          {/* Description — inline editable */}
          <div className="mt-1.5">
            {isEditingDescription ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Brief character description..."
                rows={2}
                className={cn(inputClass, 'resize-y text-xs')}
                autoFocus
                aria-label="Edit character description"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditDescription(character.description ?? '');
                  setIsEditingDescription(true);
                }}
                className={cn(
                  'text-left text-xs leading-relaxed w-full rounded px-1 py-0.5',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
                  truncatedDescription
                    ? 'text-text-secondary hover:text-text-primary hover:bg-bg-deep/40'
                    : 'text-text-tertiary italic hover:text-text-secondary hover:bg-bg-deep/40',
                )}
                aria-label="Click to edit description"
              >
                {truncatedDescription || 'Add description…'}
              </button>
            )}
          </div>
        </div>

        {/* Delete button / confirmation */}
        <div className="shrink-0 mt-1">
          {confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium',
                  'bg-semantic-danger/20 text-semantic-danger border border-semantic-danger/30',
                  'hover:bg-semantic-danger/30 transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-semantic-danger focus-visible:outline-offset-1',
                  isDeleting && 'opacity-50 cursor-not-allowed',
                )}
                aria-label="Confirm delete"
              >
                {isDeleting ? '…' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={handleDeleteCancel}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium',
                  'bg-white/5 text-text-secondary border border-white/10',
                  'hover:bg-white/10 transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
                )}
                aria-label="Cancel delete"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeleteClick}
              className={cn(
                'p-1.5 rounded-md',
                'text-text-tertiary hover:text-semantic-danger hover:bg-semantic-danger/10',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-semantic-danger focus-visible:outline-offset-1',
                'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
              )}
              aria-label={`Delete ${character.name || 'character'}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M6 2h4v1H6V2zM3 4h10v1H3V4zm1 2h8l-.5 8H4.5L4 6zm3 1v5h2V7H7z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Character Form ────────────────────────────────────────

interface AddCharacterFormProps {
  onAdd: (character: CharacterInput) => Promise<void>;
  onCancel: () => void;
}

function AddCharacterForm({ onAdd, onCancel }: AddCharacterFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Character['role']>('supporting');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = name.trim();
      if (!trimmedName) return;

      setIsSubmitting(true);
      try {
        await onAdd({
          name: trimmedName,
          role,
          description: description.trim() || undefined,
        });
        setName('');
        setRole('supporting');
        setDescription('');
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, role, description, onAdd],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'p-4 rounded-lg',
        'bg-bg-surface/40 border border-accent-primary/20',
      )}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        {/* Name */}
        <div>
          <label htmlFor="new-char-name" className="sr-only">
            Character name
          </label>
          <input
            id="new-char-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Character name *"
            required
            className={inputClass}
            autoFocus
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="new-char-role" className="sr-only">
            Character role
          </label>
          <select
            id="new-char-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Character['role'])}
            className={cn(selectClass, 'w-full')}
          >
            {ROLE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="new-char-desc" className="sr-only">
            Character description
          </label>
          <textarea
            id="new-char-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief character description (optional)"
            rows={2}
            className={cn(inputClass, 'resize-y')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-bold',
            'bg-accent-primary text-white',
            'hover:bg-accent-primary/90 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isSubmitting ? 'Adding…' : 'Add Character'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-medium',
            'bg-white/5 text-text-secondary border border-white/10',
            'hover:bg-white/10 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1',
          )}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────

export function CharacterManager({
  titleId,
  characters,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: CharacterManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedCharacters = [...characters].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = sortedCharacters.findIndex((c) => c.id === active.id);
        const newIndex = sortedCharacters.findIndex((c) => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(sortedCharacters, oldIndex, newIndex);
          await onReorder(reordered.map((c) => c.id));
        }
      }
    },
    [sortedCharacters, onReorder],
  );

  const handleAdd = useCallback(
    async (character: CharacterInput) => {
      await onAdd(character);
      setShowAddForm(false);
    },
    [onAdd],
  );

  return (
    <div className="flex flex-col gap-4" data-title-id={titleId}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider">
          Characters
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add Character
          </button>
        )}
      </div>

      {/* Add character form */}
      {showAddForm && (
        <AddCharacterForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Character list */}
      {sortedCharacters.length === 0 ? (
        <div className="p-6 rounded-lg bg-bg-surface/20 border border-white/5 text-center">
          <p className="text-text-tertiary text-sm">
            No characters added yet. Click &ldquo;Add Character&rdquo; to get started.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCharacters.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2" role="list" aria-label="Characters list">
              {sortedCharacters.map((character) => (
                <div key={character.id} role="listitem">
                  <SortableCharacterRow
                    character={character}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Character count */}
      {sortedCharacters.length > 0 && (
        <p className="text-text-tertiary text-xs text-right">
          {sortedCharacters.length} character{sortedCharacters.length !== 1 ? 's' : ''} • Drag to reorder
        </p>
      )}
    </div>
  );
}
