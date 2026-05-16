'use client';

// ============================================================
// MediaCard — Cover image upload with live preview and unified banner
// Positions cover upload in top-left, shows live preview,
// removes separate banner upload, and derives banner from cover
// at a different aspect ratio (wider crop).
// DEFERRED UPLOAD: Stores pending File locally; actual upload
// happens when parent triggers save.
// Requirements: 7.1, 7.2, 7.3, 7.4
// ============================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CardWrapper } from '@/components/studio/CardWrapper';
import { ImageUploader } from '@/components/studio/ImageUploader';
import type { MediaAsset } from '@/types/media';

// ── Props ─────────────────────────────────────────────────────

interface MediaCardProps {
  slug: string;
  coverImageId?: string;
  currentCoverImage?: MediaAsset;
  /** Called when a file is selected (deferred — file not yet uploaded) */
  onCoverFileSelect?: (file: File | null) => void;
  /** Called when upload completes (backward compat) */
  onCoverUpload: (asset: MediaAsset) => void;
  onSave: () => Promise<void>;
  disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────

export function MediaCard({
  slug,
  coverImageId,
  currentCoverImage,
  onCoverFileSelect,
  onCoverUpload,
  onSave,
  disabled = false,
}: MediaCardProps) {
  const [uploadedAsset, setUploadedAsset] = useState<MediaAsset | null>(
    currentCoverImage ?? null
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  // ── Clean up blob URL on unmount ──────────────────────────

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    };
  }, [pendingPreviewUrl]);

  // ── Handle file selection (deferred upload) ───────────────

  const handleFileSelect = useCallback(
    (file: File) => {
      // Revoke previous blob URL
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }

      setPendingFile(file);
      const blobUrl = URL.createObjectURL(file);
      setPendingPreviewUrl(blobUrl);

      // Notify parent about the pending file
      onCoverFileSelect?.(file);
    },
    [onCoverFileSelect, pendingPreviewUrl]
  );

  // ── Handle upload complete (called by parent after save) ──

  const handleUploadComplete = useCallback(
    (asset: MediaAsset) => {
      setUploadedAsset(asset);
      setPendingFile(null);
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
        setPendingPreviewUrl(null);
      }
      onCoverUpload(asset);
    },
    [onCoverUpload, pendingPreviewUrl]
  );

  // ── Get preview source from asset or pending blob ─────────

  const previewSrc = useMemo(() => {
    // Pending blob URL takes priority (user just selected a file)
    if (pendingPreviewUrl) return pendingPreviewUrl;
    if (!uploadedAsset) return null;
    // Use the largest webp variant for preview
    const webpVariants = uploadedAsset.variants
      .filter((v) => v.format === 'webp')
      .sort((a, b) => b.width - a.width);
    return webpVariants[0]?.url ?? null;
  }, [uploadedAsset, pendingPreviewUrl]);

  // ── Render ────────────────────────────────────────────────

  return (
    <CardWrapper
      title="Media"
      icon={<ImageIcon className="w-4 h-4" />}
      onSave={onSave}
      disabled={disabled}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Cover Image Upload — positioned in top-left area */}
        <div className="flex flex-col gap-3">
          <span className="block font-heading text-xs uppercase tracking-wider text-text-secondary">
            Cover Image
          </span>
          <ImageUploader
            slug={slug}
            assetType="cover"
            onFileSelect={handleFileSelect}
            onUploadComplete={handleUploadComplete}
            currentImage={currentCoverImage}
            pendingFile={pendingFile}
          />
          {coverImageId && (
            <p className="text-text-tertiary text-xs">
              ID: {coverImageId}
            </p>
          )}
          {pendingFile && !coverImageId && (
            <p className="text-accent-primary text-xs">
              Image selected — will upload on save
            </p>
          )}
        </div>

        {/* Live Preview — shows cover as banner at wider aspect ratio */}
        <div className="flex flex-col gap-3">
          <span className="block font-heading text-xs uppercase tracking-wider text-text-secondary">
            Banner Preview
          </span>
          <p className="text-text-tertiary text-xs mb-2">
            The cover image is used as the banner at a wider aspect ratio.
          </p>

          {previewSrc ? (
            <div
              className={cn(
                'relative w-full rounded-lg overflow-hidden border border-white/10',
                'bg-bg-deep/60',
              )}
              style={{ aspectRatio: '16 / 6' }}
            >
              <Image
                src={previewSrc}
                alt={`Banner preview for ${slug}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 500px"
                unoptimized={!!pendingPreviewUrl}
              />
              {/* Aspect ratio label */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-bg-deep/80 text-text-secondary text-xs backdrop-blur-sm">
                16:6 banner crop
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'flex items-center justify-center rounded-lg border-2 border-dashed',
                'border-white/10 bg-bg-deep/40 text-text-tertiary',
              )}
              style={{ aspectRatio: '16 / 6' }}
            >
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-xs">
                  Upload a cover image to see the banner preview
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
