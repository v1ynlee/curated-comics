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

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { MediaCard } from '@/components/studio/MediaCard';
import { DetailsCard } from '@/components/studio/DetailsCard';
import { ProgressCard } from '@/components/studio/ProgressCard';
import { ReviewsCard } from '@/components/studio/ReviewsCard';
import { SettingsCard } from '@/components/studio/SettingsCard';
import { ConfirmDialog } from '@/components/studio/ConfirmDialog';
import type { TitleFormData } from '@/types/studio';
import type { MediaAsset } from '@/types/media';

// ── Props ─────────────────────────────────────────────────────

interface TitleEditorProps {
  mode: 'create' | 'edit';
  initialData?: TitleFormData;
  onSave: (data: TitleFormData) => Promise<void>;
  genres?: { id: string; name: string }[];
  moods?: { id: string; name: string }[];
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

// ── Component ─────────────────────────────────────────────────

export function TitleEditor({
  mode,
  initialData,
  onSave,
  genres = [],
  moods = [],
}: TitleEditorProps) {
  const [formData, setFormData] = useState<TitleFormData>(
    initialData ?? getDefaultFormData()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // ── Deferred upload state ─────────────────────────────────

  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ── Slug for image uploader (derived from english title) ──

  const slug = useMemo(() => {
    return formData.englishTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled';
  }, [formData.englishTitle]);

  // ── Field update helpers ──────────────────────────────────

  const updateField = useCallback(<K extends keyof TitleFormData>(
    key: K,
    value: TitleFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Genre/mood toggle ─────────────────────────────────────

  const toggleGenre = useCallback((genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  }, []);

  const toggleMood = useCallback((moodId: string) => {
    setFormData((prev) => ({
      ...prev,
      moods: prev.moods.includes(moodId)
        ? prev.moods.filter((id) => id !== moodId)
        : [...prev.moods, moodId],
    }));
  }, []);

  // ── Image file selection (deferred — no upload yet) ───────

  const handleCoverFileSelect = useCallback((file: File | null) => {
    setPendingCoverFile(file);
  }, []);

  // ── Image upload complete (after actual R2 upload) ────────

  const handleCoverUpload = useCallback((asset: MediaAsset) => {
    updateField('coverImageId', asset.id);
    setPendingCoverFile(null);
  }, [updateField]);

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
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);

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
          setShowConfirmDialog(false);
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Step 2: Save the title form data
      await onSave(finalFormData);
      setShowConfirmDialog(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save title. Please try again.'
      );
      setShowConfirmDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, pendingCoverFile, uploadPendingCoverImage]);

  const handleCancelDialog = useCallback(() => {
    if (!isSubmitting) {
      setShowConfirmDialog(false);
    }
  }, [isSubmitting]);

  // ── Render ────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* ═══════════════════════════════════════════════════════
          Section: Details (formerly "Basic Info" + "Classification")
          ═══════════════════════════════════════════════════════ */}
      <DetailsCard
        formData={formData}
        onFieldChange={updateField}
        onSave={async () => { await onSave(formData); }}
        genres={genres}
        moods={moods}
        onToggleGenre={toggleGenre}
        onToggleMood={toggleMood}
      />

      {/* ═══════════════════════════════════════════════════════
          Section: Media (unified cover/banner)
          ═══════════════════════════════════════════════════════ */}
      <MediaCard
        slug={slug}
        coverImageId={formData.coverImageId}
        onCoverFileSelect={handleCoverFileSelect}
        onCoverUpload={handleCoverUpload}
        onSave={async () => { await onSave(formData); }}
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
        onSave={async () => { await onSave(formData); }}
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
        onSave={async () => { await onSave(formData); }}
      />

      {/* ═══════════════════════════════════════════════════════
          Section: Settings (AnimatedCheckbox + CardWrapper)
          ═══════════════════════════════════════════════════════ */}
      <SettingsCard
        featured={formData.featured}
        hidden={formData.hidden}
        onFeaturedChange={(checked) => updateField('featured', checked)}
        onHiddenChange={(checked) => updateField('hidden', checked)}
        onSave={async () => { await onSave(formData); }}
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
          disabled={isSubmitting || !formData.englishTitle.trim()}
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
    </form>
  );
}
