'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, FolderPlus, Tag, Tags } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { StudioSelect } from '@/components/studio/shared/StudioSelect';
import type { CategoryOption, TagOption } from './article-editor-types';

interface ArticleMetadataPanelProps {
  categoryId?: string;
  categories: CategoryOption[];
  newCategoryName: string;
  canCreateCategory: boolean;
  tags: TagOption[];
  selectedTagIds: string[];
  newTagName: string;
  canCreateTag: boolean;
  onCategoryChange: (value: string | undefined) => void;
  onNewCategoryNameChange: (value: string) => void;
  onCreateCategory: () => void;
  onToggleTag: (tagId: string) => void;
  onNewTagNameChange: (value: string) => void;
  onCreateTag: () => void;
}

export function ArticleMetadataPanel({
  categoryId,
  categories,
  newCategoryName,
  canCreateCategory,
  tags,
  selectedTagIds,
  newTagName,
  canCreateTag,
  onCategoryChange,
  onNewCategoryNameChange,
  onCreateCategory,
  onToggleTag,
  onNewTagNameChange,
  onCreateTag,
}: ArticleMetadataPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
      <h2 className="mb-3 text-sm font-medium text-text-primary">Metadata</h2>
      <div className="space-y-5">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-text-secondary">Category</span>
          <StudioSelect
            label="Category"
            value={categoryId ?? ''}
            options={[{ value: '', label: 'Unassigned' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
            onChange={(value) => onCategoryChange(value || undefined)}
            hideLabel
            maxMenuHeightClassName="max-h-[14rem]"
            menuClassName="studio-dropdown-scroll"
          />
          {canCreateCategory && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(event) => onNewCategoryNameChange(event.target.value)}
                placeholder="New category"
                className="studio-input min-h-9 py-2 text-xs"
              />
              <button type="button" onClick={onCreateCategory} className="studio-secondary-button shrink-0 gap-1.5">
                <FolderPlus size={14} aria-hidden="true" />
                Add
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-text-secondary">Tags</span>
            <span className="font-data text-[11px] text-text-tertiary">{selectedTagIds.length} selected</span>
          </div>
          <GroupedTagDropdown tags={tags} selectedTagIds={selectedTagIds} onToggleTag={onToggleTag} />
          {canCreateTag && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(event) => onNewTagNameChange(event.target.value)}
                placeholder="New tag"
                className="studio-input min-h-9 py-2 text-xs"
              />
              <button type="button" onClick={onCreateTag} className="studio-secondary-button shrink-0 gap-1.5">
                <Tag size={14} aria-hidden="true" />
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GroupedTagDropdown({
  tags,
  selectedTagIds,
  onToggleTag,
}: {
  tags: TagOption[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const selectedNames = useMemo(() => (
    tags.filter((tagItem) => selectedTagIds.includes(tagItem.id)).map((tagItem) => tagItem.name)
  ), [selectedTagIds, tags]);

  const groupedTags = useMemo(() => {
    const groups = new Map<string, TagOption[]>();
    [...tags]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((tagItem) => {
        const letter = /^[a-z]/i.test(tagItem.name) ? tagItem.name.charAt(0).toUpperCase() : '#';
        groups.set(letter, [...(groups.get(letter) ?? []), tagItem]);
      });
    return Array.from(groups.entries());
  }, [tags]);

  const label = selectedNames.length === 0
    ? 'Select tags'
    : selectedNames.length <= 2
      ? selectedNames.map((name) => `#${name}`).join(', ')
      : `${selectedNames.slice(0, 2).map((name) => `#${name}`).join(', ')} +${selectedNames.length - 2}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-white/10 bg-bg-deep/60 px-3 text-left text-sm text-text-primary transition-colors duration-150 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <Tags size={15} className="shrink-0 text-text-tertiary" aria-hidden="true" />
          <span className="min-w-0 truncate">{label}</span>
        </span>
        <ChevronDown size={15} className={cn('shrink-0 text-text-tertiary transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div
          data-lenis-prevent=""
          data-lenis-prevent-wheel=""
          data-lenis-prevent-touch=""
          onWheel={(event) => event.stopPropagation()}
          className="studio-dropdown-panel studio-dropdown-scroll absolute left-0 right-0 top-full z-50 mt-1 max-h-[16rem] rounded-md border border-white/10 bg-bg-surface py-1 shadow-lg shadow-black/15"
        >
          <div role="listbox" aria-label="Tags" aria-multiselectable="true">
            {groupedTags.length === 0 && <div className="px-3 py-2 text-sm text-text-tertiary">No tags yet.</div>}
            {groupedTags.map(([letter, items], index) => (
              <div key={letter} className={cn(index > 0 && 'mt-1 border-t border-white/10 pt-1')}>
                <div className="px-3 py-1 font-data text-[11px] text-text-tertiary">{letter}</div>
                {items.map((tagItem) => {
                  const selected = selectedTagIds.includes(tagItem.id);
                  return (
                    <button
                      key={tagItem.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => onToggleTag(tagItem.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors duration-100',
                        selected ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
                      )}
                    >
                      <span className="min-w-0 truncate">#{tagItem.name}</span>
                      {selected && <Check size={14} className="shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
