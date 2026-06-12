import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { deleteFromR2, listR2Objects } from '@/lib/storage/r2-client';
import { resolveCanonicalPath } from '@/lib/storage/media-resolver';
import { logStudioActivity } from './activity-log';
import { archiveAsset, replaceAsset, type MediaOperationResult } from './media-operations';
import type { MediaHealthIssue, StudioMediaAsset } from '@/app/studio/media/types';
import type { AssetType, MediaVariant } from '@/types/media';

export type ReconcileResult = { success: true; message: string } | { success: false; error: string };

function slugFromKey(key: string) {
  const parts = key.split('/').filter(Boolean);
  const fileSlug = parts.at(-1)?.replace(/\.[^.]+$/, '') ?? 'media-asset';
  const candidate = parts.length >= 5 ? parts.at(-3) : fileSlug;
  return candidate?.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'media-asset';
}

function typeFromKey(key: string): AssetType {
  if (key.includes('/titles/covers/')) return 'title_cover';
  if (key.includes('/titles/gallery/') || key.includes('/gallery/')) return 'gallery_image';
  if (key.includes('/characters/')) return 'character_image';
  if (key.includes('/articles/covers/')) return 'article_cover';
  if (key.includes('/creators/')) return 'creator_image';
  return 'thumbnail';
}

function hashFromKey(key: string, etag: string | null) {
  const parts = key.split('/').filter(Boolean);
  return parts.length >= 5 ? parts.at(-2) ?? 'unknown' : etag?.slice(0, 12) || 'unknown';
}

function variantFromObject(key: string, size: number): MediaVariant[] {
  const format = key.endsWith('.avif') ? 'avif' : 'webp';
  return [{ width: 0, format, url: key, size }];
}

async function logRepair(action: string, result: ReconcileResult, metadata: Record<string, unknown>) {
  await logStudioActivity({ eventType: result.success ? 'MEDIA_RECONCILED' : 'MEDIA_OPERATION_FAILED', entityType: 'media', entityName: action, metadata: { action, result, ...metadata } });
}

export async function registerMissingMetadata(supabase: SupabaseClient, objectKey: string): Promise<ReconcileResult> {
  const object = (await listR2Objects(objectKey))[0];
  if (!object) return { success: false, error: 'Storage object does not exist.' };

  const slug = slugFromKey(object.key);
  const assetType = typeFromKey(object.key);
  const contentHash = hashFromKey(object.key, object.etag);
  const { error } = await supabase.from('media_assets').upsert({
    slug,
    asset_type: assetType,
    content_hash: contentHash,
    hash: contentHash,
    mime_type: object.key.endsWith('.avif') ? 'image/avif' : 'image/webp',
    variants: variantFromObject(object.key, object.size),
    r2_base_path: object.key.slice(0, object.key.lastIndexOf('/') + 1),
    r2_path: object.key.slice(0, object.key.lastIndexOf('/') + 1),
    canonical_path: object.key,
    storage_provider: 'r2',
    file_size_total: object.size,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'slug,asset_type,content_hash' });

  const result: ReconcileResult = error ? { success: false, error: error.message } : { success: true, message: 'Metadata registered.' };
  await logRepair('register-missing-metadata', result, { objectKey });
  revalidatePath('/studio/media');
  return result;
}

export async function deleteOrphanObject(_supabase: SupabaseClient, objectKey: string): Promise<ReconcileResult> {
  try {
    await deleteFromR2(objectKey);
    const result: ReconcileResult = { success: true, message: 'Orphan object deleted.' };
    await logRepair('delete-orphan-object', result, { objectKey });
    revalidatePath('/studio/media');
    return result;
  } catch (error) {
    const result: ReconcileResult = { success: false, error: error instanceof Error ? error.message : 'Delete failed.' };
    await logRepair('delete-orphan-object', result, { objectKey });
    return result;
  }
}

export async function archiveUnusedAsset(supabase: SupabaseClient, asset: StudioMediaAsset): Promise<ReconcileResult> {
  if (asset.usageCount > 0) return { success: false, error: 'Asset is still referenced.' };
  const result = await archiveAsset(supabase, asset, true);
  return result.success ? { success: true, message: 'Unused asset archived.' } : { success: false, error: result.error };
}

export async function replaceMissingObject(supabase: SupabaseClient, missingAsset: StudioMediaAsset, replacementAsset: StudioMediaAsset): Promise<MediaOperationResult> {
  return replaceAsset(supabase, missingAsset, replacementAsset);
}

export async function relinkBrokenReference(supabase: SupabaseClient, objectKey: string, replacementAsset: StudioMediaAsset): Promise<ReconcileResult> {
  const replacement = replacementAsset.canonicalPreviewUrl;
  if (!replacement) return { success: false, error: 'Replacement asset has no canonical path.' };
  const displayPath = `/${objectKey}`;
  const references = [objectKey, displayPath].filter(Boolean);
  await Promise.all([
    supabase.from('creators').update({ image: replacement, updated_at: new Date().toISOString() }).in('image', references),
    supabase.from('title_gallery').update({ image_url: replacement }).in('image_url', references),
    supabase.from('character_images').update({ image_url: replacement }).in('image_url', references),
  ]);
  const result: ReconcileResult = { success: true, message: 'Broken reference relinked.' };
  await logRepair('relink-broken-reference', result, { objectKey, replacementAssetId: replacementAsset.id });
  revalidatePath('/studio/media');
  return result;
}

export function recommendedReconcileAction(issue: MediaHealthIssue) {
  if (issue.type === 'missing-db-metadata') return 'Register Metadata';
  if (issue.type === 'missing-r2-object') return 'Replace Missing Object';
  if (issue.type === 'broken-reference') return 'Relink Asset';
  if (issue.type === 'unused-asset') return 'Archive Asset';
  if (issue.type === 'orphan-asset') return 'Delete Orphan';
  return 'Review Issue';
}

export function firstCanonicalMatch(assets: StudioMediaAsset[], objectKey: string) {
  return assets.find((asset) => asset.slug && objectKey.includes(asset.slug)) ?? assets.find((asset) => asset.canonicalPreviewUrl && resolveCanonicalPath(asset.canonicalPreviewUrl));
}
