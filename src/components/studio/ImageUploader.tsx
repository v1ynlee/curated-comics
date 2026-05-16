'use client';

// ============================================================
// ImageUploader — Drag-and-drop image upload component for Studio CMS
// Supports drag-and-drop, click-to-browse, progress indication,
// preview display, and user-friendly error messages.
// DEFERRED UPLOAD: Files are stored locally as blob URLs for preview.
// Actual upload to R2 only happens when the parent triggers save.
// Requirements: 8.4, 18.5
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { AssetType, MediaAsset } from '@/types/media';

// ── Constants ─────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const FRIENDLY_MIME_LIST = 'JPEG, PNG, WebP, AVIF, or GIF';

// ── Props ─────────────────────────────────────────────────────

interface ImageUploaderProps {
  slug: string;
  assetType: AssetType;
  /** Called when a file is selected/dropped (deferred upload pattern) */
  onFileSelect?: (file: File) => void;
  /** Called after actual upload completes (backward compat / triggered externally) */
  onUploadComplete?: (asset: MediaAsset) => void;
  currentImage?: MediaAsset;
  /** Pending file controlled by parent (allows parent to clear pending state) */
  pendingFile?: File | null;
}

// ── Upload State ──────────────────────────────────────────────

type UploadStatus = 'idle' | 'validating' | 'pending' | 'uploading' | 'success' | 'error';

interface UploadError {
  message: string;
  guidance: string;
}

// ── Component ─────────────────────────────────────────────────

