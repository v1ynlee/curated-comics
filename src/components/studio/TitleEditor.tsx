'use client';

// ============================================================
// TitleEditor — Full title creation/editing form for Studio CMS
// Integrates DetailsCard, MediaCard, ProgressCard, ReviewsCard,
// and SettingsCard with per-card save behavior and global save.
// DEFERRED UPLOAD: Cover image is uploaded to R2 only when the
// user confirms save — not on file selection.
// Requirements: 5.1, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2,
//               10.1-10.7, 11.1, 11.2, 12.1-12.6
// ============================================================

import { useState, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { DetailsCard } from '@/components/studio/DetailsCard';
import { ProgressCard } from '@/components/studio/ProgressCard';
import { ReviewsCard } from '@/components/studio/ReviewsCard';
import { SettingsCard } from '@/components/studio/SettingsCard';
import { AIPreviewModal } from '@/components/studio/AIPreviewModal';
import { DraftManagerModals } from '@/components/studio/DraftManagerModals';
import { ConfirmDialog } from '@/components/studio/ConfirmDialog';
import { getErrorMessage } from '@/lib/utils/toast';
import { useDraftManager } from '@/hooks/useDraftManager';
import { useGeminiAutofill } from '@/hooks/useGeminiAutofill';
import { logStudioActivityAction } from '@/app/studio/activity/actions';
import { calculateTitleFormCompletion, completionTone, type TitleFormCompletionSeed, type TitleCompletionResult } from '@/services/studio/title-completion';
import type { AutofillPayload, AutofillPayloadField, TitleFormData } from '@/types/studio';
import type { MediaAsset } from '@/types/media';

// ── Props ─────────────────────────────────────────────────────

interface TitleEditorProps {
  mode: 'create' | 'edit';
  initialData?: TitleFormData;
  onSave: (data: TitleFormData) => Promise<void>;
  genres?: { id: string; name: string }[];
  moods?: { id: string; name: string }[];
  completionSeed?: TitleFormCompletionSeed;
}

// ── Default form state ────────────────────────────────────────

function getDefaultFormData(): TitleFormData {
  return {
    englishTitle: '',
    originalTitle: '',
    alternativeTitles: [],
    origin: 'manhwa',
    seriesStatus: 'ongoing',
    readingStatus: 'reading',
    author: '',
    artist: '',
    releaseDate: '',
    chaptersRead: undefined,
    totalChapters: undefined,
    startedDate: '',
    completedDate: '',
    lastReadDate: '',
    tier: 'B',
    synopsis: '',
    vibeCheck: '',
    quotableLines: [],
    review: '',
    featured: false,
    hidden: false,
    genres: [],
    moods: [],
    coverImageId: undefined,
    bannerImageId: undefined,
  };
}

function serialize(value: unknown) {
  return JSON.stringify(value);
}

function pickDetails(data: TitleFormData) {
  return {
    englishTitle: data.englishTitle,
    originalTitle: data.originalTitle,
    alternativeTitles: data.alternativeTitles,
    origin: data.origin,
    seriesStatus: data.seriesStatus,
    readingStatus: data.readingStatus,
    author: data.author,
    artist: data.artist,
    releaseDate: data.releaseDate,
    completedDate: data.completedDate,
    synopsis: data.synopsis,
    vibeCheck: data.vibeCheck,
    genres: data.genres,
    moods: data.moods,
    coverImageId: data.coverImageId,
    bannerImageId: data.bannerImageId,
  };
}

function pickProgress(data: TitleFormData) {
  return {
    chaptersRead: data.chaptersRead,
    totalChapters: data.totalChapters,
    startedDate: data.startedDate,
    completedDate: data.completedDate,
    lastReadDate: data.lastReadDate,
  };
}

function pickReviews(data: TitleFormData) {
  return { review: data.review, reviewHtml: data.reviewHtml, isUnreviewed: data.isUnreviewed };
}

function pickSettings(data: TitleFormData) {
  return { featured: data.featured, hidden: data.hidden };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim()).map((value) => value.trim())));
}

