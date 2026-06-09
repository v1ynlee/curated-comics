'use client';

// ============================================================
// Mood Themes Tab — discover theme curation
// ============================================================

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import {
  closestCenter,
  DndContext,
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
import { GripVertical, Image as ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getErrorMessage, toast } from '@/lib/utils/toast';
import { ActionMenu } from './ActionMenu';
import { PaginationControls } from './PaginationControls';
import { SectionPanel } from './SectionPanel';
import {
  assignTitlesToTheme,
  deleteTheme,
  removeTitleFromTheme,
  reorderThemeTitles,
  updateTheme,
} from '../actions';
import type { CurationTitle, MoodTheme } from '../types';

type SortKey = 'title' | 'updated' | 'created' | 'total-titles';
const PAGE_SIZE = 8;

type ServerActionResult = { success: boolean; error?: string };

async function runThemeAction(promise: Promise<ServerActionResult> | Promise<ServerActionResult[]>, loading: string, success: string, failure: string) {
  const toastId = toast.loading(loading);
  try {
    const result = await promise;
    const results = Array.isArray(result) ? result : [result];
    const failed = results.find((entry) => !entry.success);
    if (failed) toast.error(failed.error || failure, { id: toastId });
    else toast.success(success, { id: toastId });
  } catch (error) {
    toast.error(getErrorMessage(error, failure), { id: toastId });
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function sortThemes(items: MoodTheme[], sortBy: SortKey) {
  return [...items].sort((a, b) => {
    if (sortBy === 'title') return a.name.localeCompare(b.name);
    if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'total-titles') return b.total_titles - a.total_titles;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function SortableThemeRow({ theme, children }: { theme: MoodTheme; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: theme.id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      layout
      className={cn('grid grid-cols-[28px_1fr] items-center gap-2', isDragging && 'relative z-20 opacity-70')}
    >
      <button
        type="button"
        className="flex h-8 w-7 cursor-grab items-center justify-center rounded-md text-text-tertiary active:cursor-grabbing hover:bg-white/5 hover:text-text-primary"
        aria-label="Drag theme to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {children}
    </motion.div>
  );
}

function ThemeEditModal({ theme, onClose, onSave }: { theme: MoodTheme; onClose: () => void; onSave: (theme: MoodTheme) => void }) {
  const [draft, setDraft] = useState(theme);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
        className="w-full max-w-lg rounded-lg border border-white/10 bg-bg-surface p-4 shadow-lg shadow-black/30"
      >
        <h3 className="font-heading text-lg font-semibold text-text-primary">Theme Configuration</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
            Name
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 text-text-primary outline-none focus:border-accent-primary/60" />
          </label>
          <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
            Slug
            <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 text-text-primary outline-none focus:border-accent-primary/60" />
          </label>
          <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
            Cover Image
            <input value={draft.cover_image ?? ''} onChange={(event) => setDraft({ ...draft, cover_image: event.target.value || null })} className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 text-text-primary outline-none focus:border-accent-primary/60" />
          </label>
          <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
            Theme Color
            <input value={draft.theme_color ?? ''} onChange={(event) => setDraft({ ...draft, theme_color: event.target.value || null })} className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 text-text-primary outline-none focus:border-accent-primary/60" />
          </label>
        </div>
        <label className="mt-3 flex flex-col gap-1.5 font-body text-sm text-text-secondary">
          Description
          <textarea rows={3} value={draft.description ?? ''} onChange={(event) => setDraft({ ...draft, description: event.target.value || null })} className="rounded-md border border-white/10 bg-bg-deep/50 px-3 py-2 text-text-primary outline-none focus:border-accent-primary/60" />
        </label>
        <label className="mt-3 flex items-center justify-between rounded-md border border-white/10 px-3 py-2 font-body text-sm text-text-secondary">
          Visible
          <input type="checkbox" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-3 py-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">Cancel</button>
          <button type="submit" className="rounded-md bg-accent-primary px-3 py-2 font-heading text-sm text-white hover:bg-accent-primary/90">Save</button>
        </div>
      </motion.form>
    </div>
  );
}

function AssignTitlesModal({
  theme,
  titles,
  onClose,
  onAssign,
  onRemove,
}: {
  theme: MoodTheme;
  titles: CurationTitle[];
  onClose: () => void;
  onAssign: (titleIds: string[]) => void;
  onRemove: (titleId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const assigned = titles.filter((title) => theme.titleIds.includes(title.id));
  const available = titles
    .filter((title) => !theme.titleIds.includes(title.id))
    .filter((title) => !query || title.title_english.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 30);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid max-h-[86vh] w-full max-w-4xl gap-4 rounded-lg border border-white/10 bg-bg-surface p-4 shadow-lg shadow-black/30 md:grid-cols-[1fr_1fr]">
        <div className="min-h-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Assign Titles</h3>
            <button type="button" onClick={onClose} className="rounded-md px-2 py-1 font-body text-sm text-text-tertiary hover:bg-white/5 hover:text-text-primary">Close</button>
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles" className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60" />
          </div>
          <div className="max-h-[48vh] overflow-y-auto pr-1 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
            <div className="flex flex-col gap-1.5">
              {available.map((title) => (
                <label key={title.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-bg-deep/35 px-3 py-2 font-body text-sm text-text-primary hover:border-white/20">
                  <input
                    type="checkbox"
                    checked={selected.has(title.id)}
                    onChange={(event) => {
                      const next = new Set(selected);
                      if (event.target.checked) next.add(title.id);
                      else next.delete(title.id);
                      setSelected(next);
                    }}
                  />
                  {title.title_english}
                </label>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => { onAssign([...selected]); setSelected(new Set()); }} disabled={selected.size === 0} className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-xs text-white disabled:cursor-not-allowed disabled:opacity-40">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Assign Selected
          </button>
        </div>

        <div className="min-h-0 rounded-lg border border-white/10 bg-bg-deep/30 p-3">
          <p className="mb-3 font-heading text-sm text-text-primary">Assigned to {theme.name}</p>
          <div className="max-h-[58vh] overflow-y-auto pr-1 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
            <div className="flex flex-col gap-1.5">
              {assigned.map((title) => (
                <div key={title.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-bg-surface/40 px-3 py-2">
                  <span className="font-body text-sm text-text-primary">{title.title_english}</span>
                  <button type="button" onClick={() => onRemove(title.id)} className="text-semantic-danger hover:text-red-300" aria-label={`Remove ${title.title_english}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {assigned.length === 0 && <p className="py-8 text-center font-body text-sm text-text-tertiary">No titles assigned.</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function MoodThemesTab({ titles, themes, search, sortBy }: { titles: CurationTitle[]; themes: MoodTheme[]; search: string; sortBy: SortKey }) {
  const [localThemes, setLocalThemes] = useState(themes);
  const [selectedId, setSelectedId] = useState(themes[0]?.id ?? null);
  const [editing, setEditing] = useState<MoodTheme | null>(null);
  const [assigning, setAssigning] = useState<MoodTheme | null>(null);
  const [page, setPage] = useState(0);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filteredThemes = sortThemes(
    localThemes.filter((theme) => !search || theme.name.toLowerCase().includes(search.toLowerCase()) || theme.slug.toLowerCase().includes(search.toLowerCase())),
    sortBy,
  );
  const orderedThemes = [...filteredThemes].sort((a, b) => a.sort_order - b.sort_order);
  const selectedTheme = localThemes.find((theme) => theme.id === selectedId) ?? orderedThemes[0];
  const pageCount = Math.ceil(orderedThemes.length / PAGE_SIZE);
  const pageItems = orderedThemes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedThemes.findIndex((theme) => theme.id === active.id);
    const newIndex = orderedThemes.findIndex((theme) => theme.id === over.id);
    const reordered = arrayMove(orderedThemes, oldIndex, newIndex).map((theme, index) => ({ ...theme, sort_order: index }));
    setLocalThemes((current) => current.map((theme) => reordered.find((next) => next.id === theme.id) ?? theme));
    startTransition(() => {
      void runThemeAction(Promise.all(reordered.map((theme) => updateTheme(theme.id, { sort_order: theme.sort_order }))), 'Saving theme order...', 'Theme order saved.', 'Theme reorder failed.');
    });
  };

  const saveTheme = (theme: MoodTheme) => {
    setLocalThemes((current) => current.map((item) => item.id === theme.id ? theme : item));
    setEditing(null);
    startTransition(() => {
      void runThemeAction(updateTheme(theme.id, {
        name: theme.name,
        slug: theme.slug,
        description: theme.description,
        cover_image: theme.cover_image,
        theme_color: theme.theme_color,
        visible: theme.visible,
      }), 'Saving theme...', 'Theme updated.', 'Theme update failed.');
    });
  };

  const assignTitles = (theme: MoodTheme, titleIds: string[]) => {
    if (titleIds.length === 0) {
      toast.warning('Select at least one title first.');
      return;
    }
    setLocalThemes((current) => current.map((item) => item.id === theme.id ? { ...item, titleIds: [...new Set([...item.titleIds, ...titleIds])], total_titles: new Set([...item.titleIds, ...titleIds]).size } : item));
    startTransition(() => {
      void runThemeAction(assignTitlesToTheme(theme.id, titleIds), 'Assigning titles...', 'Titles assigned.', 'Title assignment failed.');
    });
  };

  const removeTitle = (theme: MoodTheme, titleId: string) => {
    setLocalThemes((current) => current.map((item) => item.id === theme.id ? { ...item, titleIds: item.titleIds.filter((id) => id !== titleId), total_titles: Math.max(0, item.total_titles - 1) } : item));
    startTransition(() => {
      void runThemeAction(removeTitleFromTheme(theme.id, titleId), 'Removing title...', 'Title removed from theme.', 'Title removal failed.');
    });
  };

  const deleteThemeItem = (theme: MoodTheme) => {
    setLocalThemes((current) => current.filter((item) => item.id !== theme.id));
    startTransition(() => {
      void runThemeAction(deleteTheme(theme.id), 'Deleting theme...', 'Theme deleted.', 'Theme delete failed.');
    });
  };

  void reorderThemeTitles;

  return (
    <div className={cn('grid gap-5 xl:grid-cols-[1fr_320px]', isPending && 'pointer-events-none opacity-80')}>
      <div className="flex flex-col gap-5">
        <section aria-labelledby="theme-overview-heading" className="rounded-lg border border-white/10 bg-bg-surface/30 p-4">
          <h2 id="theme-overview-heading" className="mb-3 font-heading text-base font-semibold text-text-primary">Theme Overview</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {localThemes.slice(0, 8).map((theme) => (
              <button key={theme.id} type="button" onClick={() => setSelectedId(theme.id)} className="rounded-lg border border-white/10 bg-bg-deep/35 p-3 text-left transition-colors hover:border-white/20">
                <div className="mb-2 h-1 w-8 rounded-sm" style={{ backgroundColor: theme.theme_color ?? 'var(--color-accent-primary)' }} />
                <p className="line-clamp-1 font-body text-sm font-semibold text-text-primary">{theme.name}</p>
                <p className="mt-1 font-data text-xs text-text-tertiary">{theme.total_titles} Titles</p>
              </button>
            ))}
          </div>
        </section>

        <SectionPanel title="Theme Management" description="Control discover-page mood themes, visibility, metadata, and title assignment." count={orderedThemes.length}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedThemes.map((theme) => theme.id)} strategy={verticalListSortingStrategy}>
              <div className="hidden md:block">
                <div className="grid grid-cols-[1.2fr_1fr_110px_100px_120px_48px] gap-3 border-b border-white/10 px-3 pb-2 font-heading text-xs text-text-tertiary">
                  <span>Theme</span><span>Slug</span><span>Total Titles</span><span>Visibility</span><span>Updated</span><span />
                </div>
                <div className="flex flex-col gap-1 pt-2">
                  {pageItems.map((theme) => (
                    <SortableThemeRow key={theme.id} theme={theme}>
                      <div className="grid min-h-14 grid-cols-[1.2fr_1fr_110px_100px_120px_48px] items-center gap-3 rounded-md border border-white/5 bg-bg-deep/35 px-3 py-2">
                        <button type="button" onClick={() => setSelectedId(theme.id)} className="text-left font-body text-sm font-medium text-text-primary hover:text-accent-primary">{theme.name}</button>
                        <span className="font-data text-xs text-text-tertiary">{theme.slug}</span>
                        <span className="font-data text-xs text-text-secondary">{theme.total_titles}</span>
                        <span className={cn('font-body text-xs', theme.visible ? 'text-emerald-400' : 'text-text-tertiary')}>{theme.visible ? 'Visible' : 'Hidden'}</span>
                        <span className="font-body text-xs text-text-tertiary">{formatDate(theme.updated_at)}</span>
                        <ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: () => setEditing(theme) }, { label: 'Preview', tone: 'preview', onSelect: () => setSelectedId(theme.id) }, { label: 'Assign Titles', tone: 'duplicate', onSelect: () => setAssigning(theme) }, { label: 'Delete', tone: 'delete', onSelect: () => deleteThemeItem(theme) }]} />
                      </div>
                    </SortableThemeRow>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 md:hidden">
                {pageItems.map((theme) => (
                  <SortableThemeRow key={theme.id} theme={theme}>
                    <div className="rounded-md border border-white/10 bg-bg-deep/35 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-body text-sm font-semibold text-text-primary">{theme.name}</p><p className="font-data text-xs text-text-tertiary">{theme.slug} · {theme.total_titles} titles</p></div><ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: () => setEditing(theme) }, { label: 'Assign Titles', tone: 'duplicate', onSelect: () => setAssigning(theme) }, { label: 'Delete', tone: 'delete', onSelect: () => deleteThemeItem(theme) }]} /></div></div>
                  </SortableThemeRow>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} />
        </SectionPanel>
      </div>

      {selectedTheme && (
        <aside className="h-fit rounded-lg border border-white/10 bg-bg-surface/30 p-4 xl:sticky xl:top-24" aria-label="Theme preview panel">
          <div className="mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-bg-deep/40">
            {selectedTheme.cover_image ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedTheme.cover_image})` }}
                aria-hidden="true"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-text-tertiary" aria-hidden="true" />
            )}
          </div>
          <div className="mb-2 h-1 w-10 rounded-sm" style={{ backgroundColor: selectedTheme.theme_color ?? 'var(--color-accent-primary)' }} />
          <h2 className="font-heading text-lg font-semibold text-text-primary">{selectedTheme.name}</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-text-secondary">{selectedTheme.description ?? 'No description set.'}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="font-heading text-xs text-text-tertiary">Titles</dt><dd className="font-data text-text-primary">{selectedTheme.total_titles}</dd></div>
            <div><dt className="font-heading text-xs text-text-tertiary">Visibility</dt><dd className="font-body text-text-primary">{selectedTheme.visible ? 'Visible' : 'Hidden'}</dd></div>
          </dl>
          <button type="button" onClick={() => setAssigning(selectedTheme)} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/10 font-heading text-xs text-text-secondary transition-colors hover:text-text-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Assign Titles
          </button>
        </aside>
      )}

      {editing && <ThemeEditModal theme={editing} onClose={() => setEditing(null)} onSave={saveTheme} />}
      {assigning && <AssignTitlesModal theme={assigning} titles={titles} onClose={() => setAssigning(null)} onAssign={(ids) => assignTitles(assigning, ids)} onRemove={(id) => removeTitle(assigning, id)} />}
    </div>
  );
}