export function ImageUploader({
  slug,
  assetType,
  onFileSelect,
  onUploadComplete,
  currentImage,
  pendingFile,
}: ImageUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>(
    currentImage ? 'success' : 'idle'
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);
  const [uploadedAsset, setUploadedAsset] = useState<MediaAsset | null>(
    currentImage ?? null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // ── Clean up blob URL on unmount or when replaced ─────────

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ── Sync with parent-controlled pendingFile prop ──────────

  useEffect(() => {
    if (pendingFile === null && status === 'pending') {
      // Parent cleared the pending file (e.g., after successful upload)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      // Don't reset to idle if we have an uploaded asset (success state set externally)
      if (!uploadedAsset) {
        setStatus('idle');
      }
    }
  }, [pendingFile, status, previewUrl, uploadedAsset]);

  // ── Client-side validation ────────────────────────────────

  const validateFile = useCallback((file: File): UploadError | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        message: `Unsupported file type: ${file.type || 'unknown'}`,
        guidance: `Try a ${FRIENDLY_MIME_LIST} file instead.`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        message: `File too large (${sizeMB} MB)`,
        guidance: 'Try a smaller file — maximum size is 10 MB.',
      };
    }

    return null;
  }, []);

  // ── File selection handler (deferred — no upload) ─────────

  const handleFileSelect = useCallback(
    (file: File) => {
      // Reset state
      setError(null);
      setStatus('validating');

      // Client-side validation
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setStatus('error');
        return;
      }

      // Revoke previous blob URL if any
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create local preview via blob URL — NO upload to R2
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setStatus('pending');

      // Notify parent of the pending file
      onFileSelect?.(file);
    },
    [validateFile, onFileSelect, previewUrl]
  );

  // ── Drag event handlers ───────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the drop zone (not entering a child)
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // ── File input handler ────────────────────────────────────

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ── Replace image handler ─────────────────────────────────

  const handleReplace = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setStatus('idle');
    setUploadedAsset(null);
    setError(null);
  }, [previewUrl]);

  // ── Public method: mark upload as complete (called by parent) ──

  /** Call this to transition from pending → success after external upload */
  const markUploadComplete = useCallback((asset: MediaAsset) => {
    setUploadedAsset(asset);
    setStatus('success');
    onUploadComplete?.(asset);
    // Clean up blob URL since we now have the real asset
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [onUploadComplete, previewUrl]);

  // Expose markUploadComplete — parent can call via onUploadComplete callback
  // when it finishes the actual upload during save
  void markUploadComplete; // referenced via parent pattern

  // ── Get preview source ────────────────────────────────────

  const getPreviewSrc = (): string | null => {
    if (previewUrl) return previewUrl;
    if (uploadedAsset) {
      // Use the largest webp variant for preview
      const webpVariants = uploadedAsset.variants
        .filter((v) => v.format === 'webp')
        .sort((a, b) => b.width - a.width);
      return webpVariants[0]?.url ?? null;
    }
    return null;
  };

  // ── Animation variants ────────────────────────────────────

  const motionConfig = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileChange}
        className="sr-only"
        aria-label={`Upload ${assetType} image for ${slug}`}
      />

      <AnimatePresence mode="wait">
        {/* ── Success state: show uploaded asset preview ── */}
        {status === 'success' && (uploadedAsset || currentImage) && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={motionConfig}
            className="relative rounded-lg overflow-hidden border border-surface-elevated bg-bg-surface"
          >
            {/* Preview image */}
            <div className="relative aspect-[3/4] w-full">
              {getPreviewSrc() ? (
                <Image
                  src={getPreviewSrc()!}
                  alt={`${assetType} preview for ${slug}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor:
                      uploadedAsset?.dominantColor ?? currentImage?.dominantColor ?? '#1a1a2e',
                  }}
                />
              )}
            </div>

            {/* Replace button overlay */}
            <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-bg-deep/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-normal">
              <button
                type="button"
                onClick={handleReplace}
                className="px-4 py-2 rounded-md bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/80 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-deep"
              >
                Replace image
              </button>
            </div>

            {/* Asset info badge */}
            {uploadedAsset && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-bg-deep/80 text-text-secondary text-xs backdrop-blur-sm">
                {uploadedAsset.originalWidth}×{uploadedAsset.originalHeight}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Pending state: show blob URL preview with "pending" badge ── */}
        {status === 'pending' && previewUrl && (
          <motion.div
            key="pending-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={motionConfig}
            className="relative rounded-lg overflow-hidden border border-accent-primary/30 bg-bg-surface"
          >
            {/* Preview image from blob URL */}
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={previewUrl}
                alt={`${assetType} preview for ${slug} (pending upload)`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 400px"
                unoptimized
              />
            </div>

            {/* Pending badge */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-accent-primary/80 text-white text-xs font-medium backdrop-blur-sm">
              Pending upload
            </div>

            {/* Replace button overlay */}
            <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-bg-deep/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-normal">
              <button
                type="button"
                onClick={handleReplace}
                className="px-4 py-2 rounded-md bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/80 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-deep"
              >
                Replace image
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Uploading state: progress indicator ── */}
        {status === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionConfig}
            className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg border border-accent-primary/30 bg-bg-surface"
            role="status"
            aria-label="Uploading image"
          >
            {/* Preview thumbnail during upload */}
            {previewUrl && (
              <div className="relative w-20 h-20 rounded-md overflow-hidden opacity-60">
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </div>
            )}

            {/* Animated spinner */}
            <div className="relative w-10 h-10">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-accent-primary/20"
                aria-hidden="true"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-primary"
                animate={{ rotate: 360 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                aria-hidden="true"
              />
            </div>

            <p className="text-text-secondary text-sm">
              Processing image…
            </p>
          </motion.div>
        )}

        {/* ── Validating state ── */}
        {status === 'validating' && (
          <motion.div
            key="validating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionConfig}
            className="flex items-center justify-center gap-3 p-8 rounded-lg border border-surface-elevated bg-bg-surface"
            role="status"
            aria-label="Validating file"
          >
            <div className="w-4 h-4 rounded-full bg-accent-primary animate-pulse" aria-hidden="true" />
            <p className="text-text-secondary text-sm">Validating…</p>
          </motion.div>
        )}

        {/* ── Idle / Error state: drop zone ── */}
        {(status === 'idle' || status === 'error') && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionConfig}
          >
            <button
              type="button"
              onClick={handleClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              aria-label={`Drop or click to upload ${assetType} image`}
              className={cn(
                'w-full flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-deep',
                isDragOver
                  ? 'border-accent-primary bg-accent-primary/10 scale-[1.02]'
                  : 'border-surface-elevated bg-bg-surface hover:border-text-tertiary hover:bg-bg-surface/80',
                status === 'error' && 'border-semantic-danger/50'
              )}
            >
              {/* Upload icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                  isDragOver
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'bg-surface-elevated text-text-tertiary'
                )}
                aria-hidden="true"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              {/* Instructions */}
              <div className="text-center">
                <p className="text-text-primary text-sm font-medium">
                  {isDragOver ? 'Drop to upload' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-text-tertiary text-xs mt-1">
                  {FRIENDLY_MIME_LIST} • Max 10 MB
                </p>
              </div>
            </button>

            {/* Error message */}
            <AnimatePresence>
              {status === 'error' && error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={motionConfig}
                  className="mt-3 p-3 rounded-md bg-semantic-danger/10 border border-semantic-danger/20"
                  role="alert"
                >
                  <p className="text-semantic-danger text-sm font-medium">
                    {error.message}
                  </p>
                  <p className="text-text-secondary text-xs mt-1">
                    {error.guidance}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
