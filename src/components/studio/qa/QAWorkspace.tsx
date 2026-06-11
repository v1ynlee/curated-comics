'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ExternalLink, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { CoverImage } from '@/components/ui/CoverImage';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { cn } from '@/lib/utils/cn';
import { completionTone } from '@/services/studio/title-completion';
import {
  qaAddReadingUrl,
  qaArchiveCreator,
  qaArchiveTitle,
  qaAssignCreator,
  qaAutoRemoveBrokenNarrativeReferences,
  qaBulkAction,
  qaFillSynopsisWithAI,
  qaIgnoreIssue,
  qaMarkReviewed,
  qaRemoveFeaturedCreator,
  qaRemoveFeaturedTitle,
  qaReplaceFeaturedCreator,
  qaReplaceFeaturedTitle,
  qaUpdateTitleCover,
} from '@/app/studio/qa/actions';
import type { QABulkAction, QAData, QAIssueType, QAOption, QAQuickAction, QAResultItem } from '@/app/studio/qa/types';

interface QAWorkspaceProps {
  data: QAData;
  activeIssue?: QAIssueType;
}

type DrawerState = { action: QAQuickAction; item: QAResultItem } | null;

const ACTION_LABELS: Record<QAQuickAction, string> = {
  'open-editor': 'Open Editor',
  'upload-cover': 'Upload Cover',
  'archive-title': 'Archive Title',
  'open-details-editor': 'Open Details Editor',
  'fill-synopsis-ai': 'Fill With AI',
  ignore: 'Mark Ignore',
  'assign-creator': 'Assign Creator',
  'open-creator-manager': 'Open Creator Manager',
  'open-reading-url-manager': 'Open Reading URL Manager',
  'add-reading-url': 'Fill With AI',
  'open-review-card': 'Open Review Card',
  'mark-reviewed': 'Mark Reviewed',
  'remove-featured-title': 'Remove Featured',
  'replace-featured-title': 'Replace Featured',
  'open-title': 'Open Title',
  'remove-featured-creator': 'Remove Featured Creator',
  'replace-featured-creator': 'Replace Creator',
  'archive-creator': 'Archive Creator',
  'open-narrative-editor': 'Open Narrative Editor',
  'auto-remove-broken-references': 'Auto Remove Broken References',
};

const BULK_LABELS: Record<QABulkAction, string> = {
  'mark-reviewed': 'Mark Reviewed',
  archive: 'Archive',
  ignore: 'Ignore',
  'remove-featured': 'Remove Featured',
};

const PLATFORM_OPTIONS = ['official', 'webtoon', 'kakaopage', 'naver', 'tapas', 'mangadex', 'tappytoon', 'lezhin', 'other'];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function issueTone(count: number) {
  if (count === 0) return 'border-emerald-400/20 bg-emerald-400/5';
  if (count < 5) return 'border-amber-400/25 bg-amber-400/5';
  return 'border-red-400/25 bg-red-400/5';
}

function ResultCover({ item }: { item: QAResultItem }) {
  if (!item.coverSlug || item.issueType === 'missing-covers' || item.issueType === 'draft-content' || item.issueType === 'broken-featured') {
    return <div className="flex h-14 w-10 items-center justify-center rounded-md border border-white/10 bg-bg-deep/60 text-text-tertiary"><Search className="h-4 w-4" aria-hidden="true" /></div>;
  }
  return <div className="w-10 overflow-hidden rounded-md border border-white/10 bg-bg-deep"><CoverImage slug={item.coverSlug} alt="" rounded /></div>;
}

function selectLabel(options: QAOption[], id: string) {
  return options.find((item) => item.id === id)?.label ?? id;
}

function CompletionBadge({ score }: { score?: number | null }) {
  if (score === undefined || score === null) return <span className="font-body text-xs text-text-tertiary">-</span>;
  return <span className={cn('inline-flex rounded-md border px-2 py-1 font-data text-xs', completionTone(score))}>{score}%</span>;
}

