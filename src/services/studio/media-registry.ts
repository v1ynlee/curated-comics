import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteR2Prefix, getR2PublicUrl, listR2Objects } from '@/lib/storage/r2-client';
import { getMediaAssetPrefix, getMediaRootPrefix } from '@/lib/storage/media-paths';
import type { MediaHealthIssue, MediaStorageObject, StorageExplorerFolder, StudioMediaAsset } from '@/app/studio/media/types';
import type { AssetType, MediaVariant } from '@/types/media';

export interface RegisterUploadedAssetInput {
  slug: string;
  assetType: AssetType;
  contentHash: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
  mimeType: string;
  dominantColor: string;
  blurDataUri: string;
  variants: MediaVariant[];
  r2BasePath: string;
  fileSizeTotal: number;
}

const EXPLORER_FOLDERS = [
  { id: 'titles', name: 'titles', prefix: 'titles/' },
  { id: 'creators', name: 'creators', prefix: 'creators/' },
  { id: 'articles', name: 'articles', prefix: 'articles/' },
  { id: 'temp', name: 'temp', prefix: 'temp/' },
];

function publicUrlKey(url: string | null | undefined) {
  if (!url) return null;
  const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
  if (baseUrl && url.startsWith(`${baseUrl}/`)) return decodeURIComponent(url.slice(baseUrl.length + 1));
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ''));
  } catch {
    return null;
  }
}

function assetObjectKeys(asset: StudioMediaAsset) {
  const keys = new Set<string>();
  for (const variant of asset.variants) {
    const key = publicUrlKey(variant.url);
    if (key) keys.add(key);
  }
  return keys;
}

export async function listMediaStorageObjects() {
  return listR2Objects(getMediaRootPrefix());
}

