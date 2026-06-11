'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import { DraftManagerModals } from '@/components/studio/DraftManagerModals';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { CoverImage } from '@/components/ui/CoverImage';
import { cn } from '@/lib/utils/cn';
import { useDraftManager } from '@/hooks/useDraftManager';
import type { CurationTitle, FeaturedNarrative } from '@/app/studio/curation/types';

export interface NarrativeModalInput {
  title: string;
  description: string;
  cover_slugs: string[];
}

interface NarrativeModalProps {
  mode: 'create' | 'edit';
  narrative?: FeaturedNarrative | undefined;
  titles: CurationTitle[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (input: NarrativeModalInput) => void;
}

const MIN_TITLES = 4;
const MAX_TITLES = 6;
const TITLE_LIMIT = 120;

function getNarrativeSlug(title: CurationTitle) {
  return title.cover_slug ?? title.slug;
}

export function NarrativeModal({ mode, narrative, titles, submitting = false, onClose, onSubmit }: NarrativeModalProps) {
  const [title, setTitle] = useState(narrative?.title ?? '');
  const [description, setDescription] = useState(narrative?.description ?? '');
  const [query, setQuery] = useState('');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(narrative?.cover_slugs ?? []);
  const [submitted, setSubmitted] = useState(false);
  const draftData: NarrativeModalInput = { title, description, cover_slugs: selectedSlugs };
  const initialDraftData: NarrativeModalInput = {
    title: narrative?.title ?? '',
    description: narrative?.description ?? '',
    cover_slugs: narrative?.cover_slugs ?? [],
  };
  const draftManager = useDraftManager({
    type: 'narrative',
    key: mode === 'create' ? 'new' : narrative?.id ?? 'new',
    title: title || 'Untitled narrative',
    preview: description,
    data: draftData,
    isDirty: JSON.stringify(draftData) !== JSON.stringify(initialDraftData),
    onRestore: (data) => {
      setTitle(data.title);
      setDescription(data.description);
      setSelectedSlugs(data.cover_slugs);
    },
  });

  const selectedSet = useMemo(() => new Set(selectedSlugs), [selectedSlugs]);
  const selectedTitles = selectedSlugs
    .map((slug) => titles.find((item) => getNarrativeSlug(item) === slug))
    .filter(Boolean) as CurationTitle[];
  const visibleTitles = titles
    .filter((item) => item.title_english.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 36);

  const titleError = submitted && !title.trim() ? 'Title is required.' : submitted && title.trim().length > TITLE_LIMIT ? `Use ${TITLE_LIMIT} characters or fewer.` : '';
  const descriptionError = submitted && !description.trim() ? 'Description is required.' : '';
  const selectionError = submitted && selectedSlugs.length < MIN_TITLES
    ? `Select at least ${MIN_TITLES} titles.`
    : submitted && selectedSlugs.length > MAX_TITLES
      ? `Select no more than ${MAX_TITLES} titles.`
      : '';

  const toggleTitle = (slug: string) => {
    setSelectedSlugs((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= MAX_TITLES) return current;
      return [...current, slug];
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const nextTitle = title.trim();
    const nextDescription = description.trim();
    if (!nextTitle || nextTitle.length > TITLE_LIMIT || !nextDescription || selectedSlugs.length < MIN_TITLES || selectedSlugs.length > MAX_TITLES) {
      return;
    }

    onSubmit({ title: nextTitle, description: nextDescription, cover_slugs: selectedSlugs });
    draftManager.markClean();
  };

  return (
    <ModalPortal>
    <div className="fixed left-0 top-0 z-modal flex h-[100dvh] w-[100dvw] items-center justify-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="narrative-modal-title">
      <form
        onSubmit={submit}
        className="grid max-h-[88vh] w-full max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-white/10 bg-bg-surface shadow-lg shadow-black/30"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <h3 id="narrative-modal-title" className="font-heading text-lg font-semibold text-text-primary">
              {mode === 'create' ? 'New Narrative' : 'Edit Narrative'}
            </h3>
            <p className="mt-1 font-body text-sm text-text-tertiary">Select {MIN_TITLES}-{MAX_TITLES} titles for the public narrative scene.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-8 items-center gap-1 rounded-md px-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
        </div>

        <div className="overflow-y-auto p-4 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={TITLE_LIMIT + 20}
                  className={cn('h-10 rounded-md border bg-bg-deep/50 px-3 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60', titleError ? 'border-red-400/70' : 'border-white/10')}
                  placeholder="Editorial narrative title"
                />
                <span className={cn('font-body text-xs', titleError ? 'text-red-300' : 'text-text-tertiary')}>{titleError || `${title.trim().length}/${TITLE_LIMIT}`}</span>
              </label>

              <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  className={cn('resize-none rounded-md border bg-bg-deep/50 px-3 py-2 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60', descriptionError ? 'border-red-400/70' : 'border-white/10')}
                  placeholder="Short setup shown on the homepage narrative section"
                />
                {descriptionError && <span className="font-body text-xs text-red-300">{descriptionError}</span>}
              </label>

              <div className="rounded-md border border-white/10 bg-bg-deep/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-body text-sm font-medium text-text-primary">Selected Titles</p>
                  <span className={cn('font-data text-xs', selectionError ? 'text-red-300' : 'text-text-tertiary')}>{selectedSlugs.length}/{MAX_TITLES}</span>
                </div>
                {selectionError && <p className="mt-1 font-body text-xs text-red-300">{selectionError}</p>}
                <div className="mt-3 flex flex-col gap-2">
                  {selectedTitles.length === 0 && <p className="font-body text-sm text-text-tertiary">No titles selected yet.</p>}
                  {selectedTitles.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-bg-surface px-2 py-2">
                      <span className="min-w-0 truncate font-body text-sm text-text-primary">{index + 1}. {item.title_english}</span>
                      <button type="button" onClick={() => toggleTitle(getNarrativeSlug(item))} className="rounded-md px-2 py-1 font-body text-xs text-text-tertiary hover:bg-white/5 hover:text-text-primary">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search titles"
                  className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60"
                />
              </label>

              <div className="max-h-[48vh] overflow-y-auto pr-1 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
                <div className="flex flex-col gap-1.5">
                  {visibleTitles.map((item) => {
                    const slug = getNarrativeSlug(item);
                    const selected = selectedSet.has(slug);
                    const disabled = !selected && selectedSlugs.length >= MAX_TITLES;
                    return (
                      <div key={item.id} className={cn('grid grid-cols-[42px_1fr_36px] items-center gap-3 rounded-md border px-2 py-2', selected ? 'border-accent-primary/50 bg-accent-primary/10' : 'border-white/10 bg-bg-deep/35')}>
                        <div className="w-8 overflow-hidden rounded-md">
                          <CoverImage slug={slug} alt="" origin={item.origin} tier={item.tier as never} rounded />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-body text-sm text-text-primary">{item.title_english}</p>
                          <p className="font-data text-xs text-text-tertiary">{item.tier ?? '-'} · {item.origin}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleTitle(slug)}
                          disabled={disabled}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-text-secondary transition-colors hover:border-white/20 hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={selected ? `Remove ${item.title_english}` : `Add ${item.title_english}`}
                        >
                          {selected ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </div>
                    );
                  })}
                  {visibleTitles.length === 0 && <p className="py-8 text-center font-body text-sm text-text-tertiary">No titles found.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 p-4">
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center gap-2 rounded-md px-3 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90 disabled:cursor-wait disabled:opacity-70">
            {mode === 'create' ? <Plus className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
            {mode === 'create' ? 'Add Narrative' : 'Save Narrative'}
          </button>
        </div>
      </form>
      <DraftManagerModals
        draft={draftManager.draft}
        showRecovery={draftManager.showRecovery}
        showUnsaved={draftManager.showUnsaved}
        onContinueDraft={draftManager.continueDraft}
        onStartFresh={draftManager.startFresh}
        onDeleteDraft={draftManager.deleteDraft}
        onSaveDraft={draftManager.saveDraftAndContinue}
        onDiscard={draftManager.discardAndContinue}
        onCancel={draftManager.cancelNavigation}
      />
    </div>
    </ModalPortal>
  );
}
