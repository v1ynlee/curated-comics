'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Check, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { DraftManagerModals } from '@/components/studio/DraftManagerModals';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { cn } from '@/lib/utils/cn';
import { getErrorMessage, toast } from '@/lib/utils/toast';
import { toSlug } from '@/lib/utils/utils';
import { useDraftManager } from '@/hooks/useDraftManager';
import type { CreatorFormInput, CreatorTitleOption, StudioCreator, StudioCreatorType } from '@/app/studio/creators/types';

interface CreatorModalProps {
  mode: 'create' | 'edit';
  type: StudioCreatorType;
  creator?: StudioCreator | undefined;
  titles: CreatorTitleOption[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (input: CreatorFormInput) => void;
}

interface UploadedMediaAsset {
  variants?: { url: string; width: number; format: 'avif' | 'webp' }[];
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';
}

function typeLabel(type: StudioCreatorType) {
  return type[0].toUpperCase() + type.slice(1);
}

export function CreatorModal({ mode, type, creator, titles, submitting = false, onClose, onSubmit }: CreatorModalProps) {
  const [name, setName] = useState(creator?.name ?? '');
  const [description, setDescription] = useState(creator?.description ?? '');
  const [image, setImage] = useState(creator?.image ?? '');
  const [website, setWebsite] = useState(creator?.website ?? '');
  const [selectedTitleIds, setSelectedTitleIds] = useState<string[]>(creator?.related_title_ids ?? []);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftData: CreatorFormInput = {
    name,
    type,
    description: description.trim() || null,
    image: image.trim() || null,
    website: website.trim() || null,
    related_title_ids: selectedTitleIds,
  };

  const selectedSet = useMemo(() => new Set(selectedTitleIds), [selectedTitleIds]);
  const visibleTitles = titles
    .filter((item) => item.title_english.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 40);
  const selectedTitles = selectedTitleIds
    .map((id) => titles.find((item) => item.id === id))
    .filter(Boolean) as CreatorTitleOption[];

  const nameError = submitted && !name.trim() ? 'Name is required.' : submitted && name.trim().length > 120 ? 'Use 120 characters or fewer.' : '';
  const previewSource = previewUrl ?? image.trim();
  const initialDraftData: CreatorFormInput = {
    name: creator?.name ?? '',
    type,
    description: creator?.description ?? null,
    image: creator?.image ?? null,
    website: creator?.website ?? null,
    related_title_ids: creator?.related_title_ids ?? [],
  };
  const isDirty = JSON.stringify(draftData) !== JSON.stringify(initialDraftData) || Boolean(selectedImageFile);
  const draftManager = useDraftManager({
    type: 'creator',
    key: mode === 'create' ? `new-${type}` : creator?.id ?? `new-${type}`,
    title: name || `Untitled ${type}`,
    preview: description,
    data: draftData,
    isDirty,
    onRestore: (data) => {
      setName(data.name);
      setDescription(data.description ?? '');
      setImage(data.image ?? '');
      setWebsite(data.website ?? '');
      setSelectedTitleIds(data.related_title_ids);
      setSelectedImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleTitle = (id: string) => {
    setSelectedTitleIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectImageFile = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.warning('Unsupported image type.', { description: 'Use JPEG, PNG, WebP, AVIF, or GIF.' });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.warning('Image is too large.', { description: 'Maximum file size is 10 MB.' });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImageFile(null);
    setPreviewUrl(null);
    setImage('');
  };

  const uploadSelectedImage = async (creatorName: string) => {
    if (!selectedImageFile) return image.trim() || null;

    const uploadData = new FormData();
    uploadData.append('file', selectedImageFile);
    uploadData.append('slug', `creator-${type}-${toSlug(creatorName) || 'portrait'}-${Date.now()}`);
    uploadData.append('assetType', 'thumbnail');

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: uploadData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || 'Creator image upload failed.');
    }

    const data = await response.json() as { asset?: UploadedMediaAsset };
    const variants = data.asset?.variants ?? [];
    return variants.find((variant) => variant.format === 'webp')?.url ?? variants[0]?.url ?? null;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const nextName = name.trim();
    if (!nextName || nextName.length > 120) return;

    const toastId = selectedImageFile ? toast.loading('Uploading creator image...') : null;
    setUploadingImage(true);
    try {
      const uploadedImage = await uploadSelectedImage(nextName);
      if (toastId) toast.success('Creator image uploaded.', { id: toastId });
      onSubmit({
        name: nextName,
        type,
        description: description.trim() || null,
        image: uploadedImage,
        website: website.trim() || null,
        related_title_ids: selectedTitleIds,
      });
      draftManager.markClean();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Creator image upload failed.'), toastId ? { id: toastId } : undefined);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed left-0 top-0 z-modal flex h-[100dvh] w-[100dvw] items-center justify-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="creator-modal-title">
      <form onSubmit={submit} className="grid max-h-[88vh] w-full max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-white/10 bg-bg-surface shadow-lg shadow-black/30">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <h3 id="creator-modal-title" className="font-heading text-lg font-semibold text-text-primary">
              {mode === 'create' ? `New ${typeLabel(type)}` : `Edit ${typeLabel(type)}`}
            </h3>
            <p className="mt-1 font-body text-sm text-text-tertiary">Manage profile details and related titles.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-8 items-center gap-1 rounded-md px-2 font-body text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
        </div>

        <div className="overflow-y-auto p-4 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-md border border-white/10 bg-bg-deep/35 p-3">
                <span className="relative flex h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-bg-surface" aria-hidden="true">
                  {previewSource ? <Image src={previewSource} alt="" fill sizes="56px" className="object-cover" /> : <span className="flex h-full w-full items-center justify-center font-heading text-sm text-text-secondary">{getInitials(name)}</span>}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-medium text-text-primary">{name.trim() || `Untitled ${type}`}</p>
                  <p className="font-data text-xs capitalize text-text-tertiary">{selectedImageFile ? selectedImageFile.name : type}</p>
                </div>
              </div>

              <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} className={cn('h-10 rounded-md border bg-bg-deep/50 px-3 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60', nameError ? 'border-red-400/70' : 'border-white/10')} placeholder={`${typeLabel(type)} name`} />
                {nameError && <span className="font-body text-xs text-red-300">{nameError}</span>}
              </label>

              <div className="flex flex-col gap-2 font-body text-sm text-text-secondary">
                Creator Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) selectImageFile(file);
                    event.target.value = '';
                  }}
                />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 font-heading text-xs text-text-primary hover:bg-white/5">
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    Upload Image
                  </button>
                  {previewSource && (
                    <button type="button" onClick={clearImage} className="inline-flex h-9 items-center gap-2 rounded-md px-3 font-body text-xs text-text-tertiary hover:bg-white/5 hover:text-text-primary">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  )}
                </div>
                <span className="font-body text-xs text-text-tertiary">JPEG, PNG, WebP, AVIF, or GIF. Max 10 MB.</span>
              </div>

