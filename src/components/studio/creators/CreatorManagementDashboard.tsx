'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Plus, Search, Users } from 'lucide-react';
import { CreatorModal } from '@/components/studio/creators/CreatorModal';
import { cn } from '@/lib/utils/cn';
import { getErrorMessage, toast } from '@/lib/utils/toast';
import { ActionMenu } from '@/app/studio/curation/components/ActionMenu';
import {
  createStudioCreator,
  deleteStudioCreator,
  setStudioCreatorStatus,
  updateStudioCreator,
} from '@/app/studio/creators/actions';
import type { CreatorFormInput, CreatorTitleOption, StudioCreator, StudioCreatorType } from '@/app/studio/creators/types';

interface CreatorManagementDashboardProps {
  initialCreators: StudioCreator[];
  titleOptions: CreatorTitleOption[];
}

type ModalState =
  | { mode: 'create'; type: StudioCreatorType }
  | { mode: 'edit'; type: StudioCreatorType; creator: StudioCreator }
  | null;

const TABS: { type: StudioCreatorType; label: string }[] = [
  { type: 'author', label: 'Authors' },
  { type: 'artist', label: 'Artists' },
  { type: 'studio', label: 'Studios' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';
}

function Avatar({ creator }: { creator: StudioCreator }) {
  return (
    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-bg-deep" aria-hidden="true">
      {creator.image ? (
        <Image src={creator.image} alt="" fill sizes="40px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-heading text-[11px] text-text-secondary">
          {getInitials(creator.name)}
        </span>
      )}
    </span>
  );
}

async function runCreatorAction<T>(promise: Promise<{ success: boolean; error?: string; data?: T }>, loading: string, success: string, failure: string) {
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

export function CreatorManagementDashboard({ initialCreators, titleOptions }: CreatorManagementDashboardProps) {
  const [creators, setCreators] = useState(initialCreators);
  const [activeType, setActiveType] = useState<StudioCreatorType>('author');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [isPending, startTransition] = useTransition();

  const visibleCreators = creators
    .filter((creator) => creator.type === activeType)
    .filter((creator) => !query || creator.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const saveCreator = (input: CreatorFormInput) => {
    if (modal?.mode === 'edit') {
      const id = modal.creator.id;
      startTransition(async () => {
        const result = await runCreatorAction(updateStudioCreator(id, input), 'Saving creator...', 'Creator saved.', 'Creator save failed.');
        if (result?.success && result.data) {
          setCreators((current) => current.map((creator) => creator.id === id ? result.data as StudioCreator : creator));
          setModal(null);
        }
      });
      return;
    }

    startTransition(async () => {
      const result = await runCreatorAction(createStudioCreator(input), 'Creating creator...', 'Creator created.', 'Creator creation failed.');
      if (result?.success && result.data) {
        setCreators((current) => [result.data as StudioCreator, ...current]);
        setModal(null);
      }
    });
  };

  const archiveCreator = (creator: StudioCreator) => {
    const nextStatus = creator.status === 'archived' ? 'active' : 'archived';
    setCreators((current) => current.map((item) => item.id === creator.id ? { ...item, status: nextStatus, updated_at: new Date().toISOString() } : item));
    startTransition(() => {
      void runCreatorAction(
        setStudioCreatorStatus(creator.id, nextStatus),
        nextStatus === 'archived' ? 'Archiving creator...' : 'Restoring creator...',
        nextStatus === 'archived' ? 'Creator archived.' : 'Creator restored.',
        'Creator status update failed.',
      );
    });
  };

  const removeCreator = (creator: StudioCreator) => {
    setCreators((current) => current.filter((item) => item.id !== creator.id));
    startTransition(() => {
      void runCreatorAction(deleteStudioCreator(creator.id), 'Deleting creator...', 'Creator deleted.', 'Creator delete failed.');
    });
  };

  return (
    <div className={cn('container-content max-w-7xl py-8', isPending && 'opacity-80')}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">Creators</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{creators.length} creator{creators.length === 1 ? '' : 's'} across authors, artists, and studios</p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'create', type: activeType })} className="inline-flex h-10 items-center gap-2 self-start rounded-md bg-accent-primary px-3 font-heading text-sm text-white transition-colors hover:bg-accent-primary/90 sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New {TABS.find((item) => item.type === activeType)?.label.slice(0, -1)}
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-5 overflow-x-auto">
          {TABS.map((tab) => {
            const active = tab.type === activeType;
            const count = creators.filter((creator) => creator.type === tab.type).length;
            return (
              <button key={tab.type} type="button" onClick={() => setActiveType(tab.type)} className={cn('border-b-2 pb-2 font-heading text-sm transition-colors', active ? 'border-accent-primary text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-primary')}>
                {tab.label} <span className="font-data text-xs text-text-tertiary">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search creators" className="h-10 w-full rounded-md border border-white/10 bg-bg-surface/60 pl-9 pr-3 font-body text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60" />
        </label>
      </div>

      {visibleCreators.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-bg-surface/40 py-16 text-center">
          <Users className="h-8 w-8 text-text-tertiary" aria-hidden="true" />
          <p className="font-body text-sm text-text-secondary">{query ? 'No creators match this search.' : `No ${TABS.find((item) => item.type === activeType)?.label.toLowerCase()} yet.`}</p>
          {!query && <button type="button" onClick={() => setModal({ mode: 'create', type: activeType })} className="font-heading text-sm text-accent-primary hover:text-accent-primary/80">Add one</button>}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-bg-surface/35">
          <div className="hidden grid-cols-[1.6fr_100px_130px_100px_120px_48px] gap-3 border-b border-white/10 px-4 py-3 font-heading text-xs text-text-tertiary md:grid">
            <span>Name</span><span>Type</span><span>Related Titles</span><span>Status</span><span>Updated</span><span />
          </div>
          <div className="flex flex-col divide-y divide-white/10">
            {visibleCreators.map((creator) => (
              <div key={creator.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1.6fr_100px_130px_100px_120px_48px] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar creator={creator} />
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-medium text-text-primary">{creator.name}</p>
                    {creator.description && <p className="mt-0.5 line-clamp-1 font-body text-xs text-text-tertiary">{creator.description}</p>}
                  </div>
                </div>
                <span className="font-body text-xs capitalize text-text-secondary">{creator.type}</span>
                <span className="font-data text-xs text-text-secondary">{creator.title_count}</span>
                <span className={cn('font-body text-xs capitalize', creator.status === 'archived' ? 'text-text-tertiary' : 'text-emerald-400')}>{creator.status}</span>
                <span className="font-body text-xs text-text-tertiary">{formatDate(creator.updated_at)}</span>
                <ActionMenu items={[
                  { label: 'Edit', tone: 'edit', onSelect: () => setModal({ mode: 'edit', type: creator.type, creator }) },
                  { label: 'Preview', tone: 'preview', onSelect: () => window.open(`/creators/${creator.slug}`, '_blank') },
                  { label: creator.status === 'archived' ? 'Restore' : 'Archive', tone: 'archive', onSelect: () => archiveCreator(creator) },
                  { label: 'Delete', tone: 'delete', onSelect: () => removeCreator(creator) },
                ]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <CreatorModal
          mode={modal.mode}
          type={modal.type}
          creator={modal.mode === 'edit' ? modal.creator : undefined}
          titles={titleOptions}
          submitting={isPending}
          onClose={() => setModal(null)}
          onSubmit={saveCreator}
        />
      )}
    </div>
  );
}
