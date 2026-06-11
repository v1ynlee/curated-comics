'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { toast } from '@/lib/utils/toast';
import type { StudioDraft, StudioDraftType } from '@/hooks/useDraftManager';

interface DraftRecord extends StudioDraft<unknown> {
  storageKey: string;
}

const STORAGE_PREFIX = 'studio:draft:';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function resumeHref(type: StudioDraftType, key: string) {
  if (type === 'title') return key === 'new' ? '/studio/titles/new' : `/studio/titles/${key}`;
  if (type === 'article') return key === 'new' ? '/studio/articles/new' : `/studio/articles/${key}`;
  if (type === 'creator') return '/studio/creators';
  if (type === 'curation' || type === 'narrative' || type === 'featured') return '/studio/curation';
  return '/studio';
}

function readDrafts() {
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
      // Ignore malformed drafts; they should not block the dashboard.
    }
  }
  return drafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function DraftRecoveryWidget() {
  const [drafts, setDrafts] = useState<DraftRecord[]>(() => typeof window === 'undefined' ? [] : readDrafts());

  function discardDraft(draft: DraftRecord) {
    localStorage.removeItem(draft.storageKey);
    setDrafts((current) => current.filter((item) => item.storageKey !== draft.storageKey));
    toast.success('Draft discarded.');
  }

  if (drafts.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-bg-surface/35 px-4 py-6">
        <p className="font-body text-sm text-text-secondary">No local drafts waiting for recovery.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-bg-surface/35">
      {drafts.slice(0, 5).map((draft) => (
        <div key={draft.storageKey} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-body text-sm font-medium text-text-primary">{draft.title}</p>
              <span className="rounded-md border border-white/10 px-2 py-0.5 font-body text-xs text-text-tertiary">{draft.type}</span>
            </div>
            <p className="mt-1 line-clamp-1 font-body text-xs text-text-secondary">{draft.preview || 'No preview saved.'}</p>
            <p className="mt-1 font-body text-xs text-text-tertiary">Saved {formatDate(draft.savedAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={resumeHref(draft.type, draft.key)} className="inline-flex h-8 items-center rounded-md bg-accent-primary px-3 font-heading text-xs text-white hover:bg-accent-primary/90">
              Resume
            </Link>
            <button type="button" onClick={() => discardDraft(draft)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-text-tertiary hover:bg-white/5 hover:text-text-primary" aria-label={`Discard ${draft.title}`}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