function pickAutofillValues(data: TitleFormData | AutofillPayload, fields: AutofillPayloadField[]) {
  return Object.fromEntries(fields.map((field) => [field, data[field as keyof typeof data] ?? null]));
}

function pickAutofillIntelligence(payload: AutofillPayload, fields: AutofillPayloadField[]) {
  return Object.fromEntries(fields.map((field) => [field, payload.fieldIntelligence?.[field] ?? null]));
}

function payloadFields(payload: AutofillPayload): AutofillPayloadField[] {
  const fields: AutofillPayloadField[] = [
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
  return fields.filter((field) => {
    const value = payload[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim().length > 0;
  });
}

function CompletionBreakdown({ completion }: { completion: TitleCompletionResult }) {
  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4" aria-label="Title completion">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-text-primary">Completion</h2>
          <p className="mt-1 font-body text-sm text-text-secondary">{completion.status}</p>
        </div>
        <span className={cn('inline-flex self-start rounded-md border px-3 py-1.5 font-data text-sm', completionTone(completion.score))}>
          {completion.score}%
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {completion.breakdown.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-bg-deep/35 px-3 py-2">
            <span className="font-body text-xs text-text-secondary">{item.label}</span>
            <span className={cn('font-body text-xs', item.complete ? 'text-emerald-300' : 'text-red-300')}>
              {item.complete ? '✓' : '✗'} {item.points}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Component ─────────────────────────────────────────────────

export function TitleEditor({
  mode,
  initialData,
  onSave,
  genres = [],
  moods = [],
  completionSeed = {},
}: TitleEditorProps) {
  const [formData, setFormData] = useState<TitleFormData>(
    initialData ?? getDefaultFormData()
  );
  const [savedFormData, setSavedFormData] = useState<TitleFormData>(initialData ?? getDefaultFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [aiPreviewPayload, setAiPreviewPayload] = useState<AutofillPayload | null>(null);
  const unsavedToastShown = useRef(false);

  // ── Deferred upload state ─────────────────────────────────

  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const detailsValid = formData.englishTitle.trim().length > 0;
  const progressValid = (formData.chaptersRead ?? 0) >= 0
    && (formData.totalChapters ?? 0) >= 0
    && (formData.totalChapters === undefined || formData.chaptersRead === undefined || formData.chaptersRead <= formData.totalChapters);
  const reviewsValid = true;
  const settingsValid = true;

  const detailsDirty = serialize(pickDetails(formData)) !== serialize(pickDetails(savedFormData)) || Boolean(pendingCoverFile);
  const progressDirty = serialize(pickProgress(formData)) !== serialize(pickProgress(savedFormData));
  const reviewsDirty = serialize(pickReviews(formData)) !== serialize(pickReviews(savedFormData));
  const settingsDirty = serialize(pickSettings(formData)) !== serialize(pickSettings(savedFormData));
  const isDirty = serialize(formData) !== serialize(savedFormData) || Boolean(pendingCoverFile);
  const completion = useMemo(() => calculateTitleFormCompletion(formData, completionSeed), [completionSeed, formData]);

  // ── Slug for image uploader (derived from english title) ──

  const slug = useMemo(() => {
    return formData.englishTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled';
  }, [formData.englishTitle]);

  // ── Cover preview URL (blob for pending, or existing cover path) ──

  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const markUnsaved = useCallback(() => {
    if (unsavedToastShown.current) return;
    unsavedToastShown.current = true;
    toast.info('Unsaved changes detected.');
  }, []);

  const applyAutofillPayload = useCallback((payload: AutofillPayload, fields?: AutofillPayloadField[]) => {
    const shouldApply = (field: AutofillPayloadField) => !fields || fields.includes(field);
    const genreIds = payload.genres
      ?.map((name) => genres.find((genre) => genre.name.toLowerCase() === name.toLowerCase())?.id)
      .filter((id): id is string => Boolean(id));
    const moodIds = payload.moods
      ?.map((name) => moods.find((mood) => mood.name.toLowerCase() === name.toLowerCase())?.id)
      .filter((id): id is string => Boolean(id));

    setFormData((prev) => ({
      ...prev,
      englishTitle: shouldApply('englishTitle') ? payload.englishTitle ?? prev.englishTitle : prev.englishTitle,
      originalTitle: shouldApply('originalTitle') ? payload.originalTitle ?? prev.originalTitle : prev.originalTitle,
      alternativeTitles: shouldApply('alternativeTitles') ? unique([...(payload.alternativeTitles ?? []), ...(prev.alternativeTitles ?? [])]) : prev.alternativeTitles,
      origin: shouldApply('origin') ? payload.origin ?? prev.origin : prev.origin,
      seriesStatus: shouldApply('seriesStatus') ? payload.seriesStatus ?? prev.seriesStatus : prev.seriesStatus,
      readingStatus: shouldApply('readingStatus') ? payload.readingStatus ?? prev.readingStatus : prev.readingStatus,
      author: shouldApply('author') ? payload.author ?? prev.author : prev.author,
      artist: shouldApply('artist') ? payload.artist ?? prev.artist : prev.artist,
      releaseDate: shouldApply('releaseDate') ? payload.releaseDate ?? prev.releaseDate : prev.releaseDate,
      completedDate: shouldApply('completedDate') ? payload.completedDate ?? prev.completedDate : prev.completedDate,
      synopsis: shouldApply('synopsis') ? payload.synopsis ?? prev.synopsis : prev.synopsis,
      vibeCheck: shouldApply('vibeCheck') ? payload.vibeCheck ?? prev.vibeCheck : prev.vibeCheck,
      genres: shouldApply('genres') && genreIds?.length ? unique([...prev.genres, ...genreIds]) : prev.genres,
      moods: shouldApply('moods') && moodIds?.length ? unique([...prev.moods, ...moodIds]) : prev.moods,
    }));
    markUnsaved();
  }, [genres, markUnsaved, moods]);

  const { state: aiState, runAutofill } = useGeminiAutofill(setAiPreviewPayload);
  const draftManager = useDraftManager({
    type: 'title',
    key: mode === 'create' ? 'new' : slug,
    title: formData.englishTitle || 'Untitled title',
    preview: formData.synopsis || formData.vibeCheck || '',
    data: formData,
    isDirty,
    onRestore: setFormData,
  });

  const handleCoverFileSelectWithPreview = useCallback((file: File | null) => {
    // Revoke previous blob URL
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setCoverPreviewUrl(blobUrl);
    } else {
      setCoverPreviewUrl(null);
    }
    setPendingCoverFile(file);
    if (file) {
      markUnsaved();
      toast.info('Cover image queued.');
    }
  }, [coverPreviewUrl, markUnsaved]);

  // Derive preview src: pending blob > existing cover image path
  const previewSrc = useMemo(() => {
    if (coverPreviewUrl) return coverPreviewUrl;
    // If there's an existing cover, use the public path
    if (formData.coverImageId || slug !== 'untitled') {
      return `/images/covers/${slug}-640w.webp`;
    }
    return null;
  }, [coverPreviewUrl, formData.coverImageId, slug]);

  // ── Field update helpers ──────────────────────────────────

  const updateField = useCallback(<K extends keyof TitleFormData>(
    key: K,
    value: TitleFormData[K]
  ) => {
    markUnsaved();
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, [markUnsaved]);

  // ── Genre/mood toggle ─────────────────────────────────────

  const toggleGenre = useCallback((genreId: string) => {
    const genreName = genres.find((genre) => genre.id === genreId)?.name ?? 'Genre';
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
    markUnsaved();
    toast.info(formData.genres.includes(genreId) ? `${genreName} removed.` : `${genreName} added.`);
  }, [formData.genres, genres, markUnsaved]);

  const toggleMood = useCallback((moodId: string) => {
    const moodName = moods.find((mood) => mood.id === moodId)?.name ?? 'Mood';
    setFormData((prev) => ({
      ...prev,
      moods: prev.moods.includes(moodId)
        ? prev.moods.filter((id) => id !== moodId)
        : [...prev.moods, moodId],
    }));
    markUnsaved();
    toast.info(formData.moods.includes(moodId) ? `${moodName} removed.` : `${moodName} added.`);
  }, [formData.moods, markUnsaved, moods]);

  // ── Image upload complete (after actual R2 upload) ────────

  const handleCoverUpload = useCallback((asset: MediaAsset) => {
    updateField('coverImageId', asset.id);
    setPendingCoverFile(null);
    toast.success('Cover image uploaded.');
  }, [updateField]);

  const validateTitle = useCallback(() => {
    if (formData.englishTitle.trim()) return true;
    toast.warning('Add an English title before saving.');
    return false;
  }, [formData.englishTitle]);

  const saveSection = useCallback(async (section: string) => {
    if (!validateTitle()) return;
    try {
      await onSave(formData);
      setSavedFormData(formData);
      draftManager.markClean();
      unsavedToastShown.current = false;
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw error;
      }
      throw new Error(`${section} save failed.`);
    }
  }, [draftManager, formData, onSave, validateTitle]);

  const restoreDetails = useCallback(() => {
    setFormData((prev) => ({ ...prev, ...pickDetails(savedFormData) }));
    setPendingCoverFile(null);
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(null);
  }, [coverPreviewUrl, savedFormData]);

  const restoreProgress = useCallback(() => {
    setFormData((prev) => ({ ...prev, ...pickProgress(savedFormData) }));
  }, [savedFormData]);

  const restoreReviews = useCallback(() => {
    setFormData((prev) => ({ ...prev, ...pickReviews(savedFormData) }));
  }, [savedFormData]);

  const restoreSettings = useCallback(() => {
    setFormData((prev) => ({ ...prev, ...pickSettings(savedFormData) }));
  }, [savedFormData]);

  // ── Upload pending cover image to R2 ──────────────────────

  const uploadPendingCoverImage = useCallback(async (): Promise<string | null> => {
    if (!pendingCoverFile) return null;

    const formDataUpload = new FormData();
    formDataUpload.append('file', pendingCoverFile);
    formDataUpload.append('slug', slug);
    formDataUpload.append('assetType', 'cover');

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || 'Cover image upload failed');
    }

    const data = await response.json();
    const asset = data.asset as MediaAsset;
    return asset.id;
  }, [pendingCoverFile, slug]);

  // ── Form submission ───────────────────────────────────────

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Save title requested.');
    if (!validateTitle()) return;
    setShowConfirmDialog(true);
  }, [validateTitle]);

  const handleConfirmSave = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    const toastId = toast.loading(pendingCoverFile ? 'Uploading cover...' : 'Saving title...');

    try {
      let finalFormData = { ...formData };

      // Step 1: Upload pending cover image if any
      if (pendingCoverFile) {
        setIsUploading(true);
        try {
          const coverImageId = await uploadPendingCoverImage();
          if (coverImageId) {
            finalFormData = { ...finalFormData, coverImageId };
            // Update local state so it persists after save
            setFormData((prev) => ({ ...prev, coverImageId }));
            setPendingCoverFile(null);
          }
        } catch (uploadErr) {
          const message = uploadErr instanceof Error
            ? uploadErr.message
            : 'Cover image upload failed';
          setSubmitError(`Upload error: ${message}`);
          toast.error(message, { id: toastId });
          setShowConfirmDialog(false);
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Step 2: Save the title form data
      toast.loading('Saving title...', { id: toastId });
      await onSave(finalFormData);
      setSavedFormData(finalFormData);
      draftManager.markClean();
      toast.success(mode === 'create' ? 'Title created.' : 'Title updated.', { id: toastId });
      unsavedToastShown.current = false;
      setShowConfirmDialog(false);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to save title. Please try again.');
      toast.error(message, { id: toastId });
      setSubmitError(message);
      setShowConfirmDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [draftManager, formData, mode, onSave, pendingCoverFile, uploadPendingCoverImage]);

  const handleApplyAIChanges = useCallback((fields: AutofillPayloadField[]) => {
    if (!aiPreviewPayload) return;
    const oldValues = pickAutofillValues(formData, fields);
    const newValues = pickAutofillValues(aiPreviewPayload, fields);
    const confidenceLevels = pickAutofillIntelligence(aiPreviewPayload, fields);
    applyAutofillPayload(aiPreviewPayload, fields);
    setAiPreviewPayload(null);
    void logStudioActivityAction({
      eventType: 'AI_AUTOFILL_APPLIED',
      entityType: 'ai',
      entityId: mode === 'create' ? 'title:new' : `title:${slug}`,
      entityName: formData.englishTitle || aiPreviewPayload.englishTitle || 'Untitled title',
      metadata: {
        oldValues,
        newValues,
        confidenceLevels,
        appliedFields: fields,
        appliedAt: new Date().toISOString(),
        changedFields: fields,
      },
    }).catch((error) => console.error('AI activity logging failed:', error));
    toast.success('Applied successfully.');
  }, [aiPreviewPayload, applyAutofillPayload, formData, mode, slug]);

  const handleDiscardAIChanges = useCallback(() => {
    if (aiPreviewPayload) {
      const fields = payloadFields(aiPreviewPayload);
      void logStudioActivityAction({
        eventType: 'AI_AUTOFILL_REJECTED',
        entityType: 'ai',
        entityId: mode === 'create' ? 'title:new' : `title:${slug}`,
        entityName: formData.englishTitle || aiPreviewPayload.englishTitle || 'Untitled title',
        metadata: {
          newValues: pickAutofillValues(aiPreviewPayload, fields),
          confidenceLevels: pickAutofillIntelligence(aiPreviewPayload, fields),
          rejectedFields: fields,
          rejectedAt: new Date().toISOString(),
          changedFields: fields,
        },
      }).catch((error) => console.error('AI activity logging failed:', error));
    }
    setAiPreviewPayload(null);
  }, [aiPreviewPayload, formData.englishTitle, mode, slug]);

  const genreLabels = useMemo(() => Object.fromEntries(genres.map((genre) => [genre.id, genre.name])), [genres]);
  const moodLabels = useMemo(() => Object.fromEntries(moods.map((mood) => [mood.id, mood.name])), [moods]);

  const handleCancelDialog = useCallback(() => {
    if (!isSubmitting) {
      setShowConfirmDialog(false);
    }
  }, [isSubmitting]);

  // ── Render ────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <CompletionBreakdown completion={completion} />

      {/* ═══════════════════════════════════════════════════════
          Section: Details (with integrated cover image upload)
          ═══════════════════════════════════════════════════════ */}
      <DetailsCard
        formData={formData}
        onFieldChange={updateField}
        onSave={() => saveSection('Details')}
        genres={genres}
        moods={moods}
        onToggleGenre={toggleGenre}
        onToggleMood={toggleMood}
        slug={slug}
        coverImageId={formData.coverImageId}
        pendingCoverFile={pendingCoverFile}
        previewSrc={previewSrc}
        onCoverFileSelect={handleCoverFileSelectWithPreview}
        onCoverUpload={handleCoverUpload}
        onFillWithAI={() => runAutofill(formData.englishTitle)}
        aiState={aiState}
        isDirty={detailsDirty}
        isValid={detailsValid}
        onCancel={restoreDetails}
      />

      {/* ═══════════════════════════════════════════════════════
          Section: Progress
          ═══════════════════════════════════════════════════════ */}
      <ProgressCard
        chaptersRead={formData.chaptersRead}
        totalChapters={formData.totalChapters}
        startedDate={formData.startedDate ?? ''}
        completedDate={formData.completedDate ?? ''}
        lastReadDate={formData.lastReadDate ?? ''}
        onChaptersReadChange={(value) => updateField('chaptersRead', value)}
        onTotalChaptersChange={(value) => updateField('totalChapters', value)}
        onStartedDateChange={(value) => updateField('startedDate', value)}
        onCompletedDateChange={(value) => updateField('completedDate', value)}
        onLastReadDateChange={(value) => updateField('lastReadDate', value)}
        onSave={() => saveSection('Progress')}
        onCancel={restoreProgress}
        isDirty={progressDirty}
        isValid={progressValid}
      />

      {/* ═══════════════════════════════════════════════════════
          Section: Review (RichTextEditor with Editor/Preview tabs)
          ═══════════════════════════════════════════════════════ */}
      <ReviewsCard
        review={formData.review ?? ''}
        reviewHtml={formData.reviewHtml ?? ''}
        isUnreviewed={formData.isUnreviewed ?? false}
        onReviewChange={(content) => updateField('review', content)}
        onReviewHtmlChange={(html) => updateField('reviewHtml', html)}
        onUnreviewedChange={(checked) => updateField('isUnreviewed', checked)}
        onSave={() => saveSection('Review')}
        onCancel={restoreReviews}
        isDirty={reviewsDirty}
        isValid={reviewsValid}
      />

      {/* ═══════════════════════════════════════════════════════
          Section: Settings (AnimatedCheckbox + CardWrapper)
          ═══════════════════════════════════════════════════════ */}
      <SettingsCard
        featured={formData.featured}
        hidden={formData.hidden}
        onFeaturedChange={(checked) => updateField('featured', checked)}
        onHiddenChange={(checked) => updateField('hidden', checked)}
        onSave={() => saveSection('Settings')}
        onCancel={restoreSettings}
        isDirty={settingsDirty}
        isValid={settingsValid}
      />

      {/* ═══════════════════════════════════════════════════════
          Global Save Title Button (Req 12.5, 12.6)
          ═══════════════════════════════════════════════════════ */}
      {submitError && (
        <div
          className="p-3 rounded-md bg-semantic-danger/10 border border-semantic-danger/20"
          role="alert"
        >
          <p className="text-semantic-danger text-sm font-medium">{submitError}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !detailsValid}
          aria-disabled={isSubmitting || !detailsValid}
          className={cn(
            'px-6 py-3 rounded-lg',
            'bg-accent-primary text-white font-heading text-sm font-bold',
            'hover:bg-accent-primary/90 transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isUploading
            ? 'Uploading image...'
            : isSubmitting
              ? 'Saving...'
              : 'Save Title'}
        </button>

        {isSubmitting && (
          <span className="text-text-tertiary text-xs animate-pulse">
            {isUploading ? 'Uploading cover image…' : 'Processing...'}
          </span>
        )}

        {pendingCoverFile && !isSubmitting && (
          <span className="text-accent-primary text-xs">
            Cover image will upload on save
          </span>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Save Title"
        message={
          pendingCoverFile
            ? 'Are you sure you want to save? The cover image will be uploaded first.'
            : 'Are you sure you want to save this title?'
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelDialog}
        loading={isSubmitting}
      />

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

      {aiPreviewPayload && (
        <AIPreviewModal
          open
          currentData={formData}
          payload={aiPreviewPayload}
          genreLabels={genreLabels}
          moodLabels={moodLabels}
          onApply={handleApplyAIChanges}
          onDiscard={handleDiscardAIChanges}
        />
      )}
    </form>
  );
}
