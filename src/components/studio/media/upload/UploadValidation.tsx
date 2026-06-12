export const MEDIA_UPLOAD_MAX_SIZE = 10 * 1024 * 1024;
export const MEDIA_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export function validateMediaUpload(file: File): string | null {
  if (!MEDIA_UPLOAD_TYPES.includes(file.type)) return 'Use JPEG, PNG, WebP, AVIF, or GIF.';
  if (file.size > MEDIA_UPLOAD_MAX_SIZE) return 'File size must be 10 MB or less.';
  return null;
}

export function UploadValidation() {
  return <p className="font-body text-xs text-text-tertiary">Accepted: JPEG, PNG, WebP, AVIF, GIF. Maximum size: 10 MB.</p>;
}
