import type { AssetType, MediaVariant } from '@/types/media';

export type MediaProvider = 'local' | 'r2';
export type MissingMediaKind = 'title-cover' | 'character' | 'author' | 'artist' | 'studio' | 'gallery-image' | 'article-cover' | 'asset';

function mediaRoot() {
  return (process.env.R2_PREFIX || 'platforms').replace(/^\/+|\/+$/g, '') || 'platforms';
}

const MISSING_MEDIA_KEYS: Record<MissingMediaKind, string> = {
  'title-cover': 'temp/missing-title-cover.webp',
  character: 'temp/missing-character.webp',
  author: 'temp/missing-author.webp',
  artist: 'temp/missing-author.webp',
  studio: 'temp/missing-studio.webp',
  'gallery-image': 'temp/missing-gallery-image.webp',
  'article-cover': 'temp/missing-article-cover.webp',
  asset: 'temp/missing-asset.webp',
};

export function getMediaProvider(): MediaProvider {
  const configured = process.env.MEDIA_PROVIDER || process.env.NEXT_PUBLIC_MEDIA_PROVIDER;
  if (configured === 'local' || configured === 'r2') return configured;
  return process.env.NODE_ENV === 'development' ? 'local' : 'r2';
}

export function resolveStorageProvider(): MediaProvider {
  return getMediaProvider();
}

export function isLocalMediaProvider() {
  return getMediaProvider() === 'local';
}

export function getR2MediaBaseUrl() {
  return (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');
}

export function mediaKeyFromUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/')) {
    const key = trimmed.replace(/^\/+/, '');
    return key.startsWith(`${mediaRoot()}/`) ? key : null;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    const key = trimmed.replace(/^\/+/, '');
    return key.startsWith(`${mediaRoot()}/`) ? key : null;
  }

  try {
    const pathname = decodeURIComponent(new URL(trimmed).pathname).replace(/^\/+/, '');
    const rootIndex = pathname.indexOf(`${mediaRoot()}/`);
    return rootIndex >= 0 ? pathname.slice(rootIndex) : null;
  } catch {
    return null;
  }
}

export function resolveCanonicalPath(value: string | null | undefined): string | null {
  return mediaKeyFromUrl(value);
}

export function getMissingMediaUrl(kind: MissingMediaKind = 'asset') {
  const key = `${mediaRoot()}/${MISSING_MEDIA_KEYS[kind]}`;
  if (isLocalMediaProvider()) return `/${key}`;
  const baseUrl = getR2MediaBaseUrl();
  return baseUrl ? `${baseUrl}/${key}` : `/${key}`;
}

export function resolveMediaUrl(value: string | null | undefined, kind: MissingMediaKind = 'asset') {
  const key = mediaKeyFromUrl(value);
  if (!value && !key) return getMissingMediaUrl(kind);
  if (isLocalMediaProvider()) return key ? `/${key}` : getMissingMediaUrl(kind);
  if (/^https?:\/\//i.test(value ?? '')) return value as string;
  if (key) {
    const baseUrl = getR2MediaBaseUrl();
    return baseUrl ? `${baseUrl}/${key}` : `/${key}`;
  }
  return getMissingMediaUrl(kind);
}

export function resolveDisplayUrl(value: string | null | undefined, kind: MissingMediaKind = 'asset') {
  return resolveMediaUrl(value, kind);
}

export function resolveMediaVariants(variants: MediaVariant[] | null | undefined, kind: MissingMediaKind = 'asset'): MediaVariant[] {
  return (variants ?? []).map((variant) => ({ ...variant, url: resolveDisplayUrl(variant.url, kind) }));
}

export function missingKindForAssetType(assetType: AssetType | string): MissingMediaKind {
  if (assetType === 'cover' || assetType === 'title_cover') return 'title-cover';
  if (assetType === 'gallery_image') return 'gallery-image';
  if (assetType === 'character_image') return 'character';
  if (assetType === 'article-image' || assetType === 'article_cover') return 'article-cover';
  if (assetType === 'creator_image') return 'author';
  return 'asset';
}
