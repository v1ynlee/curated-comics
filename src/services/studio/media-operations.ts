import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { deleteR2Prefix, moveR2Prefix } from '@/lib/storage/r2-client';
import { resolveCanonicalPath } from '@/lib/storage/media-resolver';
import { logStudioActivity } from '@/services/studio/activity-log';
import { assetCanonicalKeys, validateMediaOperation, type OperationCheck } from './media-operation-validators';
import type { StudioMediaAsset } from '@/app/studio/media/types';

export type MediaOperationResult = { success: true; report: MediaConsistencyReport } | { success: false; error: string; report: MediaConsistencyReport };

export interface MediaConsistencyReport {
  operation: string;
  assetIds: string[];
  checks: OperationCheck[];
  storageChanged: boolean;
  metadataChanged: boolean;
  registryRevalidated: boolean;
  rolledBack: boolean;
}

function report(operation: string, assets: StudioMediaAsset[]): MediaConsistencyReport {
  return { operation, assetIds: assets.map((asset) => asset.id), checks: [], storageChanged: false, metadataChanged: false, registryRevalidated: false, rolledBack: false };
}

function revalidateRegistry(current: MediaConsistencyReport) {
  revalidatePath('/studio/media');
  revalidatePath('/studio/activity');
  current.registryRevalidated = true;
}

async function failOperation(current: MediaConsistencyReport, error: string, entityName?: string | null): Promise<MediaOperationResult> {
  await logStudioActivity({
    eventType: 'MEDIA_OPERATION_FAILED',
    entityType: 'media',
    entityId: current.assetIds[0] ?? null,
    entityName: entityName ?? null,
    metadata: { operation: current.operation, error, report: current },
  });
  return { success: false, error, report: current };
}

async function validateAssets(supabase: SupabaseClient, assets: StudioMediaAsset[], current: MediaConsistencyReport, options: { requireUnused?: boolean }) {
  for (const asset of assets) {
    const validation = await validateMediaOperation(supabase, asset, { requireUnused: options.requireUnused });
    current.checks.push(...validation.checks.map((check) => ({ ...check, step: `${asset.slug}:${check.step}` })));
    if (!validation.ok) return `${asset.slug}: ${validation.checks.find((check) => !check.ok)?.detail ?? 'Validation failed.'}`;
  }
  return null;
}

export async function archiveAsset(supabase: SupabaseClient, asset: StudioMediaAsset, archived: boolean): Promise<MediaOperationResult> {
  const current = report(archived ? 'archiveAsset' : 'restoreAsset', [asset]);
  const error = await validateAssets(supabase, [asset], current, { requireUnused: false });
  if (error) return failOperation(current, error, asset.slug);

  const previous = asset.archived;
  const update = await supabase.from('media_assets').update({ archived, updated_at: new Date().toISOString() }).eq('id', asset.id);
  if (update.error) return failOperation(current, update.error.message, asset.slug);
  current.metadataChanged = true;

  await logStudioActivity({ eventType: archived ? 'ASSET_ARCHIVED' : 'ASSET_RESTORED', entityType: 'media', entityId: asset.id, entityName: asset.slug, metadata: { oldValues: { archived: previous }, newValues: { archived }, report: current } });
  revalidateRegistry(current);
  return { success: true, report: current };
}

export async function bulkArchiveAssets(supabase: SupabaseClient, assets: StudioMediaAsset[]): Promise<MediaOperationResult> {
  const current = report('bulkArchiveAssets', assets);
  const error = await validateAssets(supabase, assets, current, { requireUnused: false });
  if (error) return failOperation(current, error, 'Bulk archive');

  const update = await supabase.from('media_assets').update({ archived: true, updated_at: new Date().toISOString() }).in('id', current.assetIds);
  if (update.error) return failOperation(current, update.error.message, 'Bulk archive');
  current.metadataChanged = true;

  await logStudioActivity({ eventType: 'MEDIA_BULK_ACTION_APPLIED', entityType: 'media', entityId: 'bulk-archive', entityName: 'Archive selected assets', metadata: { action: 'archive', count: assets.length, assetIds: current.assetIds, report: current } });
  revalidateRegistry(current);
  return { success: true, report: current };
}

export async function deleteAsset(supabase: SupabaseClient, asset: StudioMediaAsset): Promise<MediaOperationResult> {
  const current = report('deleteAsset', [asset]);
  const error = await validateAssets(supabase, [asset], current, { requireUnused: true });
  if (error) return failOperation(current, error, asset.slug);

  try {
    await deleteR2Prefix(asset.r2BasePath ?? assetCanonicalKeys(asset)[0]);
    current.storageChanged = true;
  } catch (storageError) {
    return failOperation(current, storageError instanceof Error ? storageError.message : 'Storage delete failed.', asset.slug);
  }

  const deletion = await supabase.from('media_assets').delete().eq('id', asset.id);
  if (deletion.error) return failOperation(current, deletion.error.message, asset.slug);
  current.metadataChanged = true;

  await logStudioActivity({ eventType: 'ASSET_DELETED', entityType: 'media', entityId: asset.id, entityName: asset.slug, metadata: { fileSizeTotal: asset.fileSizeTotal, assetType: asset.assetType, report: current } });
  revalidateRegistry(current);
  return { success: true, report: current };
}

