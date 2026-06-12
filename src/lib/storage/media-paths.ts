import { sanitizePathSegment } from './r2-paths';
import type { AssetType } from '@/types/media';

export type MediaPathFormat = 'avif' | 'webp' | 'gif' | 'jpg' | 'jpeg' | 'png' | 'mp4' | 'webm' | 'mp3' | 'wav';
export type UploadDestination = 'title-cover' | 'gallery' | 'character' | 'creator-author' | 'creator-artist' | 'creator-studio' | 'article-cover' | 'temporary';

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

const DESTINATIONS: Record<UploadDestination, { label: string; folder: string; assetType: AssetType; entityType: string }> = {
  'title-cover': { label: 'Title Cover', folder: 'titles/covers', assetType: 'title_cover', entityType: 'title' },
  gallery: { label: 'Gallery', folder: 'titles/gallery', assetType: 'gallery_image', entityType: 'gallery' },
  character: { label: 'Character', folder: 'characters', assetType: 'character_image', entityType: 'character' },
  'creator-author': { label: 'Creator Author', folder: 'creators/authors', assetType: 'creator_image', entityType: 'creator' },
  'creator-artist': { label: 'Creator Artist', folder: 'creators/artists', assetType: 'creator_image', entityType: 'creator' },
  'creator-studio': { label: 'Creator Studio', folder: 'creators/studios', assetType: 'creator_image', entityType: 'creator' },
  'article-cover': { label: 'Article Cover', folder: 'articles/covers', assetType: 'article_cover', entityType: 'article' },
  temporary: { label: 'Temporary Asset', folder: 'temp', assetType: 'thumbnail', entityType: 'media' },
};

export const UPLOAD_DESTINATION_OPTIONS = (Object.keys(DESTINATIONS) as UploadDestination[]).map((value) => ({ value, label: DESTINATIONS[value].label }));

export function getUploadDestination(destination: UploadDestination) {
  return DESTINATIONS[destination] ?? DESTINATIONS.temporary;
}

export function getUploadFolder(destination: UploadDestination) {
  return `${storageRoot()}/${getUploadDestination(destination).folder}/`;
}

export function getUploadMetadata(destination: UploadDestination) {
  const metadata = getUploadDestination(destination);
  return { ...metadata, destination, folder: getUploadFolder(destination), provider: 'r2' as const };
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
  return objectPath('characters', input);
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

export function getUploadAssetPath(destination: UploadDestination, input: MediaPathInput) {
  return objectPath(getUploadDestination(destination).folder, input);
}

export function getUploadAssetPrefix(destination: UploadDestination, slug: string, contentHash: string) {
  return objectPrefix(getUploadDestination(destination).folder, slug, contentHash);
}

export function getMediaAssetPrefix(assetType: string, slug: string, contentHash: string) {
  if (assetType === 'cover' || assetType === 'title_cover') return objectPrefix('titles/covers', slug, contentHash);
  if (assetType === 'gallery_image') return objectPrefix('titles/gallery', slug, contentHash);
  if (assetType === 'character_image') return objectPrefix('characters', slug, contentHash);
  if (assetType === 'article-image' || assetType === 'article_cover') return objectPrefix('articles/covers', slug, contentHash);
  if (assetType === 'creator_image') return objectPrefix('creators', slug, contentHash);
  if (assetType === 'thumbnail') return objectPrefix('temp', slug, contentHash);
  return objectPrefix('temp', slug, contentHash);
}
