'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ignoreStudioTask } from '@/app/studio/tasks/actions';
import { cn } from '@/lib/utils/cn';
import type { StudioDraft, StudioDraftType } from '@/hooks/useDraftManager';
import type { StudioTask, StudioTaskFilter, StudioTaskPriority } from '@/app/studio/tasks/types';

interface TaskQueueProps {
  tasks: StudioTask[];
  activeFilter: StudioTaskFilter;
}

interface DraftRecord extends StudioDraft<unknown> { storageKey: string }

const FILTERS: Array<{ value: StudioTaskFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'titles', label: 'Titles' },
  { value: 'articles', label: 'Articles' },
  { value: 'creators', label: 'Creators' },
  { value: 'media', label: 'Media' },
  { value: 'narratives', label: 'Narratives' },
  { value: 'ai', label: 'AI' },
  { value: 'qa', label: 'QA' },
];

const STORAGE_PREFIX = 'studio:draft:';

function priorityTone(priority: StudioTaskPriority) {
  if (priority === 'critical') return 'border-red-400/30 bg-red-400/10 text-red-300';
  if (priority === 'high') return 'border-amber-400/30 bg-amber-400/10 text-amber-300';
  if (priority === 'medium') return 'border-yellow-400/25 bg-yellow-400/10 text-yellow-300';
  return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function resumeHref(type: StudioDraftType, key: string) {
  if (type === 'title') return key === 'new' ? '/studio/titles/new' : `/studio/titles/${key}`;
  if (type === 'article') return key === 'new' ? '/studio/articles/new' : `/studio/articles/${key}`;
  if (type === 'creator') return '/studio/creators';
  if (type === 'curation' || type === 'narrative' || type === 'featured') return '/studio/curation';
  return '/studio';
}

function readDrafts(): DraftRecord[] {
  if (typeof window === 'undefined') return [];
  const drafts: DraftRecord[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const storageKey = localStorage.key(index);
    if (!storageKey?.startsWith(STORAGE_PREFIX)) continue;
    const raw = localStorage.getItem(storageKey);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as StudioDraft<unknown>;
      if (!parsed.type || !parsed.key || !parsed.savedAt || parsed.data === undefined) continue;
      drafts.push({ ...parsed, storageKey });
    } catch {
      // Ignore malformed local drafts.
    }
  }
  return drafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

function draftToTask(draft: DraftRecord): StudioTask {
  return {
    id: `draft:${draft.storageKey}`,
    priority: 'medium',
    source: 'draft',
    entityType: 'draft',
    entityId: `${draft.type}:${draft.key}`,
    entityName: draft.title,
    issue: 'Recovered draft',
    detail: draft.preview || 'Local draft is waiting to be resumed or discarded.',
    createdAt: draft.savedAt,
    openHref: resumeHref(draft.type, draft.key),
    resolveHref: resumeHref(draft.type, draft.key),
    assignHref: null,
    metadata: { storageKey: draft.storageKey, draftType: draft.type, draftKey: draft.key },
  };
}

function filterMatches(task: StudioTask, filter: StudioTaskFilter) {
  if (filter === 'all') return true;
  if (filter === 'titles') return task.entityType === 'title';
  if (filter === 'articles') return task.entityType === 'article';
  if (filter === 'creators') return task.entityType === 'creator';
  if (filter === 'media') return task.entityType === 'media';
  if (filter === 'narratives') return task.entityType === 'narrative';
  if (filter === 'ai') return task.source === 'ai';
  if (filter === 'qa') return task.source === 'qa';
  return true;
}

export function TaskQueue({ tasks, activeFilter }: TaskQueueProps) {
  const router = useRouter();
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<DraftRecord[]>(() => readDrafts());
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const allTasks = [...tasks.filter((task) => !ignoredIds.has(task.id)), ...drafts.map(draftToTask)]
    .sort((a, b) => {
      const priorityOrder: Record<StudioTaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const visibleTasks = allTasks.filter((task) => filterMatches(task, activeFilter));

  async function ignoreTask(task: StudioTask) {
    if (task.source === 'draft') {
      const storageKey = task.metadata?.storageKey;
      if (typeof storageKey === 'string') {
        localStorage.removeItem(storageKey);
        setDrafts((current) => current.filter((draft) => draft.storageKey !== storageKey));
        toast.success('Draft discarded.');
      }
      return;
    }

    setBusyTaskId(task.id);
    try {
      const result = await ignoreStudioTask(task, 'Ignored from task queue.');
      if (!result.success) throw new Error(result.error);
      setIgnoredIds((current) => new Set(current).add(task.id));
      toast.success('Task ignored.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not ignore task.');
    } finally {
      setBusyTaskId(null);
    }
  }

  return (
    <>
      <nav className="mb-5 flex gap-1 overflow-x-auto" aria-label="Task filters">
        {FILTERS.map((filter) => {
          const params = new URLSearchParams();
          if (filter.value !== 'all') params.set('filter', filter.value);
          const href = `/studio/tasks${params.toString() ? `?${params.toString()}` : ''}`;
          const active = activeFilter === filter.value;
          return (
            <Link key={filter.value} href={href} className={cn('inline-flex h-9 items-center rounded-md px-3 font-heading text-sm transition-colors', active ? 'bg-white/10 text-text-primary' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary')}>
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <section className="rounded-lg border border-white/10 bg-bg-surface/35">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-text-primary">Editorial Work Queue</h2>
            <p className="mt-1 font-body text-sm text-text-tertiary">{visibleTasks.length} unresolved task{visibleTasks.length === 1 ? '' : 's'}</p>
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" aria-hidden="true" />
            <p className="font-body text-sm text-text-secondary">No tasks match this view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-white/10 font-heading text-xs text-text-tertiary">
                <tr>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Issue</th>
                  <th className="px-4 py-3 font-medium">Created At</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3"><span className={cn('rounded-md border px-2 py-1 font-body text-xs', priorityTone(task.priority))}>{titleCase(task.priority)}</span></td>
                    <td className="px-4 py-3 font-body text-xs text-text-secondary">{titleCase(task.source)}</td>
                    <td className="px-4 py-3"><Link href={task.openHref} className="font-body text-sm font-medium text-text-primary hover:text-accent-primary">{task.entityName}</Link></td>
                    <td className="px-4 py-3"><p className="font-body text-sm text-text-primary">{task.issue}</p>{task.detail && <p className="mt-1 line-clamp-1 font-body text-xs text-text-tertiary">{task.detail}</p>}</td>
                    <td className="px-4 py-3 font-body text-xs text-text-tertiary">{formatDate(task.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Link href={task.openHref} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 font-body text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary">Open <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link>
                        <Link href={task.resolveHref} className="inline-flex h-8 items-center rounded-md bg-accent-primary px-2.5 font-heading text-xs text-white hover:bg-accent-primary/90">Resolve</Link>
                        {task.assignHref && <Link href={task.assignHref} className="inline-flex h-8 items-center rounded-md border border-white/10 px-2.5 font-body text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary">Assign</Link>}
                        <button type="button" onClick={() => ignoreTask(task)} disabled={busyTaskId === task.id} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 font-body text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary disabled:opacity-50">
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Ignore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