export function QAWorkspace({ data, activeIssue }: QAWorkspaceProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [busy, setBusy] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [creatorId, setCreatorId] = useState(data.creatorOptions[0]?.id ?? '');
  const [creatorRole, setCreatorRole] = useState<'author' | 'artist' | 'studio'>('author');
  const [replacementTitleId, setReplacementTitleId] = useState(data.featuredTitleOptions[0]?.id ?? '');
  const [replacementCreatorId, setReplacementCreatorId] = useState(data.featuredCreatorOptions[0]?.id ?? '');
  const [platform, setPlatform] = useState('official');
  const [readingLabel, setReadingLabel] = useState('Read official release');
  const [readingUrl, setReadingUrl] = useState('');
  const [ignoreReason, setIgnoreReason] = useState('');
  const [completionSort, setCompletionSort] = useState('');

  const results = useMemo(() => {
    const filtered = activeIssue ? data.results.filter((item) => item.issueType === activeIssue) : data.results;
    if (completionSort === 'completion-desc') return [...filtered].sort((a, b) => (b.completionScore ?? -1) - (a.completionScore ?? -1));
    if (completionSort === 'completion-asc') return [...filtered].sort((a, b) => (a.completionScore ?? 101) - (b.completionScore ?? 101));
    return filtered;
  }, [activeIssue, completionSort, data.results]);
  const activeSummary = activeIssue ? data.summaries.find((item) => item.type === activeIssue) : null;
  const selectedItems = results.filter((item) => selectedIds.has(item.id));
  const sharedBulkActions = useMemo(() => {
    if (selectedItems.length === 0) return [] as QABulkAction[];
    return selectedItems[0].bulkActions.filter((action) => selectedItems.every((item) => item.bulkActions.includes(action)));
  }, [selectedItems]);

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openDrawer(action: QAQuickAction, item: QAResultItem) {
    setCoverFile(null);
    setReadingUrl('');
    setIgnoreReason('');
    setDrawer({ action, item });
  }

  async function runAction() {
    if (!drawer) return;
    setBusy(true);
    const { action, item } = drawer;
    try {
      let result: { success: boolean; error?: string };
      if (action === 'upload-cover') {
        if (!coverFile || !item.slug) {
          toast.warning('Choose a cover image first.');
          return;
        }
        const formData = new FormData();
        formData.append('file', coverFile);
        formData.append('slug', item.slug);
        formData.append('assetType', 'cover');
        const upload = await fetch('/api/media/upload', { method: 'POST', body: formData });
        if (!upload.ok) {
          const payload = await upload.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Cover upload failed.');
        }
        result = await qaUpdateTitleCover(item.entityId);
      } else if (action === 'archive-title') result = await qaArchiveTitle(item.entityId);
      else if (action === 'fill-synopsis-ai') result = await qaFillSynopsisWithAI(item.entityId);
      else if (action === 'assign-creator') result = await qaAssignCreator(item.entityId, creatorId, creatorRole);
      else if (action === 'add-reading-url') result = await qaAddReadingUrl(item.entityId, { platform, label: readingLabel, url: readingUrl });
      else if (action === 'mark-reviewed') result = await qaMarkReviewed(item.entityId);
      else if (action === 'remove-featured-title') result = await qaRemoveFeaturedTitle(item.entityId);
      else if (action === 'replace-featured-title') result = await qaReplaceFeaturedTitle(item.entityId, replacementTitleId);
      else if (action === 'remove-featured-creator') result = await qaRemoveFeaturedCreator(item.entityId);
      else if (action === 'replace-featured-creator') result = await qaReplaceFeaturedCreator(item.entityId, replacementCreatorId);
      else if (action === 'archive-creator') result = await qaArchiveCreator(item.entityId);
      else if (action === 'auto-remove-broken-references') result = await qaAutoRemoveBrokenNarrativeReferences(item.entityId);
      else if (action === 'ignore') result = await qaIgnoreIssue(item, ignoreReason);
      else {
        setDrawer(null);
        return;
      }

      if (!result.success) throw new Error(result.error ?? 'Action failed.');
      toast.success(`${ACTION_LABELS[action]} complete.`);
      setDrawer(null);
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'QA action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function runBulk(action: QABulkAction) {
    setBusy(true);
    try {
      const result = await qaBulkAction(action, selectedItems);
      if (!result.success) throw new Error(result.error);
      toast.success(`${BULK_LABELS[action]} applied to ${result.data.count} row${result.data.count === 1 ? '' : 's'}.`);
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bulk action failed.');
    } finally {
      setBusy(false);
    }
  }

  const healthy = data.results.length === 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">QA</h1>
          <p className="mt-1 max-w-2xl font-body text-sm text-text-secondary">Resolve missing metadata, incomplete relationships, drafts, and broken featured content without leaving the dashboard.</p>
        </div>
        <Link href="/studio/qa" className="inline-flex h-9 items-center gap-2 self-start rounded-md border border-white/10 px-3 font-heading text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary sm:self-auto">All Issues</Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.summaries.map((summary) => {
          const active = activeIssue === summary.type;
          return <Link key={summary.type} href={`/studio/qa?issue=${summary.type}`} className={cn('rounded-lg border p-4 transition-colors', issueTone(summary.count), active ? 'border-accent-primary/70' : 'hover:border-white/20')}><div className="flex items-start justify-between gap-3"><div><p className="font-heading text-sm font-semibold text-text-primary">{summary.label}</p><p className="mt-1 line-clamp-2 font-body text-xs text-text-tertiary">{summary.description}</p></div><span className="font-data text-2xl text-text-primary">{summary.count}</span></div></Link>;
        })}
      </div>

      {selectedItems.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-bg-surface/40 px-4 py-3">
          <p className="font-body text-sm text-text-secondary">{selectedItems.length} selected</p>
          <div className="flex flex-wrap gap-2">
            {sharedBulkActions.map((action) => <button key={action} type="button" disabled={busy} onClick={() => runBulk(action)} className="h-8 rounded-md border border-white/10 px-3 font-body text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary disabled:opacity-50">{BULK_LABELS[action]}</button>)}
          </div>
        </div>
      )}

      <section className="rounded-lg border border-white/10 bg-bg-surface/35">
        <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-heading text-lg font-semibold text-text-primary">{activeSummary ? `${activeSummary.label} (${results.length})` : `All Issues (${results.length})`}</h2><p className="mt-1 font-body text-sm text-text-tertiary">{activeSummary?.description ?? 'Every detected content health issue in one place.'}</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={completionSort} onChange={(event) => setCompletionSort(event.target.value)} className="h-9 rounded-md border border-white/10 bg-bg-surface px-2 font-body text-xs text-text-primary" aria-label="Sort QA by completion">
              <option value="">Default Order</option>
              <option value="completion-desc">Highest Completion</option>
              <option value="completion-asc">Lowest Completion</option>
            </select>
            {healthy && <span className="inline-flex items-center gap-2 font-body text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />No issues detected</span>}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center"><CheckCircle2 className="h-8 w-8 text-emerald-400" aria-hidden="true" /><p className="font-body text-sm text-text-secondary">No matching issues found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left">
              <thead className="border-b border-white/10 font-heading text-xs text-text-tertiary"><tr><th className="w-10 px-4 py-3 font-medium"><span className="sr-only">Select</span></th><th className="px-4 py-3 font-medium">Cover</th><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Completion</th><th className="px-4 py-3 font-medium">Issue Type</th><th className="px-4 py-3 font-medium">Updated At</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-white/10">
                {results.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelected(item.id)} className="h-4 w-4 rounded border-white/10 bg-bg-deep" aria-label={`Select ${item.title}`} /></td>
                    <td className="px-4 py-3"><ResultCover item={item} /></td>
                    <td className="px-4 py-3"><div className="min-w-0"><Link href={item.editorHref} className="font-body text-sm font-medium text-text-primary hover:text-accent-primary">{item.title}</Link>{item.subtitle && <p className="mt-0.5 line-clamp-1 font-body text-xs text-text-tertiary">{item.subtitle}</p>}{item.issueDetail && <p className="mt-1 line-clamp-2 font-body text-xs text-amber-200/80">{item.issueDetail}</p>}</div></td>
                    <td className="px-4 py-3"><CompletionBadge score={item.completionScore} /></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-2 font-body text-xs text-amber-300"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />{item.issueLabel}</span></td>
                    <td className="px-4 py-3 font-body text-xs text-text-tertiary">{formatDate(item.updatedAt)}</td>
                    <td className="px-4 py-3 text-right"><div className="inline-flex flex-wrap justify-end gap-2">{item.actions.map((action) => <button key={action} type="button" onClick={() => openDrawer(action, item)} className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 font-body text-xs', action === item.actions[0] ? 'bg-accent-primary text-white hover:bg-accent-primary/90' : 'border border-white/10 text-text-secondary hover:bg-white/5 hover:text-text-primary')}>{ACTION_LABELS[action]}</button>)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {drawer && (
        <ModalPortal>
          <div className="fixed left-0 top-0 z-modal h-[100dvh] w-[100dvw] bg-black/55" role="dialog" aria-modal="true" aria-label={ACTION_LABELS[drawer.action]}>
            <button type="button" aria-label="Close quick fix" className="absolute inset-0 cursor-default" onClick={() => setDrawer(null)} />
            <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-lg flex-col border-l border-white/10 bg-bg-deep shadow-lg">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5"><div className="min-w-0"><h2 className="font-heading text-xl font-semibold text-text-primary">{ACTION_LABELS[drawer.action]}</h2><p className="mt-1 truncate font-body text-sm text-text-secondary">{drawer.item.title}</p></div><button type="button" onClick={() => setDrawer(null)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-text-tertiary hover:bg-white/5 hover:text-text-primary" aria-label="Close quick fix"><X className="h-4 w-4" aria-hidden="true" /></button></div>
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {drawer.action.startsWith('open-') && <div className="rounded-lg border border-white/10 bg-bg-surface/40 p-4"><p className="font-body text-sm text-text-secondary">This action opens the relevant editor in a new workspace page.</p><Link href={drawer.item.editorHref} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90">Open <ExternalLink className="h-4 w-4" aria-hidden="true" /></Link></div>}
                {drawer.action === 'upload-cover' && <label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Cover image</span><input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} className="block w-full rounded-md border border-white/10 bg-bg-surface/50 px-3 py-2 font-body text-sm text-text-secondary" /></label>}
                {drawer.action === 'assign-creator' && <div className="space-y-3"><label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Search Creator</span><select value={creatorId} onChange={(event) => setCreatorId(event.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 font-body text-sm text-text-primary">{data.creatorOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label><label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Role</span><select value={creatorRole} onChange={(event) => setCreatorRole(event.target.value as 'author' | 'artist' | 'studio')} className="h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 font-body text-sm text-text-primary"><option value="author">Author</option><option value="artist">Artist</option><option value="studio">Studio</option></select></label></div>}
                {drawer.action === 'add-reading-url' && <div className="space-y-3"><p className="font-body text-sm text-text-tertiary">AI cannot verify official reading sources safely here. Add the verified URL and QA will clear the issue.</p><label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Platform</span><select value={platform} onChange={(event) => setPlatform(event.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 font-body text-sm text-text-primary">{PLATFORM_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Label</span><input value={readingLabel} onChange={(event) => setReadingLabel(event.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-bg-surface/50 px-3 font-body text-sm text-text-primary" /></label><label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">URL</span><input value={readingUrl} onChange={(event) => setReadingUrl(event.target.value)} placeholder="https://" className="h-10 w-full rounded-md border border-white/10 bg-bg-surface/50 px-3 font-body text-sm text-text-primary" /></label></div>}
                {drawer.action === 'replace-featured-title' && <label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Replacement title</span><select value={replacementTitleId} onChange={(event) => setReplacementTitleId(event.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 font-body text-sm text-text-primary">{data.featuredTitleOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><p className="mt-2 font-body text-xs text-text-tertiary">Selected: {selectLabel(data.featuredTitleOptions, replacementTitleId)}</p></label>}
                {drawer.action === 'replace-featured-creator' && <label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Replacement creator</span><select value={replacementCreatorId} onChange={(event) => setReplacementCreatorId(event.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-bg-surface px-3 font-body text-sm text-text-primary">{data.featuredCreatorOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><p className="mt-2 font-body text-xs text-text-tertiary">Selected: {selectLabel(data.featuredCreatorOptions, replacementCreatorId)}</p></label>}
                {drawer.action === 'ignore' && <label className="block"><span className="mb-2 block font-body text-sm text-text-secondary">Reason</span><textarea value={ignoreReason} onChange={(event) => setIgnoreReason(event.target.value)} rows={4} className="w-full rounded-md border border-white/10 bg-bg-surface/50 px-3 py-2 font-body text-sm text-text-primary" placeholder="Optional note for future editors" /></label>}
                {!drawer.action.startsWith('open-') && !['upload-cover', 'assign-creator', 'add-reading-url', 'replace-featured-title', 'replace-featured-creator', 'ignore'].includes(drawer.action) && <p className="font-body text-sm text-text-secondary">Apply this fix to resolve the selected QA issue.</p>}
              </div>
              {!drawer.action.startsWith('open-') && <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4"><button type="button" onClick={() => setDrawer(null)} className="h-9 rounded-md px-3 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">Cancel</button><button type="button" onClick={runAction} disabled={busy} className="h-9 rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90 disabled:opacity-50">{busy ? 'Saving...' : 'Save'}</button></div>}
            </aside>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
