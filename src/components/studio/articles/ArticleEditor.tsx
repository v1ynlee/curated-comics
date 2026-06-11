'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DraftManagerModals } from '@/components/studio/DraftManagerModals';
import { ArticleTiptapEditor } from '@/components/studio/editor/ArticleTiptapEditor';
import { countWords, createExcerpt } from '@/components/studio/editor/markdown';
import { useDraftManager } from '@/hooks/useDraftManager';
import { toSlug } from '@/lib/utils/utils';
import { getErrorMessage } from '@/lib/utils/toast';
import { canUseEditorialState, EDITORIAL_STATE_LABELS, validateArticleWorkflow } from '@/services/studio/article-workflow';
import type { ArticleFormData, EditorialState, PublicationState } from '@/types/article';
import { ArticleAdvancedPanel } from './ArticleAdvancedPanel';
import { ArticleMetadataPanel } from './ArticleMetadataPanel';
import { ArticlePublishingPanel } from './ArticlePublishingPanel';
import { ArticleTitleCard } from './ArticleTitleCard';
import { ArticleWorkflowPanel } from './ArticleWorkflowPanel';
import { ALLOWED_IMAGE_TYPES, DEFAULT_FORM_DATA, MAX_IMAGE_SIZE } from './article-editor-constants';
import type { ArticleEditorProps, CategoryOption, TagOption } from './article-editor-types';

