'use client';

// ============================================================
// ImageUploader — drag-and-drop image upload with preview
// Calls /api/admin/upload-image for Sharp processing.
// ============================================================

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ImageUploaderProps {
  slug: string;
  currentSlug?: string;
  onUpload: (result: { slug: string; dominantColor: string; blurDataURL: string }) => void;
  className?: string;
}

export function ImageUploader({ slug, currentSlug, onUpload, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', slug);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Upload failed');
      }

      const result = await res.json();
      onUpload(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        disabled={isUploading}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'w-full h-40 rounded-sm border-2 border-dashed',
          'transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
          isDragging
            ? 'border-accent-primary bg-accent-primary/10'
            : 'border-white/20 bg-surface-elevated/30 hover:border-white/30 hover:bg-surface-elevated/50',
          isUploading && 'opacity-60 cursor-not-allowed',
        )}
        aria-label="Upload cover image"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Cover preview"
            className="absolute inset-0 w-full h-full object-cover rounded-sm opacity-40"
          />
        ) : currentSlug ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/covers/${currentSlug}-320w.avif`}
            alt="Current cover"
            className="absolute inset-0 w-full h-full object-cover rounded-sm opacity-30"
          />
        ) : null}

        <div className="relative z-10 flex flex-col items-center gap-1 text-center">
          {isUploading ? (
            <>
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" aria-hidden="true" />
              <span className="font-body text-xs text-text-secondary">Processing…</span>
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="font-body text-xs text-text-secondary">
                {preview || currentSlug ? 'Replace image' : 'Drop image or click to upload'}
              </span>
              <span className="font-body text-[10px] text-text-tertiary">
                AVIF, WebP, JPEG, PNG · Max 5MB
              </span>
            </>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && (
        <p role="alert" className="font-body text-xs text-semantic-danger">
          {error}
        </p>
      )}
    </div>
  );
}
