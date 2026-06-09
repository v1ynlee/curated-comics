'use client';

// ============================================================
// Featured Tab — homepage editorial management
// ============================================================

import { useEffect, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import { BookOpen, Brush, FileText, GripVertical, Plus, UserRound } from 'lucide-react';
import { CoverImage } from '@/components/ui/CoverImage';
import { cn } from '@/lib/utils/cn';
import { getErrorMessage, toast } from '@/lib/utils/toast';
import {
  addFeaturedCreator,
  createFeaturedNarrative,
  deleteFeaturedNarrative,
  duplicateFeaturedNarrative,
  removeFeaturedCreator,
  saveFeaturedCreators,
  saveFeaturedNarrativeOrder,
  saveFeaturedTitles,
  updateCurationSetting,
  updateFeaturedNarrative,
} from '../actions';
import { ActionMenu } from './ActionMenu';
import { PaginationControls } from './PaginationControls';
import { SectionPanel } from './SectionPanel';
import type {
  CurationCreator,
  CurationTitle,
  FeaturedCurationData,
  FeaturedNarrative,
} from '../types';

type ServerActionResult<T = unknown> = { success: boolean; error?: string; data?: T };

async function runFeaturedAction<T>(promise: Promise<ServerActionResult<T>>, loading: string, success: string, failure: string) {
  const toastId = toast.loading(loading);
  try {
    const result = await promise;
    if (result.success) toast.success(success, { id: toastId });
    else toast.error(result.error || failure, { id: toastId });
    return result;
  } catch (error) {
    toast.error(getErrorMessage(error, failure), { id: toastId });
    return null;
  }
}

type SortKey = 'title' | 'updated' | 'created' | 'total-titles';
type EditableItem =
  | { kind: 'narrative'; item: FeaturedNarrative }
  | { kind: 'title'; item: CurationTitle }
  | { kind: 'creator'; item: CurationCreator }
  | null;

const PAGE_SIZE = 6;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function sortByKey<T extends { title?: string; name?: string; updated_at: string; created_at: string; total_titles?: number; title_count?: number }>(items: T[], sortBy: SortKey) {
  return [...items].sort((a, b) => {
    if (sortBy === 'title') return (a.title ?? a.name ?? '').localeCompare(b.title ?? b.name ?? '');
    if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'total-titles') return (b.total_titles ?? b.title_count ?? 0) - (a.total_titles ?? a.title_count ?? 0);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function paginate<T>(items: T[], page: number) {
  return items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
}

function matches(value: string | null | undefined, query: string) {
  return !query || value?.toLowerCase().includes(query.toLowerCase());
}

function StatusText({ enabled }: { enabled: boolean }) {
  return (
    <span className={cn('font-body text-xs', enabled ? 'text-emerald-400' : 'text-text-tertiary')}>
      {enabled ? 'Visible' : 'Hidden'}
    </span>
  );
}

function SortableShell({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group', isDragging && 'relative z-20 opacity-70')}
      layout
    >
      <div className="grid grid-cols-[28px_1fr] items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-7 cursor-grab items-center justify-center rounded-md text-text-tertiary active:cursor-grabbing group-hover:bg-white/5 group-hover:text-text-primary"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </motion.div>
  );
}

function NewFeaturedDropdown({
  onNewNarrative,
  onNewTitle,
  onNewCreator,
}: {
  onNewNarrative: () => void;
  onNewTitle: () => void;
  onNewCreator: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = [
    { label: 'New Narrative', icon: FileText, color: 'text-amber-400', action: onNewNarrative },
    { label: 'New Featured Title', icon: BookOpen, color: 'text-emerald-400', action: onNewTitle },
    { label: 'New Featured Creator', icon: UserRound, color: 'text-accent-tertiary', action: onNewCreator },
  ];

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-xs text-white transition-colors hover:bg-accent-primary/90 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        New Featured
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute right-0 top-full z-30 mt-1 min-w-56 rounded-lg border border-white/10 bg-bg-surface p-1 shadow-lg shadow-black/20"
          >
            {items.map(({ label, icon: Icon, color, action }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  action();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-body text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                <Icon className={cn('h-4 w-4', color)} aria-hidden="true" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddItemModal({
  title,
  searchLabel,
  items,
  renderItem,
  onClose,
}: {
  title: string;
  searchLabel: string;
  items: { id: string; searchText: string; node: React.ReactNode; onSelect: () => void }[];
  renderItem?: never;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const visibleItems = items.filter((item) => matches(item.searchText, query)).slice(0, 24);
  void renderItem;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="w-full max-w-xl rounded-lg border border-white/10 bg-bg-surface p-4 shadow-lg shadow-black/30"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 font-body text-sm text-text-tertiary hover:bg-white/5 hover:text-text-primary">
            Close
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchLabel}
          className="mb-3 h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 px-3 font-body text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60"
        />
        <div className="max-h-[55vh] overflow-y-auto pr-1 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
          <div className="flex flex-col gap-1.5">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                className="rounded-md border border-white/10 bg-bg-deep/35 px-3 py-2 text-left transition-colors hover:border-white/20 hover:bg-white/5"
              >
                {item.node}
              </button>
            ))}
            {visibleItems.length === 0 && <p className="py-8 text-center font-body text-sm text-text-tertiary">No matches.</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EditModal({ item, onClose, onSave }: { item: EditableItem; onClose: () => void; onSave: (item: EditableItem, weight: number, visible?: boolean) => void }) {
  const [weight, setWeight] = useState(() => {
    if (!item) return 50;
    return item.item.featured_weight;
  });
  const [visible, setVisible] = useState(() => {
    if (!item) return true;
    if (item.kind === 'title') return item.item.featured;
    return item.item.visible;
  });

  if (!item) return null;

  const label = item.kind === 'narrative' ? item.item.title : item.kind === 'title' ? item.item.title_english : item.item.name;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-lg border border-white/10 bg-bg-surface p-4 shadow-lg shadow-black/30">
        <h3 className="font-heading text-lg font-semibold text-text-primary">Edit Featured</h3>
        <p className="mt-1 font-body text-sm text-text-secondary">{label}</p>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
            Featured Weight
            <input
              type="number"
              min={1}
              max={100}
              value={weight}
              onChange={(event) => setWeight(Number(event.target.value))}
              className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 text-text-primary outline-none focus:border-accent-primary/60"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-md border border-white/10 px-3 py-2 font-body text-sm text-text-secondary">
            Visible
            <input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-3 py-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">Cancel</button>
          <button type="button" onClick={() => onSave(item, weight, visible)} className="rounded-md bg-accent-primary px-3 py-2 font-heading text-sm text-white hover:bg-accent-primary/90">Save</button>
        </div>
      </motion.div>
    </div>
  );
}

export function FeaturedTab({ data, search, sortBy }: { data: FeaturedCurationData; search: string; sortBy: SortKey }) {
  const [settings, setSettings] = useState(data.settings);
  const [narratives, setNarratives] = useState(data.narratives);
  const [titles, setTitles] = useState(data.titles);
  const [creators, setCreators] = useState(data.creators);
  const [modal, setModal] = useState<'title' | 'creator' | null>(null);
  const [editing, setEditing] = useState<EditableItem>(null);
  const [isPending, startTransition] = useTransition();
  const [narrativePage, setNarrativePage] = useState(0);
  const [titlePage, setTitlePage] = useState(0);
  const [creatorPage, setCreatorPage] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filteredNarratives = sortByKey(
    narratives.filter((item) => matches(item.title, search) || matches(item.description, search)),
    sortBy,
  );
  const featuredTitles = sortByKey(
    titles.filter((item) => item.featured && matches(item.title_english, search)),
    sortBy,
  );
  const featuredCreators = sortByKey(
    creators.filter((item) => item.featured && matches(item.name, search)),
    sortBy,
  );
  const orderedNarratives = [...filteredNarratives].sort((a, b) => a.display_order - b.display_order);
  const orderedTitles = [...featuredTitles].sort((a, b) => a.featured_order - b.featured_order);
  const orderedCreators = [...featuredCreators].sort((a, b) => a.display_order - b.display_order);

  const handleRandomChange = (key: 'featuredNarrativesRandom' | 'featuredTitlesRandom' | 'featuredCreatorsRandom', enabled: boolean) => {
    setSettings((current) => ({ ...current, [key]: enabled }));
    const settingKey = key === 'featuredNarrativesRandom'
      ? 'featured_narratives_random'
      : key === 'featuredTitlesRandom'
        ? 'featured_titles_random'
        : 'featured_creators_random';
    startTransition(() => {
      void runFeaturedAction(
        updateCurationSetting(settingKey, enabled),
        'Updating randomization...',
        enabled ? 'Randomization enabled.' : 'Randomization disabled.',
        'Randomization update failed.',
      );
    });
  };

  const handleNarrativeDrag = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedNarratives.findIndex((item) => item.id === active.id);
    const newIndex = orderedNarratives.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(orderedNarratives, oldIndex, newIndex).map((item, index) => ({ ...item, display_order: index }));
    setNarratives((current) => current.map((item) => reordered.find((next) => next.id === item.id) ?? item));
    startTransition(() => {
      void runFeaturedAction(
        saveFeaturedNarrativeOrder(reordered.map(({ id, display_order }) => ({ id, display_order }))),
        'Saving narrative order...',
        'Narrative order saved.',
        'Narrative reorder failed.',
      );
    });
  };

  const handleTitleDrag = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedTitles.findIndex((item) => item.id === active.id);
    const newIndex = orderedTitles.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(orderedTitles, oldIndex, newIndex).map((item, index) => ({ ...item, featured_order: index }));
    setTitles((current) => current.map((item) => reordered.find((next) => next.id === item.id) ?? item));
    startTransition(() => {
      void runFeaturedAction(
        saveFeaturedTitles(reordered.map((item) => ({ id: item.id, featured: item.featured, featured_order: item.featured_order, featured_weight: item.featured_weight }))),
        'Saving title order...',
        'Title order saved.',
        'Title reorder failed.',
      );
    });
  };

  const handleCreatorDrag = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedCreators.findIndex((item) => item.id === active.id);
    const newIndex = orderedCreators.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(orderedCreators, oldIndex, newIndex).map((item, index) => ({ ...item, display_order: index }));
    setCreators((current) => current.map((item) => reordered.find((next) => next.id === item.id) ?? item));
    startTransition(() => {
      void runFeaturedAction(
        saveFeaturedCreators(reordered.map((item) => ({ creator_id: item.id, display_order: item.display_order, featured_weight: item.featured_weight, visible: item.visible }))),
        'Saving creator order...',
        'Creator order saved.',
        'Creator reorder failed.',
      );
    });
  };

  const saveEdit = (item: EditableItem, weight: number, visible?: boolean) => {
    if (!item) return;
    if (item.kind === 'narrative') {
      setNarratives((current) => current.map((entry) => entry.id === item.item.id ? { ...entry, featured_weight: weight, visible: Boolean(visible) } : entry));
      startTransition(() => {
        void runFeaturedAction(updateFeaturedNarrative(item.item.id, { featured_weight: weight, visible: Boolean(visible) }), 'Saving narrative...', 'Narrative updated.', 'Narrative update failed.');
      });
    }
    if (item.kind === 'title') {
      setTitles((current) => current.map((entry) => entry.id === item.item.id ? { ...entry, featured_weight: weight, featured: Boolean(visible) } : entry));
      startTransition(() => {
        void runFeaturedAction(saveFeaturedTitles([{ id: item.item.id, featured: Boolean(visible), featured_order: item.item.featured_order, featured_weight: weight }]), 'Saving title...', 'Featured title updated.', 'Featured title update failed.');
      });
    }
    if (item.kind === 'creator') {
      setCreators((current) => current.map((entry) => entry.id === item.item.id ? { ...entry, featured_weight: weight, visible: Boolean(visible), featured: Boolean(visible) } : entry));
      startTransition(() => {
        void runFeaturedAction(saveFeaturedCreators([{ creator_id: item.item.id, display_order: item.item.display_order, featured_weight: weight, visible: Boolean(visible) }]), 'Saving creator...', 'Featured creator updated.', 'Featured creator update failed.');
      });
    }
    setEditing(null);
  };

  const createNarrative = () => {
    startTransition(async () => {
      const result = await runFeaturedAction(createFeaturedNarrative(), 'Creating narrative...', 'Narrative created.', 'Narrative creation failed.');
      if (result?.success && result.data) setNarratives((current) => [...current, result.data as FeaturedNarrative]);
    });
  };

  const removeTitle = (title: CurationTitle) => {
    const next = { ...title, featured: false, featured_order: 0 };
    setTitles((current) => current.map((item) => item.id === title.id ? next : item));
    startTransition(() => {
      void runFeaturedAction(saveFeaturedTitles([{ id: title.id, featured: false, featured_order: 0, featured_weight: title.featured_weight }]), 'Removing featured title...', 'Featured title removed.', 'Featured title removal failed.');
    });
  };

  const addTitle = (title: CurationTitle) => {
    const order = Math.max(0, ...titles.filter((item) => item.featured).map((item) => item.featured_order)) + 1;
    const next = { ...title, featured: true, featured_order: order };
    setTitles((current) => current.map((item) => item.id === title.id ? next : item));
    startTransition(() => {
      void runFeaturedAction(saveFeaturedTitles([{ id: title.id, featured: true, featured_order: order, featured_weight: title.featured_weight }]), 'Adding featured title...', 'Featured title added.', 'Featured title add failed.');
    });
  };

  const addCreator = (creator: CurationCreator) => {
    const order = Math.max(0, ...creators.filter((item) => item.featured).map((item) => item.display_order)) + 1;
    setCreators((current) => current.map((item) => item.id === creator.id ? { ...item, featured: true, visible: true, display_order: order } : item));
    startTransition(() => {
      void runFeaturedAction(addFeaturedCreator(creator.id), 'Adding featured creator...', 'Featured creator added.', 'Featured creator add failed.');
    });
  };

  const duplicateNarrative = (id: string) => {
    startTransition(async () => {
      const result = await runFeaturedAction(duplicateFeaturedNarrative(id), 'Duplicating narrative...', 'Narrative duplicated.', 'Narrative duplicate failed.');
      if (result?.success && result.data) setNarratives((current) => [...current, result.data as FeaturedNarrative]);
    });
  };

  const toggleNarrativeVisibility = (item: FeaturedNarrative) => {
    setNarratives((current) => current.map((entry) => entry.id === item.id ? { ...entry, visible: !item.visible } : entry));
    startTransition(() => {
      void runFeaturedAction(
        updateFeaturedNarrative(item.id, { visible: !item.visible }),
        item.visible ? 'Archiving narrative...' : 'Restoring narrative...',
        item.visible ? 'Narrative archived.' : 'Narrative restored.',
        'Narrative visibility update failed.',
      );
    });
  };

  const deleteNarrative = (id: string) => {
    setNarratives((current) => current.filter((entry) => entry.id !== id));
    startTransition(() => {
      void runFeaturedAction(deleteFeaturedNarrative(id), 'Deleting narrative...', 'Narrative deleted.', 'Narrative delete failed.');
    });
  };

  const removeCreator = (id: string) => {
    setCreators((current) => current.map((entry) => entry.id === id ? { ...entry, featured: false, visible: false } : entry));
    startTransition(() => {
      void runFeaturedAction(removeFeaturedCreator(id), 'Removing featured creator...', 'Featured creator removed.', 'Featured creator removal failed.');
    });
  };

  return (
    <div className={cn('flex flex-col gap-5', isPending && 'pointer-events-none opacity-80')}>
      <div className="flex justify-end">
        <NewFeaturedDropdown onNewNarrative={createNarrative} onNewTitle={() => setModal('title')} onNewCreator={() => setModal('creator')} />
      </div>

      <SectionPanel
        title="Featured Narrative"
        description="Homepage narrative flow scenes. Drag rows to persist manual order, or use weighted random selection."
        count={orderedNarratives.length}
        randomEnabled={settings.featuredNarrativesRandom}
        onRandomChange={(enabled) => handleRandomChange('featuredNarrativesRandom', enabled)}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNarrativeDrag}>
          <SortableContext items={orderedNarratives.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="hidden md:block">
              <div className="grid grid-cols-[56px_1.1fr_1.8fr_90px_120px_48px] gap-3 border-b border-white/10 px-3 pb-2 font-heading text-xs text-text-tertiary">
                <span>Order</span><span>Title</span><span>Description</span><span>Status</span><span>Updated</span><span />
              </div>
              <div className="flex flex-col gap-1 pt-2">
                {paginate(orderedNarratives, narrativePage).map((item) => (
                  <SortableShell key={item.id} id={item.id}>
                    <div className="grid min-h-14 grid-cols-[56px_1.1fr_1.8fr_90px_120px_48px] items-center gap-3 rounded-md border border-white/5 bg-bg-deep/35 px-3 py-2">
                      <span className="font-data text-xs text-text-tertiary">{item.display_order + 1}</span>
                      <span className="font-body text-sm font-medium text-text-primary">{item.title}</span>
                      <span className="line-clamp-1 font-body text-sm text-text-secondary">{item.description ?? item.subtitle}</span>
                      <StatusText enabled={item.visible} />
                      <span className="font-body text-xs text-text-tertiary">{formatDate(item.updated_at)}</span>
                      <ActionMenu items={[
                        { label: 'Edit', tone: 'edit', onSelect: () => setEditing({ kind: 'narrative', item }) },
                        { label: 'Preview', tone: 'preview', onSelect: () => window.open('/', '_blank') },
                        { label: 'Duplicate', tone: 'duplicate', onSelect: () => duplicateNarrative(item.id) },
                        { label: item.visible ? 'Archive' : 'Restore', tone: 'archive', onSelect: () => toggleNarrativeVisibility(item) },
                        { label: 'Delete', tone: 'delete', onSelect: () => deleteNarrative(item.id) },
                      ]} />
                    </div>
                  </SortableShell>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:hidden">
              {paginate(orderedNarratives, narrativePage).map((item) => (
                <SortableShell key={item.id} id={item.id}>
                  <div className="rounded-md border border-white/10 bg-bg-deep/35 p-3">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-body text-sm font-semibold text-text-primary">{item.title}</p><p className="mt-1 line-clamp-2 font-body text-xs text-text-secondary">{item.description ?? item.subtitle}</p></div><ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: () => setEditing({ kind: 'narrative', item }) }, { label: 'Duplicate', tone: 'duplicate', onSelect: () => duplicateNarrative(item.id) }, { label: item.visible ? 'Archive' : 'Restore', tone: 'archive', onSelect: () => toggleNarrativeVisibility(item) }, { label: 'Delete', tone: 'delete', onSelect: () => deleteNarrative(item.id) }]} /></div>
                    <div className="mt-3 flex items-center justify-between font-body text-xs text-text-tertiary"><span>Order {item.display_order + 1}</span><StatusText enabled={item.visible} /></div>
                  </div>
                </SortableShell>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <PaginationControls page={narrativePage} pageCount={Math.ceil(orderedNarratives.length / PAGE_SIZE)} onPageChange={setNarrativePage} />
      </SectionPanel>

      <SectionPanel
        title="Featured Titles"
        description="Homepage title showcase with manual order or weighted random exposure."
        count={orderedTitles.length}
        randomEnabled={settings.featuredTitlesRandom}
        onRandomChange={(enabled) => handleRandomChange('featuredTitlesRandom', enabled)}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTitleDrag}>
          <SortableContext items={orderedTitles.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="hidden md:block">
              <div className="grid grid-cols-[72px_1.5fr_80px_80px_130px_120px_48px] gap-3 border-b border-white/10 px-3 pb-2 font-heading text-xs text-text-tertiary">
                <span>Cover</span><span>Title</span><span>Tier</span><span>Rating</span><span>Featured Weight</span><span>Updated</span><span />
              </div>
              <div className="flex flex-col gap-1 pt-2">
                {paginate(orderedTitles, titlePage).map((item) => (
                  <SortableShell key={item.id} id={item.id}>
                    <div className="grid min-h-16 grid-cols-[72px_1.5fr_80px_80px_130px_120px_48px] items-center gap-3 rounded-md border border-white/5 bg-bg-deep/35 px-3 py-2">
                      <div className="w-10 overflow-hidden rounded-md"><CoverImage slug={item.cover_slug ?? item.slug} alt="" origin={item.origin} tier={item.tier as never} rounded /></div>
                      <span className="font-body text-sm font-medium text-text-primary">{item.title_english}</span>
                      <span className="font-data text-xs text-text-tertiary">{item.tier ?? '-'}</span>
                      <span className="font-data text-xs text-text-secondary">{item.rating ?? '-'}</span>
                      <input type="number" min={1} max={100} value={item.featured_weight} onChange={(event) => saveEdit({ kind: 'title', item }, Number(event.target.value), true)} className="h-8 w-20 rounded-md border border-white/10 bg-bg-surface px-2 font-data text-xs text-text-primary outline-none focus:border-accent-primary/60" />
                      <span className="font-body text-xs text-text-tertiary">{formatDate(item.updated_at)}</span>
                      <ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: () => setEditing({ kind: 'title', item }) }, { label: 'Preview', tone: 'preview', onSelect: () => window.open(`/title/${item.slug}`, '_blank') }, { label: 'Remove', tone: 'delete', onSelect: () => removeTitle(item) }]} />
                    </div>
                  </SortableShell>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:hidden">
              {paginate(orderedTitles, titlePage).map((item) => (
                <SortableShell key={item.id} id={item.id}>
                  <div className="rounded-md border border-white/10 bg-bg-deep/35 p-3"><div className="flex gap-3"><div className="w-12 overflow-hidden rounded-md"><CoverImage slug={item.cover_slug ?? item.slug} alt="" origin={item.origin} tier={item.tier as never} rounded /></div><div className="min-w-0 flex-1"><p className="font-body text-sm font-semibold text-text-primary">{item.title_english}</p><p className="font-data text-xs text-text-tertiary">Tier {item.tier ?? '-'} · Weight {item.featured_weight}</p></div><ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: () => setEditing({ kind: 'title', item }) }, { label: 'Remove', tone: 'delete', onSelect: () => removeTitle(item) }]} /></div></div>
                </SortableShell>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <PaginationControls page={titlePage} pageCount={Math.ceil(orderedTitles.length / PAGE_SIZE)} onPageChange={setTitlePage} />
      </SectionPanel>

      <SectionPanel
        title="Featured Creators"
        description="Homepage creator showcase across authors, artists, and studios."
        count={orderedCreators.length}
        randomEnabled={settings.featuredCreatorsRandom}
        onRandomChange={(enabled) => handleRandomChange('featuredCreatorsRandom', enabled)}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCreatorDrag}>
          <SortableContext items={orderedCreators.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="hidden md:block">
              <div className="grid grid-cols-[1.7fr_100px_110px_140px_120px_48px] gap-3 border-b border-white/10 px-3 pb-2 font-heading text-xs text-text-tertiary">
                <span>Creator</span><span>Type</span><span>Total Titles</span><span>Featured Weight</span><span>Updated</span><span />
              </div>
              <div className="flex flex-col gap-1 pt-2">
                {paginate(orderedCreators, creatorPage).map((item) => (
                  <SortableShell key={item.id} id={item.id}>
                    <div className="grid min-h-14 grid-cols-[1.7fr_100px_110px_140px_120px_48px] items-center gap-3 rounded-md border border-white/5 bg-bg-deep/35 px-3 py-2">
                      <span className="font-body text-sm font-medium text-text-primary">{item.name}</span>
                      <span className="font-body text-xs capitalize text-text-secondary">{item.type}</span>
                      <span className="font-data text-xs text-text-secondary">{item.title_count}</span>
                      <input type="number" min={1} max={100} value={item.featured_weight} onChange={(event) => saveEdit({ kind: 'creator', item }, Number(event.target.value), true)} className="h-8 w-20 rounded-md border border-white/10 bg-bg-surface px-2 font-data text-xs text-text-primary outline-none focus:border-accent-primary/60" />
                      <span className="font-body text-xs text-text-tertiary">{formatDate(item.updated_at)}</span>
                       <ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: () => setEditing({ kind: 'creator', item }) }, { label: 'Preview', tone: 'preview', onSelect: () => window.open(`/creators/${item.slug}`, '_blank') }, { label: 'Remove', tone: 'delete', onSelect: () => removeCreator(item.id) }]} />
                    </div>
                  </SortableShell>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:hidden">
              {paginate(orderedCreators, creatorPage).map((item) => (
                <SortableShell key={item.id} id={item.id}>
                  <div className="rounded-md border border-white/10 bg-bg-deep/35 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-body text-sm font-semibold text-text-primary">{item.name}</p><p className="font-data text-xs capitalize text-text-tertiary">{item.type} · {item.title_count} titles · Weight {item.featured_weight}</p></div><ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: () => setEditing({ kind: 'creator', item }) }, { label: 'Remove', tone: 'delete', onSelect: () => removeCreator(item.id) }]} /></div></div>
                </SortableShell>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <PaginationControls page={creatorPage} pageCount={Math.ceil(orderedCreators.length / PAGE_SIZE)} onPageChange={setCreatorPage} />
      </SectionPanel>

      <AnimatePresence>
        {modal === 'title' && (
          <AddItemModal
            title="Add Featured Title"
            searchLabel="Search titles"
            items={titles.filter((item) => !item.featured).map((item) => ({ id: item.id, searchText: item.title_english, onSelect: () => addTitle(item), node: <span className="font-body text-sm text-text-primary">{item.title_english}</span> }))}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'creator' && (
          <AddItemModal
            title="Add Featured Creator"
            searchLabel="Search creators"
            items={creators.filter((item) => !item.featured).map((item) => ({ id: item.id, searchText: item.name, onSelect: () => addCreator(item), node: <span className="inline-flex items-center gap-2 font-body text-sm text-text-primary"><Brush className="h-4 w-4 text-text-tertiary" aria-hidden="true" />{item.name}</span> }))}
            onClose={() => setModal(null)}
          />
        )}
        {editing && <EditModal item={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
      </AnimatePresence>
    </div>
  );
}