export async function bulkDeleteAssets(supabase: SupabaseClient, assets: StudioMediaAsset[]): Promise<MediaOperationResult> {
  const current = report('bulkDeleteAssets', assets);
  const error = await validateAssets(supabase, assets, current, { requireUnused: true });
  if (error) return failOperation(current, error, 'Bulk delete');

  for (const asset of assets) {
    try {
      await deleteR2Prefix(asset.r2BasePath ?? assetCanonicalKeys(asset)[0]);
      current.storageChanged = true;
    } catch (storageError) {
      return failOperation(current, storageError instanceof Error ? storageError.message : 'Storage delete failed.', asset.slug);
    }
  }

  const deletion = await supabase.from('media_assets').delete().in('id', current.assetIds);
  if (deletion.error) return failOperation(current, deletion.error.message, 'Bulk delete');
  current.metadataChanged = true;

  await logStudioActivity({ eventType: 'MEDIA_BULK_ACTION_APPLIED', entityType: 'media', entityId: 'bulk-delete', entityName: 'Delete selected assets', metadata: { action: 'delete', count: assets.length, assetIds: current.assetIds, report: current } });
  revalidateRegistry(current);
  return { success: true, report: current };
}

export async function replaceAsset(supabase: SupabaseClient, oldAsset: StudioMediaAsset, newAsset: StudioMediaAsset): Promise<MediaOperationResult> {
  const current = report('replaceAsset', [oldAsset, newAsset]);
  const error = await validateAssets(supabase, [oldAsset, newAsset], current, { requireUnused: false });
  if (error) return failOperation(current, error, oldAsset.slug);
  const newPath = newAsset.canonicalPreviewUrl;
  if (!newPath) return failOperation(current, 'Replacement asset has no canonical preview path.', oldAsset.slug);

  for (const usage of oldAsset.usages) {
    if (usage.type === 'article') await supabase.from('articles').update({ featured_image_id: newAsset.id, updated_at: new Date().toISOString() }).eq('id', usage.id);
    if (usage.type === 'title') await supabase.from('titles').update({ cover_slug: newAsset.slug, updated_at: new Date().toISOString() }).eq('id', usage.id);
    if (usage.type === 'creator') await supabase.from('creators').update({ image: newPath, updated_at: new Date().toISOString() }).eq('id', usage.id);
    if (usage.type === 'gallery') await supabase.from('title_gallery').update({ image_url: newPath }).eq('id', usage.id);
    if (usage.type === 'character') await replaceCharacterImages(supabase, oldAsset, usage.id, newPath);
  }
  current.metadataChanged = true;

  await logStudioActivity({ eventType: 'ASSET_REPLACED', entityType: 'media', entityId: oldAsset.id, entityName: oldAsset.slug, metadata: { newValues: { assetId: newAsset.id, slug: newAsset.slug }, usageCount: oldAsset.usageCount, report: current } });
  revalidateRegistry(current);
  return { success: true, report: current };
}

async function replaceCharacterImages(supabase: SupabaseClient, oldAsset: StudioMediaAsset, characterId: string, newPath: string) {
  const oldKeys = new Set(oldAsset.variants.map((variant) => resolveCanonicalPath(variant.url)).filter(Boolean));
  const imageRows = await supabase.from('character_images').select('id, image_url').eq('character_id', characterId);
  for (const row of (imageRows.data ?? []) as { id: string; image_url: string }[]) {
    const currentPath = resolveCanonicalPath(row.image_url);
    if ((currentPath && oldKeys.has(currentPath)) || row.image_url.includes(oldAsset.slug)) await supabase.from('character_images').update({ image_url: newPath }).eq('id', row.id);
  }
}

export async function moveAsset(supabase: SupabaseClient, asset: StudioMediaAsset, destinationPrefix: string): Promise<MediaOperationResult> {
  const current = report('moveAsset', [asset]);
  const error = await validateAssets(supabase, [asset], current, { requireUnused: false });
  if (error) return failOperation(current, error, asset.slug);
  const sourcePrefix = asset.r2BasePath ?? assetCanonicalKeys(asset)[0];

  try {
    await moveR2Prefix(sourcePrefix, destinationPrefix);
    current.storageChanged = true;
  } catch (storageError) {
    return failOperation(current, storageError instanceof Error ? storageError.message : 'Storage move failed.', asset.slug);
  }

  const variants = asset.variants.map((variant) => ({ ...variant, url: (resolveCanonicalPath(variant.url) ?? variant.url).replace(sourcePrefix, destinationPrefix) }));
  const update = await supabase.from('media_assets').update({ variants, r2_base_path: destinationPrefix, r2_path: destinationPrefix, updated_at: new Date().toISOString() }).eq('id', asset.id);
  if (update.error) {
    await moveR2Prefix(destinationPrefix, sourcePrefix).catch(() => undefined);
    current.rolledBack = true;
    return failOperation(current, update.error.message, asset.slug);
  }
  current.metadataChanged = true;
  await logStudioActivity({ eventType: 'MEDIA_BULK_ACTION_APPLIED', entityType: 'media', entityId: asset.id, entityName: asset.slug, metadata: { action: 'move', destinationPrefix, report: current } });
  revalidateRegistry(current);
  return { success: true, report: current };
}

export async function bulkMoveAssets(supabase: SupabaseClient, assets: StudioMediaAsset[], destinationPrefix: string): Promise<MediaOperationResult> {
  const current = report('bulkMoveAssets', assets);
  for (const asset of assets) {
    const result = await moveAsset(supabase, asset, destinationPrefix);
    current.checks.push(...result.report.checks);
    current.storageChanged ||= result.report.storageChanged;
    current.metadataChanged ||= result.report.metadataChanged;
    current.rolledBack ||= result.report.rolledBack;
    if (!result.success) return failOperation(current, result.error, 'Bulk move');
  }
  revalidateRegistry(current);
  return { success: true, report: current };
}