export function buildMediaStorageSnapshot(assets: StudioMediaAsset[], referencedUrls: string[], r2Objects: Awaited<ReturnType<typeof listR2Objects>>) {
  const objectKeySet = new Set(r2Objects.map((object) => object.key));
  const referencedKeys = new Set(referencedUrls.map(publicUrlKey).filter((key): key is string => Boolean(key)));
  const assetByObjectKey = new Map<string, StudioMediaAsset>();

  for (const asset of assets) {
    for (const key of assetObjectKeys(asset)) assetByObjectKey.set(key, asset);
  }

  const storageObjects: MediaStorageObject[] = r2Objects.map((object) => {
    const asset = assetByObjectKey.get(object.key) ?? null;
    return {
      key: object.key,
      url: getR2PublicUrl(object.key),
      size: object.size,
      lastModified: object.lastModified,
      etag: object.etag,
      matchedAssetId: asset?.id ?? null,
      usageCount: asset?.usageCount ?? 0,
    };
  });

  const rootPrefix = getMediaRootPrefix();
  const folders: StorageExplorerFolder[] = EXPLORER_FOLDERS.map((folder) => {
    const prefix = `${rootPrefix}${folder.prefix}`;
    const objects = storageObjects.filter((object) => object.key.startsWith(prefix));
    const sorted = [...objects].sort((a, b) => new Date(b.lastModified ?? 0).getTime() - new Date(a.lastModified ?? 0).getTime());
    return {
      id: folder.id,
      name: folder.name,
      prefix,
      fileCount: objects.length,
      totalSize: objects.reduce((sum, object) => sum + object.size, 0),
      lastUploadedAsset: sorted[0] ?? null,
      orphanAssetCount: objects.filter((object) => !object.matchedAssetId).length,
      unusedAssetCount: objects.filter((object) => object.matchedAssetId && object.usageCount === 0).length,
    };
  });

  const healthIssues: MediaHealthIssue[] = [];
  const now = new Date().toISOString();
  for (const object of storageObjects) {
    if (!object.matchedAssetId) {
      healthIssues.push({
        id: `missing-db-metadata:${object.key}`,
        type: 'missing-db-metadata',
        severity: 'warning',
        title: 'Missing database metadata',
        detail: object.key,
        assetId: null,
        objectKey: object.key,
        updatedAt: object.lastModified ?? now,
      });
    }
  }

  for (const asset of assets) {
    const keys = Array.from(assetObjectKeys(asset));
    if (keys.length === 0) continue;
    const missingKeys = keys.filter((key) => !objectKeySet.has(key));
    if (missingKeys.length > 0) {
      healthIssues.push({
        id: `missing-r2-object:${asset.id}`,
        type: 'missing-r2-object',
        severity: 'critical',
        title: 'Missing R2 object',
        detail: `${asset.slug}: ${missingKeys.slice(0, 3).join(', ')}`,
        assetId: asset.id,
        objectKey: missingKeys[0] ?? null,
        updatedAt: asset.updatedAt,
      });
    }
    if (asset.usageCount === 0 && !asset.archived) {
      healthIssues.push({
        id: `unused-asset:${asset.id}`,
        type: 'unused-asset',
        severity: 'info',
        title: 'Unused asset',
        detail: asset.slug,
        assetId: asset.id,
        objectKey: keys[0] ?? null,
        updatedAt: asset.updatedAt,
      });
    }
    if (asset.duplicateCount > 0) {
      healthIssues.push({
        id: `duplicate-hash:${asset.id}`,
        type: 'duplicate-hash',
        severity: 'warning',
        title: 'Duplicate hash',
        detail: `${asset.slug} shares content with ${asset.duplicateCount} asset${asset.duplicateCount === 1 ? '' : 's'}.`,
        assetId: asset.id,
        objectKey: keys[0] ?? null,
        updatedAt: asset.updatedAt,
      });
    }
  }

  for (const key of referencedKeys) {
    if (objectKeySet.has(key)) continue;
    healthIssues.push({
      id: `broken-reference:${key}`,
      type: 'broken-reference',
      severity: 'critical',
      title: 'Broken media reference',
      detail: key,
      assetId: null,
      objectKey: key,
      updatedAt: now,
    });
  }

  return {
    storageObjects,
    folders,
    healthIssues,
    largestObjects: [...storageObjects].sort((a, b) => b.size - a.size).slice(0, 8),
    recentlyUploadedObjects: [...storageObjects].sort((a, b) => new Date(b.lastModified ?? 0).getTime() - new Date(a.lastModified ?? 0).getTime()).slice(0, 8),
  };
}

export async function registerUploadedAsset(supabase: SupabaseClient, input: RegisterUploadedAssetInput) {
  return supabase
    .from('media_assets')
    .upsert(
      {
        slug: input.slug,
        asset_type: input.assetType,
        content_hash: input.contentHash,
        hash: input.contentHash,
        original_width: input.originalWidth,
        original_height: input.originalHeight,
        aspect_ratio: input.aspectRatio,
        mime_type: input.mimeType,
        dominant_color: input.dominantColor,
        blur_data_uri: input.blurDataUri,
        variants: input.variants,
        r2_base_path: input.r2BasePath,
        r2_path: input.r2BasePath,
        storage_provider: 'r2',
        file_size_total: input.fileSizeTotal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug,asset_type,content_hash' }
    )
    .select()
    .single();
}

export async function archiveRegisteredAssets(supabase: SupabaseClient, assetIds: string[]) {
  return supabase
    .from('media_assets')
    .update({ archived: true, updated_at: new Date().toISOString() })
    .in('id', assetIds);
}

export async function deleteRegisteredAsset(supabase: SupabaseClient, asset: { id: string; slug: string; assetType: string; contentHash: string; r2BasePath: string | null }) {
  const prefix = asset.r2BasePath ?? getMediaAssetPrefix(asset.assetType, asset.slug, asset.contentHash);
  await deleteR2Prefix(prefix);
  return supabase.from('media_assets').delete().eq('id', asset.id);
}
