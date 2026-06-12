import { sanitizePathSegment } from './r2-paths';

export type MediaPathFormat = 'avif' | 'webp' | 'gif' | 'jpg' | 'jpeg' | 'png' | 'mp4' | 'webm' | 'mp3' | 'wav';

interface MediaPathInput {
  slug: string;
  contentHash: string;
  descriptor: string;
  format: MediaPathFormat | string;
}

function storageRoot() {
  return (process.env.R2_PREFIX || 'platforms').replace(/^\/+|\/+$/g, '') || 'platforms';
}

function objectPath(folder: string, input: MediaPathInput) {
  const safeSlug = sanitizePathSegment(input.slug);
  const safeHash = sanitizePathSegment(input.contentHash);
  const safeDescriptor = sanitizePathSegment(input.descriptor);
  const safeFormat = sanitizePathSegment(input.format);
  return `${storageRoot()}/${folder}/${safeSlug}/${safeHash}/${safeDescriptor}.${safeFormat}`;
}

function objectPrefix(folder: string, slug: string, contentHash: string) {
  return `${storageRoot()}/${folder}/${sanitizePathSegment(slug)}/${sanitizePathSegment(contentHash)}/`;
}

export function getMediaRootPrefix() {
  return `${storageRoot()}/`;
}

export function getTitleCoverPath(input: MediaPathInput) {
  return objectPath('titles/covers', input);
}

export function getGalleryImagePath(input: MediaPathInput) {
  return objectPath('titles/gallery', input);
}

export function getCharacterImagePath(input: MediaPathInput) {
  return objectPath('titles/characters', input);
}

export function getAuthorImagePath(input: MediaPathInput) {
  return objectPath('creators/authors', input);
}

export function getArtistImagePath(input: MediaPathInput) {
  return objectPath('creators/artists', input);
}

export function getStudioImagePath(input: MediaPathInput) {
  return objectPath('creators/studios', input);
}

export function getCreatorImagePath(input: MediaPathInput) {
  return objectPath('creators', input);
}

export function getArticleCoverPath(input: MediaPathInput) {
  return objectPath('articles/covers', input);
}

export function getTempAssetPath(input: MediaPathInput) {
  return objectPath('temp', input);
}

export function getMediaAssetPath(assetType: string, input: MediaPathInput) {
  if (assetType === 'cover' || assetType === 'title_cover') return getTitleCoverPath(input);
  if (assetType === 'gallery_image') return getGalleryImagePath(input);
  if (assetType === 'character_image') return getCharacterImagePath(input);
  if (assetType === 'article-image' || assetType === 'article_cover') return getArticleCoverPath(input);
  if (assetType === 'creator_image') return getCreatorImagePath(input);
  if (assetType === 'thumbnail') return getTempAssetPath(input);
  return getTempAssetPath(input);
}

export function getMediaAssetPrefix(assetType: string, slug: string, contentHash: string) {
  if (assetType === 'cover' || assetType === 'title_cover') return objectPrefix('titles/covers', slug, contentHash);
  if (assetType === 'gallery_image') return objectPrefix('titles/gallery', slug, contentHash);
  if (assetType === 'character_image') return objectPrefix('titles/characters', slug, contentHash);
  if (assetType === 'article-image' || assetType === 'article_cover') return objectPrefix('articles/covers', slug, contentHash);
  if (assetType === 'creator_image') return objectPrefix('creators', slug, contentHash);
  if (assetType === 'thumbnail') return objectPrefix('temp', slug, contentHash);
  return objectPrefix('temp', slug, contentHash);
}