              <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
                Website
                <input value={website} onChange={(event) => setWebsite(event.target.value)} className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60" placeholder="https://" />
              </label>

              <label className="flex flex-col gap-1.5 font-body text-sm text-text-secondary">
                Description
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="resize-none rounded-md border border-white/10 bg-bg-deep/50 px-3 py-2 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60" placeholder="Short profile note" />
              </label>
            </div>

            <div className="flex min-h-0 flex-col gap-3">
              <div className="rounded-md border border-white/10 bg-bg-deep/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-body text-sm font-medium text-text-primary">Related Titles</p>
                  <span className="font-data text-xs text-text-tertiary">{selectedTitleIds.length}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTitles.length === 0 && <p className="font-body text-sm text-text-tertiary">No related titles selected.</p>}
                  {selectedTitles.map((item) => (
                    <button key={item.id} type="button" onClick={() => toggleTitle(item.id)} className="rounded-md border border-white/10 px-2 py-1 font-body text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary">
                      {item.title_english}
                    </button>
                  ))}
                </div>
              </div>

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles" className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-primary/60" />
              </label>

              <div className="max-h-[48vh] overflow-y-auto pr-1 studio-dropdown-scroll" data-lenis-prevent data-lenis-prevent-wheel data-lenis-prevent-touch>
                <div className="flex flex-col gap-1.5">
                  {visibleTitles.map((item) => {
                    const selected = selectedSet.has(item.id);
                    return (
                      <div key={item.id} className={cn('grid grid-cols-[1fr_36px] items-center gap-3 rounded-md border px-3 py-2', selected ? 'border-accent-primary/50 bg-accent-primary/10' : 'border-white/10 bg-bg-deep/35')}>
                        <span className="truncate font-body text-sm text-text-primary">{item.title_english}</span>
                        <button type="button" onClick={() => toggleTitle(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-text-secondary transition-colors hover:border-white/20 hover:bg-white/5 hover:text-text-primary" aria-label={selected ? `Remove ${item.title_english}` : `Add ${item.title_english}`}>
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
          <button type="submit" disabled={submitting || uploadingImage} className="inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90 disabled:cursor-wait disabled:opacity-70">
            {mode === 'create' ? <Plus className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
            {uploadingImage ? 'Uploading...' : mode === 'create' ? `New ${typeLabel(type)}` : 'Save Creator'}
          </button>
        </div>
      </form>
    </div>
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
    </ModalPortal>
  );
}
