'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { cn } from '@/lib/utils/cn';
import type { AutofillConfidence, AutofillFieldIntelligence, AutofillPayload, AutofillPayloadField, TitleFormData } from '@/types/studio';

type AutofillField = AutofillPayloadField;

interface AIPreviewModalProps {
  open: boolean;
  currentData: TitleFormData;
  payload: AutofillPayload | null;
  genreLabels?: Record<string, string>;
  moodLabels?: Record<string, string>;
  onApply: (fields: AutofillField[]) => void;
  onDiscard: () => void;
}

const FIELD_LABELS: Record<AutofillField, string> = {
  englishTitle: 'English Title',
  originalTitle: 'Original Title',
  alternativeTitles: 'Alternative Titles',
  origin: 'Origin',
  seriesStatus: 'Series Status',
  readingStatus: 'Reading Status',
  author: 'Author',
  artist: 'Artist',
  releaseDate: 'Release Date',
  completedDate: 'Completed Date',
  synopsis: 'Synopsis',
  vibeCheck: 'Vibe Check',
  genres: 'Genres',
  moods: 'Moods',
};

const FIELD_ORDER: AutofillField[] = [
  'englishTitle',
  'originalTitle',
  'alternativeTitles',
  'origin',
  'seriesStatus',
  'readingStatus',
  'author',
  'artist',
  'releaseDate',
  'completedDate',
  'synopsis',
  'vibeCheck',
  'genres',
  'moods',
];

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

function formatValue(value: unknown, labels?: Record<string, string>) {
  if (Array.isArray(value)) {
    const list = value.map((item) => labels?.[String(item)] ?? String(item)).filter(Boolean);
    return list.length > 0 ? list.join(', ') : '(empty)';
  }
  if (value === undefined || value === null || String(value).trim() === '') return '(empty)';
  return String(value);
}

function getCurrentValue(data: TitleFormData, field: AutofillField) {
  return data[field as keyof TitleFormData];
}

function confidenceTone(confidence: AutofillConfidence) {
  if (confidence === 'high') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
  if (confidence === 'medium') return 'border-amber-400/30 bg-amber-400/10 text-amber-300';
  return 'border-red-400/30 bg-red-400/10 text-red-300';
}

