'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, BookOpen, CheckCircle2, Clock, FileText, History, Image as ImageIcon, Search, Sparkles, UserRound, X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { cn } from '@/lib/utils/cn';
import type { ActivityFilter, ActivityItem } from '@/app/studio/activity/types';

const FILTERS: Array<{ value: ActivityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'titles', label: 'Titles' },
  { value: 'articles', label: 'Articles' },
  { value: 'creators', label: 'Creators' },
  { value: 'media', label: 'Media' },
  { value: 'curation', label: 'Curation' },
  { value: 'ai', label: 'AI' },
  { value: 'drafts', label: 'Drafts' },
  { value: 'qa', label: 'QA' },
];

function eventLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function activityIcon(item: ActivityItem) {
  if (item.entityType === 'ai') return Bot;
  if (item.entityType === 'article') return FileText;
  if (item.entityType === 'creator') return UserRound;
  if (item.entityType === 'media' || item.entityType === 'gallery' || item.entityType === 'character') return ImageIcon;
  if (item.entityType === 'title') return BookOpen;
  if (item.entityType === 'draft') return Clock;
  if (item.entityType === 'qa') return CheckCircle2;
  if (item.entityType === 'curation' || item.entityType === 'featured' || item.entityType === 'narrative') return Sparkles;
  return History;
}

function metadataRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not set';
  if (Array.isArray(value)) return value.length ? value.map(formatMetadataValue).join(', ') : 'None';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function MetadataList({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/40">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="font-heading text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <dl className="divide-y divide-white/10">
        {entries.map(([key, value]) => (
          <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_1fr]">
            <dt className="font-body text-xs text-text-tertiary">{eventLabel(key)}</dt>
            <dd className="whitespace-pre-wrap break-words font-body text-sm text-text-secondary">{formatMetadataValue(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ActivityDrawer({ item, onClose }: { item: ActivityItem; onClose: () => void }) {
  const oldValues = metadataRecord(item.metadata.oldValues);
  const newValues = metadataRecord(item.metadata.newValues);
  const reservedKeys = new Set(['oldValues', 'newValues', 'changedFields']);
  const extraMetadata = Object.fromEntries(Object.entries(item.metadata).filter(([key]) => !reservedKeys.has(key)));
  const changedFields = Array.isArray(item.metadata.changedFields) ? item.metadata.changedFields : [];

  return (
    <ModalPortal>
      <div className="fixed left-0 top-0 z-modal h-[100dvh] w-[100dvw] bg-black/55" role="dialog" aria-modal="true" aria-label="Activity details">
        <button type="button" aria-label="Close activity details" className="absolute inset-0 cursor-default" onClick={onClose} />
        <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-xl flex-col border-l border-white/10 bg-bg-deep shadow-lg">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5">
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-semibold text-text-primary">{eventLabel(item.eventType)}</h2>
              <p className="mt-1 truncate font-body text-sm text-text-secondary">{item.entityName ?? 'Untitled record'}</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-text-tertiary hover:bg-white/5 hover:text-text-primary" aria-label="Close activity details">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <section className="rounded-lg border border-white/10 bg-bg-surface/40 p-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="font-body text-xs text-text-tertiary">Timestamp</dt>
                  <dd className="mt-1 font-body text-sm text-text-primary">{formatDateTime(item.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-text-tertiary">Actor</dt>
                  <dd className="mt-1 font-body text-sm text-text-primary">{item.actorName ?? 'Studio user'}</dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-text-tertiary">Entity</dt>
                  <dd className="mt-1 font-body text-sm text-text-primary">{eventLabel(item.entityType)}</dd>
                </div>
                <div>
                  <dt className="font-body text-xs text-text-tertiary">Record ID</dt>
                  <dd className="mt-1 break-all font-body text-sm text-text-primary">{item.entityId ?? 'Not set'}</dd>
                </div>
              </dl>
            </section>

            {changedFields.length > 0 && (
              <section className="rounded-lg border border-white/10 bg-bg-surface/40 p-4">
                <h3 className="font-heading text-sm font-semibold text-text-primary">Changed Fields</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {changedFields.map((field) => (
                    <span key={String(field)} className="rounded-md border border-white/10 px-2 py-1 font-body text-xs text-text-secondary">
                      {eventLabel(String(field))}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <MetadataList title="Old Values" data={oldValues} />
            <MetadataList title="New Values" data={newValues} />
            <MetadataList title="Metadata" data={extraMetadata} />
          </div>
        </aside>
      </div>
    </ModalPortal>
  );
}

export function ActivityTimeline({ items, activeFilter, query }: { items: ActivityItem[]; activeFilter: ActivityFilter; query: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ActivityItem | null>(null);
  const [search, setSearch] = useState(query);
  const [isPending, startTransition] = useTransition();

  function buildFilterHref(filter: ActivityFilter) {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    if (search.trim()) params.set('q', search.trim());
    return `/studio/activity${params.toString() ? `?${params.toString()}` : ''}`;
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = search.trim();
    const params = new URLSearchParams();
    if (activeFilter !== 'all') params.set('filter', activeFilter);
    if (nextSearch) params.set('q', nextSearch);
    startTransition(() => router.push(`/studio/activity${params.toString() ? `?${params.toString()}` : ''}`));
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Activity filters">
          {FILTERS.map((filter) => (
            <a
              key={filter.value}
              href={buildFilterHref(filter.value)}
              className={cn(
                'inline-flex h-9 items-center rounded-md px-3 font-heading text-sm transition-colors',
                activeFilter === filter.value
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
              )}
            >
              {filter.label}
            </a>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
          <input
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, creator, article, narrative"
            className="h-10 w-full rounded-md border border-white/10 bg-bg-surface/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/70"
          />
        </form>
      </div>

      <section className="rounded-lg border border-white/10 bg-bg-surface/35">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-text-primary">Activity Feed</h2>
            <p className="mt-1 font-body text-sm text-text-tertiary">{items.length} event{items.length === 1 ? '' : 's'} found</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <History className="h-8 w-8 text-text-tertiary" aria-hidden="true" />
            <p className="font-body text-sm text-text-secondary">No activity matches this view.</p>
          </div>
        ) : (
          <ol className="divide-y divide-white/10">
            {items.map((item) => {
              const Icon = activityIcon(item);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] sm:grid-cols-[32px_1fr_auto] sm:items-center"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-bg-deep text-text-secondary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-sm font-semibold text-text-primary">{eventLabel(item.eventType)}</span>
                      <span className="mt-1 block truncate font-body text-sm text-text-secondary">{item.entityName ?? 'Untitled record'}</span>
                      <span className="mt-1 block font-body text-xs text-text-tertiary">{item.actorName ?? 'Studio user'}</span>
                    </span>
                    <span className="font-body text-xs text-text-tertiary sm:text-right">{formatTime(item.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {isPending && <div className="fixed right-4 top-24 z-toast rounded-md border border-white/10 bg-bg-deep px-3 py-2 font-body text-xs text-text-secondary">Updating activity...</div>}
      {selected && <ActivityDrawer item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