export function ArticleEditor({
  mode,
  initialData,
  initialFeaturedImage,
  articleSlug,
  saveAction,
  createCategoryAction,
  createTagAction,
  categories = [],
  tags = [],
}: ArticleEditorProps) {
  const [formData, setFormData] = useState<ArticleFormData>(initialData ?? DEFAULT_FORM_DATA);
  const [savedFormData, setSavedFormData] = useState<ArticleFormData>(initialData ?? DEFAULT_FORM_DATA);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(categories);
  const [tagOptions, setTagOptions] = useState<TagOption[]>(tags);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null);
  const [thumbnailObjectUrl, setThumbnailObjectUrl] = useState<string | null>(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback(
    <K extends keyof ArticleFormData>(field: K, value: ArticleFormData[K]) => {
      setFormData((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl);
    };
  }, [thumbnailObjectUrl]);

  const wordCount = useMemo(() => countWords(formData.body), [formData.body]);
  const generatedExcerpt = useMemo(() => createExcerpt(formData.body), [formData.body]);
  const readingTimeMinutes = wordCount === 0 ? 0 : Math.ceil(wordCount / 200);
  const thumbnailPreviewUrl = thumbnailObjectUrl || (!thumbnailRemoved ? initialFeaturedImage?.url : null);
  const workflowValidation = useMemo(() => validateArticleWorkflow({
    ...formData,
    excerpt: generatedExcerpt || formData.excerpt,
    wordCount,
    readingTimeMinutes,
    hasFeaturedImage: Boolean(thumbnailPreviewUrl || pendingThumbnailFile),
  }), [formData, generatedExcerpt, pendingThumbnailFile, readingTimeMinutes, thumbnailPreviewUrl, wordCount]);
  const canSave = Boolean(formData.title.trim() && formData.body.trim()) && !isSubmitting;
  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedFormData) || Boolean(pendingThumbnailFile) || thumbnailRemoved;
  const draftManager = useDraftManager({
    type: 'article',
    key: mode === 'create' ? 'new' : articleSlug ?? 'unknown',
    title: formData.title || 'Untitled article',
    preview: formData.excerpt || generatedExcerpt || formData.body.slice(0, 180),
    data: formData,
    isDirty,
    onRestore: (data) => {
      setFormData(data);
      setPendingThumbnailFile(null);
      setThumbnailRemoved(false);
      if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl);
      setThumbnailObjectUrl(null);
    },
  });

  const toggleTag = useCallback((tagId: string) => {
    const tagName = tagOptions.find((tag) => tag.id === tagId)?.name ?? 'Tag';
    const selected = formData.tagIds.includes(tagId);
    setFormData((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId],
    }));
    toast.info(selected ? `#${tagName} removed.` : `#${tagName} added.`);
  }, [formData.tagIds, tagOptions]);

  const changeCategory = useCallback((categoryId: string | undefined) => {
    updateField('categoryId', categoryId);
    if (!categoryId) {
      toast.info('Category removed.');
      return;
    }
    const categoryName = categoryOptions.find((category) => category.id === categoryId)?.name ?? 'Category';
    toast.info(`${categoryName} selected.`);
  }, [categoryOptions, updateField]);

  const handleThumbnailFile = useCallback((file: File) => {
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const message = 'Use a JPEG, PNG, WebP, AVIF, or GIF thumbnail.';
      setError(message);
      toast.warning(message);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      const message = 'Thumbnail file is too large. Maximum size is 10 MB.';
      setError(message);
      toast.warning(message);
      return;
    }

    setPendingThumbnailFile(file);
    setThumbnailRemoved(false);
    if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl);
    setThumbnailObjectUrl(URL.createObjectURL(file));
    toast.info('Thumbnail selected.', { description: 'It will upload when you save.' });
  }, [thumbnailObjectUrl]);

  const removeThumbnail = useCallback(() => {
    if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl);
    setThumbnailObjectUrl(null);
    setPendingThumbnailFile(null);
    setThumbnailRemoved(true);
    updateField('featuredImageId', undefined);
    toast.info('Thumbnail removed.');
  }, [thumbnailObjectUrl, updateField]);

  const uploadPendingThumbnail = useCallback(async () => {
    if (!pendingThumbnailFile) return formData.featuredImageId;

    const uploadSlug = toSlug(formData.title) || articleSlug || 'article-thumbnail';
    const uploadData = new FormData();
    uploadData.append('file', pendingThumbnailFile);
    uploadData.append('slug', uploadSlug);
    uploadData.append('assetType', 'article-image');

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: uploadData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(typeof data?.error === 'string' ? data.error : 'Thumbnail upload failed.');
    }

    const data = await response.json() as { asset?: { id?: string } };
    if (!data.asset?.id) throw new Error('Thumbnail upload did not return a media asset.');
    return data.asset.id;
  }, [articleSlug, formData.featuredImageId, formData.title, pendingThumbnailFile]);

  const changeEditorialState = useCallback((value: EditorialState) => {
    if (!canUseEditorialState(value, workflowValidation)) {
      const missing = workflowValidation.failedChecks.map((check) => check.label).join(', ');
      toast.warning(`${EDITORIAL_STATE_LABELS[value]} is blocked.`, { description: missing });
      return;
    }
    updateField('editorialState', value);
    toast.info(`${EDITORIAL_STATE_LABELS[value]} selected.`);
  }, [updateField, workflowValidation]);

  const handleSave = useCallback(async (publicationState?: PublicationState) => {
    setError(null);

    const targetState = publicationState ?? formData.publicationState;
    const targetEditorialState: EditorialState = targetState === 'published'
      ? 'published'
      : targetState === 'scheduled'
        ? 'scheduled'
        : formData.editorialState;
    if (!formData.title.trim()) {
      const message = 'Add a title before saving.';
      setError(message);
      toast.warning(message);
      return;
    }
    if (!formData.body.trim()) {
      const message = 'Add article body content before saving.';
      setError(message);
      toast.warning(message);
      return;
    }
    if (targetState === 'scheduled' && !formData.scheduledDate) {
      const message = 'Choose a scheduled date first.';
      setError(message);
      toast.warning(message);
      return;
    }
    if (!canUseEditorialState(targetEditorialState, workflowValidation)) {
      const missing = workflowValidation.failedChecks.map((check) => check.label).join(', ');
      const message = `${EDITORIAL_STATE_LABELS[targetEditorialState]} is blocked until the review checklist passes.`;
      setError(message);
      toast.warning(message, { description: missing });
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading(
      pendingThumbnailFile
        ? 'Uploading thumbnail...'
        : targetState === 'published'
          ? 'Publishing article...'
          : targetState === 'scheduled'
            ? 'Scheduling article...'
            : 'Saving draft...',
    );

    try {
      let featuredImageId = thumbnailRemoved ? undefined : formData.featuredImageId;

      if (pendingThumbnailFile) {
        setIsUploading(true);
        featuredImageId = await uploadPendingThumbnail();
        toast.loading('Saving article...', { id: toastId });
      }

      const savedData: ArticleFormData = {
        ...formData,
        excerpt: generatedExcerpt || undefined,
        featuredImageId,
        publicationState: targetState,
        editorialState: targetEditorialState,
      };

      await saveAction(savedData);
      setFormData(savedData);
      setSavedFormData(savedData);
      setPendingThumbnailFile(null);
      setThumbnailRemoved(false);
      draftManager.markClean();
      toast.success(
        targetState === 'published'
          ? 'Article published.'
          : targetState === 'scheduled'
            ? 'Article scheduled.'
            : 'Draft saved.',
        { id: toastId },
      );
    } catch (submitError) {
      const message = getErrorMessage(submitError, 'Failed to save article.');
      setError(message);
      toast.error(message, { id: toastId });
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }, [draftManager, formData, generatedExcerpt, pendingThumbnailFile, saveAction, thumbnailRemoved, uploadPendingThumbnail, workflowValidation]);

  const handleCreateCategory = useCallback(async () => {
    if (!createCategoryAction) return;
    if (!newCategoryName.trim()) {
      toast.warning('Enter a category name first.');
      return;
    }
    setError(null);
    const toastId = toast.loading('Creating category...');

    try {
      const category = await createCategoryAction(newCategoryName.trim());
      setCategoryOptions((current) => current.some((item) => item.id === category.id) ? current : [...current, category]);
      updateField('categoryId', category.id);
      setNewCategoryName('');
      toast.success('Category added.', { id: toastId });
    } catch (categoryError) {
      const message = getErrorMessage(categoryError, 'Failed to create category.');
      setError(message);
      toast.error(message, { id: toastId });
    }
  }, [createCategoryAction, newCategoryName, updateField]);

  const handleCreateTag = useCallback(async () => {
    if (!createTagAction) return;
    if (!newTagName.trim()) {
      toast.warning('Enter a tag name first.');
      return;
    }
    setError(null);
    const toastId = toast.loading('Creating tag...');

    try {
      const tag = await createTagAction(newTagName.trim());
      setTagOptions((current) => current.some((item) => item.id === tag.id) ? current : [...current, tag]);
      setFormData((current) => ({
        ...current,
        tagIds: current.tagIds.includes(tag.id) ? current.tagIds : [...current.tagIds, tag.id],
      }));
      setNewTagName('');
      toast.success('Tag added.', { id: toastId });
    } catch (tagError) {
      const message = getErrorMessage(tagError, 'Failed to create tag.');
      setError(message);
      toast.error(message, { id: toastId });
    }
  }, [createTagAction, newTagName]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        {error && (
          <div className="rounded-lg border border-semantic-danger/30 bg-semantic-danger/10 px-4 py-3 text-sm text-semantic-danger" role="alert">
            {error}
          </div>
        )}

        <ArticleTitleCard
          title={formData.title}
          subtitle={formData.subtitle}
          thumbnailPreviewUrl={thumbnailPreviewUrl}
          dominantColor={initialFeaturedImage?.dominantColor}
          fileInputRef={fileInputRef}
          allowedImageTypes={ALLOWED_IMAGE_TYPES}
          onTitleChange={(value) => updateField('title', value)}
          onSubtitleChange={(value) => updateField('subtitle', value)}
          onFileChange={handleThumbnailFile}
          onRemoveThumbnail={removeThumbnail}
        />

        <ArticleTiptapEditor
          initialBody={initialData?.body ?? ''}
          wordCount={wordCount}
          readingTimeMinutes={readingTimeMinutes}
          onBodyChange={(value) => updateField('body', value)}
        />

        <ArticlePublishingPanel
          mode={mode}
          publicationState={formData.publicationState}
          scheduledDate={formData.scheduledDate}
          canSave={canSave}
          isSubmitting={isSubmitting}
          isUploading={isUploading}
          onPublicationStateChange={(value) => updateField('publicationState', value)}
          onScheduledDateChange={(value) => updateField('scheduledDate', value)}
          onSave={handleSave}
        />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ArticleMetadataPanel
          categoryId={formData.categoryId}
          categories={categoryOptions}
          newCategoryName={newCategoryName}
          canCreateCategory={Boolean(createCategoryAction)}
          tags={tagOptions}
          selectedTagIds={formData.tagIds}
          newTagName={newTagName}
          canCreateTag={Boolean(createTagAction)}
          onCategoryChange={changeCategory}
          onNewCategoryNameChange={setNewCategoryName}
          onCreateCategory={handleCreateCategory}
          onToggleTag={toggleTag}
          onNewTagNameChange={setNewTagName}
          onCreateTag={handleCreateTag}
        />

        <ArticleWorkflowPanel
          editorialState={formData.editorialState}
          validation={workflowValidation}
          onEditorialStateChange={changeEditorialState}
        />

        <ArticleAdvancedPanel
          title={formData.title}
          excerpt={generatedExcerpt}
          seoTitle={formData.seoTitle}
          seoDescription={formData.seoDescription}
          wordCount={wordCount}
          readingTimeMinutes={readingTimeMinutes}
          tagCount={formData.tagIds.length}
          onSeoTitleChange={(value) => updateField('seoTitle', value)}
          onSeoDescriptionChange={(value) => updateField('seoDescription', value)}
        />
      </aside>

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
  );
}
