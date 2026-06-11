'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@/lib/utils/toast';
import { logStudioActivityAction } from '@/app/studio/activity/actions';

export type StudioDraftType = 'title' | 'article' | 'creator' | 'curation' | 'narrative' | 'featured';

export interface StudioDraft<TData> {
  type: StudioDraftType;
  key: string;
  title: string;
  preview: string;
  savedAt: string;
  data: TData;
}

interface UseDraftManagerOptions<TData> {
  type: StudioDraftType;
  key: string;
  title: string;
  preview?: string;
  data: TData;
  enabled?: boolean;
  isDirty?: boolean;
  onRestore: (data: TData) => void;
}

const STORAGE_PREFIX = 'studio:draft:';

function storageKey(type: StudioDraftType, key: string) {
  return `${STORAGE_PREFIX}${type}:${key}`;
}

function readDraft<TData>(type: StudioDraftType, key: string): StudioDraft<TData> | null {
  const raw = localStorage.getItem(storageKey(type, key));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StudioDraft<TData>;
    if (!parsed.type || !parsed.savedAt || parsed.data === undefined) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft<TData>(draft: StudioDraft<TData>) {
  localStorage.setItem(storageKey(draft.type, draft.key), JSON.stringify(draft));
}

function removeDraft(type: StudioDraftType, key: string) {
  localStorage.removeItem(storageKey(type, key));
}

function logDraftActivity<TData>(eventType: 'DRAFT_SAVED' | 'DRAFT_RESTORED' | 'DRAFT_DELETED', draft: StudioDraft<TData>) {
  void logStudioActivityAction({
    eventType,
    entityType: 'draft',
    entityId: `${draft.type}:${draft.key}`,
    entityName: draft.title,
    metadata: {
      newValues: {
        type: draft.type,
        key: draft.key,
        title: draft.title,
        preview: draft.preview,
        savedAt: draft.savedAt,
      },
      changedFields: ['type', 'key', 'title', 'preview', 'savedAt'],
    },
  }).catch((error) => console.error('Draft activity logging failed:', error));
}

export function useDraftManager<TData>({
  type,
  key,
  title,
  preview = '',
  data,
  enabled = true,
  isDirty = true,
  onRestore,
}: UseDraftManagerOptions<TData>) {
  const [draft, setDraft] = useState<StudioDraft<TData> | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const suppressBeforeUnload = useRef(false);
  const fullKey = useMemo(() => storageKey(type, key), [key, type]);

  useEffect(() => {
    if (!enabled) return;
    const timeoutId = window.setTimeout(() => {
      const savedDraft = readDraft<TData>(type, key);
      if (savedDraft) {
        setDraft(savedDraft);
        setShowRecovery(true);
        toast.info('Draft found.');
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [enabled, fullKey, key, type]);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (suppressBeforeUnload.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, isDirty]);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.download) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin || nextUrl.href === window.location.href) return;

      event.preventDefault();
      setPendingHref(nextUrl.href);
      setShowUnsaved(true);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [enabled, isDirty]);

  const saveDraft = useCallback(() => {
    const nextDraft: StudioDraft<TData> = {
      type,
      key,
      title: title || 'Untitled draft',
      preview,
      savedAt: new Date().toISOString(),
      data,
    };
    writeDraft(nextDraft);
    setDraft(nextDraft);
    logDraftActivity('DRAFT_SAVED', nextDraft);
    toast.success('Draft saved.');
    return nextDraft;
  }, [data, key, preview, title, type]);

  const deleteDraft = useCallback(() => {
    const deletedDraft = draft;
    removeDraft(type, key);
    setDraft(null);
    setShowRecovery(false);
    if (deletedDraft) logDraftActivity('DRAFT_DELETED', deletedDraft);
    toast.success('Draft deleted.');
  }, [draft, key, type]);

  const continueDraft = useCallback(() => {
    if (!draft) return;
    onRestore(draft.data);
    setShowRecovery(false);
    logDraftActivity('DRAFT_RESTORED', draft);
    toast.success('Draft restored.');
  }, [draft, onRestore]);

  const startFresh = useCallback(() => {
    setShowRecovery(false);
    toast.info('Starting fresh. Draft kept.');
  }, []);

  const cancelNavigation = useCallback(() => {
    setShowUnsaved(false);
    setPendingHref(null);
  }, []);

  const discardAndContinue = useCallback(() => {
    if (!pendingHref) return;
    suppressBeforeUnload.current = true;
    window.location.href = pendingHref;
  }, [pendingHref]);

  const saveDraftAndContinue = useCallback(() => {
    saveDraft();
    if (!pendingHref) return;
    suppressBeforeUnload.current = true;
    window.location.href = pendingHref;
  }, [pendingHref, saveDraft]);

  const markClean = useCallback(() => {
    removeDraft(type, key);
    setDraft(null);
    setShowRecovery(false);
    setShowUnsaved(false);
    setPendingHref(null);
  }, [key, type]);

  return {
    draft,
    showRecovery,
    showUnsaved,
    pendingHref,
    saveDraft,
    deleteDraft,
    continueDraft,
    startFresh,
    cancelNavigation,
    discardAndContinue,
    saveDraftAndContinue,
    markClean,
  };
}