function confidenceLabel(confidence: AutofillConfidence) {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

function defaultIntelligence(field: AutofillField): AutofillFieldIntelligence {
  return {
    confidence: field === 'synopsis' || field === 'vibeCheck' ? 'low' : 'medium',
    rationale: field === 'synopsis' || field === 'vibeCheck'
      ? 'Generated editorial text; verify before publishing.'
      : 'No source metadata was returned for this field.',
  };
}

function intelligenceFor(payload: AutofillPayload, field: AutofillField) {
  return payload.fieldIntelligence?.[field] ?? defaultIntelligence(field);
}

export function AIPreviewModal({ open, currentData, payload, genreLabels = {}, moodLabels = {}, onApply, onDiscard }: AIPreviewModalProps) {
  const [pendingApplyFields, setPendingApplyFields] = useState<AutofillField[] | null>(null);
  const changes = useMemo(() => {
    if (!payload) return [];
    return FIELD_ORDER
      .filter((field) => hasValue(payload[field]))
      .map((field) => ({
        field,
        label: FIELD_LABELS[field],
        oldValue: getCurrentValue(currentData, field),
        newValue: payload[field],
        intelligence: intelligenceFor(payload, field),
      }));
  }, [currentData, payload]);
  const [selected, setSelected] = useState<Set<AutofillField>>(() => new Set(changes.map((change) => change.field)));

  if (!open || !payload) return null;

  const selectedFields = changes.filter((change) => selected.has(change.field)).map((change) => change.field);
  const lowConfidenceChanges = changes.filter((change) => change.intelligence.confidence === 'low');
  const lowConfidenceSelectedCount = changes.filter((change) => selected.has(change.field) && change.intelligence.confidence === 'low').length;

  const toggleField = (field: AutofillField) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const labelsFor = (field: AutofillField) => field === 'genres' ? genreLabels : field === 'moods' ? moodLabels : undefined;

  const shouldConfirmApply = (fields: AutofillField[]) => {
    if (fields.length === 0) return false;
    const lowCount = changes.filter((change) => fields.includes(change.field) && change.intelligence.confidence === 'low').length;
    return lowCount / fields.length > 0.5;
  };

  const requestApply = (fields: AutofillField[]) => {
    if (shouldConfirmApply(fields)) {
      setPendingApplyFields(fields);
      return;
    }
    onApply(fields);
  };

  const applyAnyway = () => {
    if (!pendingApplyFields) return;
    onApply(pendingApplyFields);
    setPendingApplyFields(null);
  };

  return (
    <ModalPortal>
      <div className="fixed left-0 top-0 z-modal flex h-[100dvh] w-[100dvw] items-center justify-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="ai-preview-title">
        <div className="relative grid max-h-[88vh] w-full max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-white/10 bg-bg-surface shadow-lg shadow-black/30">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
            <div>
              <h2 id="ai-preview-title" className="font-heading text-lg font-semibold text-text-primary">Preview AI Changes</h2>
              <p className="mt-1 font-body text-sm text-text-tertiary">Choose which generated fields should update the editor.</p>
            </div>
            <button type="button" onClick={onDiscard} className="inline-flex h-8 items-center gap-1 rounded-md px-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
              <X className="h-4 w-4" aria-hidden="true" />
              Discard
            </button>
          </div>

          <div className="overflow-y-auto p-4 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
            {changes.length === 0 ? (
              <p className="py-10 text-center font-body text-sm text-text-tertiary">No usable AI fields were returned.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {lowConfidenceChanges.length > 0 && (
                  <div className="rounded-lg border border-red-400/25 bg-red-400/10 p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
                      <div>
                        <p className="font-heading text-sm font-semibold text-text-primary">Some fields have low confidence.</p>
                        <p className="mt-1 font-body text-sm text-text-secondary">Review carefully before applying. {lowConfidenceSelectedCount} selected field{lowConfidenceSelectedCount === 1 ? '' : 's'} currently need extra verification.</p>
                      </div>
                    </div>
                  </div>
                )}
                {changes.map((change) => (
                  <label key={change.field} className="grid cursor-pointer gap-3 rounded-lg border border-white/10 bg-bg-deep/35 p-3 md:grid-cols-[24px_130px_1fr]">
                    <input
                      type="checkbox"
                      checked={selected.has(change.field)}
                      onChange={() => toggleField(change.field)}
                      className="mt-1"
                    />
                    <span className="space-y-2">
                      <span className="block font-heading text-sm text-text-primary">{change.label}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn('inline-flex h-6 items-center rounded-md border px-2 font-body text-xs', confidenceTone(change.intelligence.confidence))}>
                          {confidenceLabel(change.intelligence.confidence)}
                        </span>
                        {change.intelligence.source && (
                          <span
                            className="inline-flex h-6 items-center gap-1 rounded-md border border-white/10 px-2 font-body text-xs text-text-secondary"
                            title={`Source: ${change.intelligence.source}\n${change.intelligence.sourceNote ?? `Retrieved from ${change.intelligence.source} metadata.`}`}
                          >
                            <Info className="h-3 w-3" aria-hidden="true" />
                            {change.intelligence.source}
                          </span>
                        )}
                      </span>
                      {change.intelligence.rationale && (
                        <span className="block font-body text-xs leading-5 text-text-tertiary">{change.intelligence.rationale}</span>
                      )}
                    </span>
                    <span className="grid gap-2 md:grid-cols-2">
                      <span>
                        <span className="block font-heading text-[10px] uppercase tracking-wider text-text-tertiary">Old</span>
                        <span className="mt-1 block whitespace-pre-wrap rounded-md border border-white/10 bg-bg-surface px-3 py-2 font-body text-sm text-text-secondary">
                          {formatValue(change.oldValue, labelsFor(change.field))}
                        </span>
                      </span>
                      <span>
                        <span className="block font-heading text-[10px] uppercase tracking-wider text-text-tertiary">New</span>
                        <span className="mt-1 block whitespace-pre-wrap rounded-md border border-accent-primary/30 bg-accent-primary/10 px-3 py-2 font-body text-sm text-text-primary">
                          {formatValue(change.newValue, labelsFor(change.field))}
                        </span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 p-4">
            <button type="button" onClick={onDiscard} className="inline-flex h-9 items-center gap-2 rounded-md px-3 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
              <X className="h-4 w-4" aria-hidden="true" />
              Discard
            </button>
            <button type="button" onClick={() => requestApply(changes.map((change) => change.field))} disabled={changes.length === 0} className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 font-heading text-sm text-text-primary hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
              Apply All
            </button>
            <button type="button" onClick={() => requestApply(selectedFields)} disabled={selectedFields.length === 0} className={cn('inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90', selectedFields.length === 0 && 'cursor-not-allowed opacity-50')}>
              <Check className="h-4 w-4" aria-hidden="true" />
              Apply Selected
            </button>
          </div>

          {pendingApplyFields && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-lg border border-white/10 bg-bg-deep p-4 shadow-lg">
                <h3 className="font-heading text-lg font-semibold text-text-primary">Apply low-confidence fields?</h3>
                <p className="mt-2 font-body text-sm leading-6 text-text-secondary">This result contains several low-confidence fields. Review again or apply anyway.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setPendingApplyFields(null)} className="h-9 rounded-md px-3 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">Review Again</button>
                  <button type="button" onClick={applyAnyway} className="h-9 rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90">Apply Anyway</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
