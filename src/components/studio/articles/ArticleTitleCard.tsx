'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { StudioField } from '@/components/studio/shared/StudioField';

interface ArticleTitleCardProps {
  title: string;
  subtitle?: string;
  thumbnailPreviewUrl: string | null | undefined;
  dominantColor?: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  allowedImageTypes: string[];
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string | undefined) => void;
  onFileChange: (file: File) => void;
  onRemoveThumbnail: () => void;
}

export function ArticleTitleCard({
  title,
  subtitle,
  thumbnailPreviewUrl,
  dominantColor,
  fileInputRef,
  allowedImageTypes,
  onTitleChange,
  onSubtitleChange,
  onFileChange,
  onRemoveThumbnail,
}: ArticleTitleCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4 md:p-5">
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedImageTypes.join(',')}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileChange(file);
          event.target.value = '';
        }}
      />

      <div className="grid gap-4 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start">
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative aspect-[16/10] w-full overflow-hidden rounded-md border border-white/10 bg-bg-deep/70 text-left transition-colors duration-150 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
            style={{ backgroundColor: dominantColor ?? undefined }}
          >
            {thumbnailPreviewUrl ? (
              <Image
                src={thumbnailPreviewUrl}
                alt="Article thumbnail preview"
                fill
                sizes="(max-width: 768px) 100vw, 272px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full flex-col items-center justify-center gap-2 text-text-tertiary">
                <Upload size={18} aria-hidden="true" />
                <span className="text-xs">Upload thumbnail</span>
              </span>
            )}
          </button>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="studio-secondary-button">
              {thumbnailPreviewUrl ? 'Replace' : 'Choose image'}
            </button>
            {thumbnailPreviewUrl && (
              <button type="button" onClick={onRemoveThumbnail} className="studio-secondary-button text-semantic-danger hover:text-semantic-danger">
                Remove
              </button>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-text-tertiary">JPEG, PNG, WebP, AVIF, or GIF. Maximum 10 MB.</p>
        </div>

        <div className="min-w-0 max-w-2xl space-y-4">
          <StudioField label="Title" htmlFor="article-title" required>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Article title"
              className="studio-input text-lg font-medium md:text-xl"
            />
          </StudioField>

          <StudioField label="Subtitle" htmlFor="article-subtitle">
            <input
              id="article-subtitle"
              type="text"
              value={subtitle ?? ''}
              onChange={(event) => onSubtitleChange(event.target.value || undefined)}
              placeholder="Optional supporting line"
              className="studio-input"
            />
          </StudioField>
        </div>
      </div>
    </section>
  );
}
