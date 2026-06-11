'use client';

// ============================================================
// Tiers Tab — hierarchical tier curation
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
import { GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import { CoverImage } from '@/components/ui/CoverImage';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { cn } from '@/lib/utils/cn';
import { getErrorMessage, toast } from '@/lib/utils/toast';
import {
  assignTitleToTier,
  removeTitleFromTier,
  updateTierDefinitions,
} from '../actions';
import { ActionMenu } from './ActionMenu';
import type { CurationTitle, TierDefinition } from '../types';

type SortKey = 'title' | 'updated' | 'created' | 'total-titles';

type ServerActionResult = { success: boolean; error?: string };

async function runTierAction(promise: Promise<ServerActionResult>, loading: string, success: string, failure: string) {
  const toastId = toast.loading(loading);
  try {
    const result = await promise;
    if (result.success) toast.success(success, { id: toastId });
    else toast.error(result.error || failure, { id: toastId });
  } catch (error) {
    toast.error(getErrorMessage(error, failure), { id: toastId });
  }
}

function sortTiers(tiers: TierDefinition[], sortBy: SortKey) {
  return [...tiers].sort((a, b) => {
    if (sortBy === 'title') return a.name.localeCompare(b.name);
    if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'total-titles') return b.titleIds.length - a.titleIds.length;
    return a.display_order - b.display_order;
  });
}

function SortableTierCard({
  tier,
  selected,
  onSelect,
  onEdit,
  onToggleVisibility,
}: {
  tier: TierDefinition;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onToggleVisibility: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tier.id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      layout
      className={cn('rounded-lg border bg-bg-surface/30 transition-colors', selected ? 'border-accent-primary/50' : 'border-white/10', isDragging && 'relative z-20 opacity-70')}
    >
      <div className="flex items-center gap-3 p-3">
        <button type="button" className="cursor-grab rounded-md p-1.5 text-text-tertiary active:cursor-grabbing hover:bg-white/5 hover:text-text-primary" aria-label="Drag tier" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-12 items-center justify-center rounded-md border border-white/10 font-heading text-lg font-bold" style={{ color: tier.color, backgroundColor: `${tier.color}18` }}>
              {tier.name}
            </span>
            <div className="min-w-0">
              <p className="font-body text-sm font-semibold text-text-primary">{tier.name}</p>
              <p className="line-clamp-1 font-body text-xs text-text-tertiary">{tier.description ?? 'No description'}</p>
            </div>
          </div>
        </button>
        <span className="font-data text-xs text-text-tertiary">{tier.titleIds.length}</span>
        <ActionMenu items={[{ label: 'Edit', tone: 'edit', onSelect: onEdit }, { label: tier.visible ? 'Archive' : 'Restore', tone: 'archive', onSelect: onToggleVisibility }]} />
      </div>
    </motion.div>
  );
}

function TierEditPanel({ tier, onSave }: { tier: TierDefinition; onSave: (tier: TierDefinition) => void }) {
  const [draft, setDraft] = useState(tier);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
      className="rounded-lg border border-white/10 bg-bg-deep/30 p-3"
    >
      <h3 className="font-heading text-sm font-semibold text-text-primary">Metadata</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
          Tier Name
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-10 rounded-md border border-white/10 bg-bg-surface px-3 text-text-primary outline-none focus:border-accent-primary/60" />
        </label>
        <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
          Slug
          <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className="h-10 rounded-md border border-white/10 bg-bg-surface px-3 text-text-primary outline-none focus:border-accent-primary/60" />
        </label>
        <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
          Color
          <input value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} className="h-10 rounded-md border border-white/10 bg-bg-surface px-3 text-text-primary outline-none focus:border-accent-primary/60" />
        </label>
        <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
          Icon
          <input value={draft.icon ?? ''} onChange={(event) => setDraft({ ...draft, icon: event.target.value || null })} className="h-10 rounded-md border border-white/10 bg-bg-surface px-3 text-text-primary outline-none focus:border-accent-primary/60" />
        </label>
      </div>
      <label className="mt-3 flex flex-col gap-1.5 font-body text-sm text-text-secondary">
        Description
        <textarea rows={3} value={draft.description ?? ''} onChange={(event) => setDraft({ ...draft, description: event.target.value || null })} className="rounded-md border border-white/10 bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent-primary/60" />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
          Display Order
          <input type="number" value={draft.display_order} onChange={(event) => setDraft({ ...draft, display_order: Number(event.target.value) })} className="h-10 rounded-md border border-white/10 bg-bg-surface px-3 text-text-primary outline-none focus:border-accent-primary/60" />
        </label>
        <label className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 font-body text-sm text-text-secondary">
          Visibility
          <input type="checkbox" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} />
        </label>
      </div>
      <button type="submit" className="mt-4 rounded-md bg-accent-primary px-3 py-2 font-heading text-sm text-white hover:bg-accent-primary/90">Save Tier</button>
    </form>
  );
}

function AssignTierTitleModal({ tier, titles, onClose, onAssign }: { tier: TierDefinition; titles: CurationTitle[]; onClose: () => void; onAssign: (title: CurationTitle) => void }) {
  const [query, setQuery] = useState('');
  const options = titles
    .filter((title) => !tier.titleIds.includes(title.id))
    .filter((title) => !query || title.title_english.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 30);

  return (
    <ModalPortal>
    <div className="fixed left-0 top-0 z-modal flex h-[100dvh] w-[100dvw] items-center justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl rounded-lg border border-white/10 bg-bg-surface p-4 shadow-lg shadow-black/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold text-text-primary">Assign Title to {tier.name}</h3>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 font-body text-sm text-text-tertiary hover:bg-white/5 hover:text-text-primary">Close</button>
        </div>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles" className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60" />
        </div>
        <div className="max-h-[55vh] overflow-y-auto pr-1 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
          <div className="flex flex-col gap-1.5">
            {options.map((title) => (
              <button key={title.id} type="button" onClick={() => { onAssign(title); onClose(); }} className="rounded-md border border-white/10 bg-bg-deep/35 px-3 py-2 text-left font-body text-sm text-text-primary hover:border-white/20 hover:bg-white/5">
                {title.title_english}
              </button>
            ))}
            {options.length === 0 && <p className="py-8 text-center font-body text-sm text-text-tertiary">No titles available.</p>}
          </div>
        </div>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

export function TiersTab({ titles, tiers, search, sortBy }: { titles: CurationTitle[]; tiers: TierDefinition[]; search: string; sortBy: SortKey }) {
  const [localTiers, setLocalTiers] = useState(tiers);
  const [selectedId, setSelectedId] = useState(tiers[0]?.id ?? null);
  const [assigning, setAssigning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const orderedTiers = sortTiers(
    localTiers.filter((tier) => !search || tier.name.toLowerCase().includes(search.toLowerCase()) || tier.description?.toLowerCase().includes(search.toLowerCase())),
    sortBy,
  );
  const selectedTier = localTiers.find((tier) => tier.id === selectedId) ?? orderedTiers[0];
  const selectedTitles = selectedTier ? titles.filter((title) => selectedTier.titleIds.includes(title.id)) : [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedTiers.findIndex((tier) => tier.id === active.id);
    const newIndex = orderedTiers.findIndex((tier) => tier.id === over.id);
    const reordered = arrayMove(orderedTiers, oldIndex, newIndex).map((tier, index) => ({ ...tier, display_order: index }));
    setLocalTiers((current) => current.map((tier) => reordered.find((next) => next.id === tier.id) ?? tier));
    startTransition(() => {
      void runTierAction(updateTierDefinitions(reordered.map((tier) => ({ id: tier.id, display_order: tier.display_order }))), 'Saving tier order...', 'Tier order saved.', 'Tier reorder failed.');
    });
  };

  const saveTier = (tier: TierDefinition) => {
    setLocalTiers((current) => current.map((item) => item.id === tier.id ? tier : item));
    startTransition(() => {
      void runTierAction(updateTierDefinitions([{ id: tier.id, name: tier.name, slug: tier.slug, description: tier.description, color: tier.color, icon: tier.icon, display_order: tier.display_order, visible: tier.visible }]), 'Saving tier...', 'Tier updated.', 'Tier update failed.');
    });
  };

  const toggleTierVisibility = (tier: TierDefinition) => {
    const visible = !tier.visible;
    setLocalTiers((current) => current.map((item) => item.id === tier.id ? { ...item, visible } : item));
    startTransition(() => {
      void runTierAction(updateTierDefinitions([{ id: tier.id, visible }]), visible ? 'Restoring tier...' : 'Archiving tier...', visible ? 'Tier restored.' : 'Tier archived.', 'Tier visibility update failed.');
    });
  };

  const assignTitle = (title: CurationTitle) => {
    if (!selectedTier) {
      toast.warning('Select a tier first.');
      return;
    }
    setLocalTiers((current) => current.map((tier) => {
      if (tier.id === selectedTier.id) return { ...tier, titleIds: [...new Set([...tier.titleIds, title.id])] };
      return { ...tier, titleIds: tier.titleIds.filter((id) => id !== title.id) };
    }));
    startTransition(() => {
      void runTierAction(assignTitleToTier(selectedTier.id, title.id), 'Assigning title...', 'Title assigned to tier.', 'Title assignment failed.');
    });
  };

  const removeTitle = (titleId: string) => {
    if (!selectedTier) {
      toast.warning('Select a tier first.');
      return;
    }
    setLocalTiers((current) => current.map((tier) => tier.id === selectedTier.id ? { ...tier, titleIds: tier.titleIds.filter((id) => id !== titleId) } : tier));
    startTransition(() => {
      void runTierAction(removeTitleFromTier(selectedTier.id, titleId), 'Removing title...', 'Title removed from tier.', 'Title removal failed.');
    });
  };

  return (
    <div className={cn('grid gap-5 xl:grid-cols-[420px_1fr]', isPending && 'pointer-events-none opacity-80')}>
      <section className="rounded-lg border border-white/10 bg-bg-surface/30 p-4" aria-labelledby="tier-order-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 id="tier-order-heading" className="font-heading text-base font-semibold text-text-primary">Tier Order</h2>
            <p className="mt-1 font-body text-sm text-text-secondary">Drag cards to control public tier hierarchy.</p>
          </div>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedTiers.map((tier) => tier.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {orderedTiers.map((tier) => (
                <SortableTierCard key={tier.id} tier={tier} selected={selectedTier?.id === tier.id} onSelect={() => setSelectedId(tier.id)} onEdit={() => setSelectedId(tier.id)} onToggleVisibility={() => toggleTierVisibility(tier)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {selectedTier && (
        <section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-bg-surface/30 p-4" aria-labelledby="tier-detail-heading">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 id="tier-detail-heading" className="font-heading text-xl font-semibold text-text-primary">{selectedTier.name}</h2>
              <p className="mt-1 max-w-2xl font-body text-sm text-text-secondary">{selectedTier.description ?? 'No description set.'}</p>
            </div>
            <button type="button" onClick={() => setAssigning(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-xs text-white hover:bg-accent-primary/90">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Assign Title
            </button>
          </div>

          <TierEditPanel key={selectedTier.id} tier={selectedTier} onSave={saveTier} />

          <div className="rounded-lg border border-white/10 bg-bg-deep/30 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-heading text-sm font-semibold text-text-primary">Assigned Titles</h3>
              <span className="font-data text-xs text-text-tertiary">{selectedTitles.length}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {selectedTitles.map((title) => (
                <div key={title.id} className="flex items-center gap-3 rounded-md border border-white/10 bg-bg-surface/40 p-2">
                  <div className="w-9 overflow-hidden rounded-md">
                    <CoverImage slug={title.cover_slug ?? title.slug} alt="" origin={title.origin} rounded />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm text-text-primary">{title.title_english}</p>
                    <p className="font-data text-xs text-text-tertiary">{title.rating ?? '-'} rating</p>
                  </div>
                  <button type="button" onClick={() => removeTitle(title.id)} className="rounded-md p-1.5 text-semantic-danger hover:bg-semantic-danger/10" aria-label={`Remove ${title.title_english}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {selectedTitles.length === 0 && <p className="py-8 font-body text-sm text-text-tertiary">No titles assigned to this tier.</p>}
            </div>
          </div>
        </section>
      )}

      {assigning && selectedTier && <AssignTierTitleModal tier={selectedTier} titles={titles} onClose={() => setAssigning(false)} onAssign={assignTitle} />}
    </div>
  );
}
