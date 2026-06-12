'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';
import { buildMediaStorageSnapshot, deleteRegisteredAsset, listMediaStorageObjects, archiveRegisteredAssets } from '@/services/studio/media-registry';
import { logStudioActivity } from '@/services/studio/activity-log';
import type { AssetType, MediaVariant } from '@/types/media';
import type {
  MediaActionResult,
  MediaHealthIssue,
  MediaUsageRecord,
  MediaWorkspaceData,
  StudioCharacterMedia,
  StudioGalleryGroup,
  StudioGalleryImage,
  StudioMediaAsset,
} from './types';

interface MediaAssetRow {
  id: string;
  slug: string;
  asset_type: AssetType;
  content_hash: string | null;
  original_width: number | null;
  original_height: number | null;
  mime_type: string | null;
  dominant_color: string | null;
  variants: MediaVariant[] | null;
  r2_base_path: string | null;
  file_size_total?: number | null;
  storage_provider?: string | null;
  archived?: boolean | null;
  hash?: string | null;
  r2_path?: string | null;
  created_at: string;
  updated_at: string;
}

interface TitleRow { id: string; slug: string; title_english: string; cover_slug: string | null; updated_at: string }
interface ArticleRow { id: string; slug: string; title: string; featured_image_id: string | null; updated_at: string }
interface CreatorRow { id: string; slug: string; name: string; image: string | null; updated_at: string | null }
type MaybeArray<T> = T | T[] | null;
interface GalleryRow { id: string; title_id: string; category: string; image_url: string; caption: string | null; sort_order: number; created_at: string; titles: MaybeArray<{ slug: string; title_english: string }> }
interface CharacterImageRow { id: string; character_id: string; image_url: string; caption: string | null; sort_order: number }
interface CharacterRow { id: string; title_id: string; name: string; role: StudioCharacterMedia['role']; description: string | null; sort_order: number; created_at: string; titles: MaybeArray<{ slug: string; title_english: string }>; character_images: CharacterImageRow[] | null }

async function requireStudio() {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');
  return createSupabaseServerClient();
}

function assetPreviewUrl(asset: MediaAssetRow) {
  const variants = asset.variants ?? [];
  return variants
    .filter((variant) => variant.url)
    .sort((a, b) => a.width - b.width)[0]?.url ?? null;
}

function assetStorageSize(asset: MediaAssetRow) {
  if (asset.file_size_total && asset.file_size_total > 0) return asset.file_size_total;
  return (asset.variants ?? []).reduce((sum, variant) => sum + (variant.size ?? 0), 0);
}

function assetUrlSet(asset: MediaAssetRow) {
  return new Set((asset.variants ?? []).map((variant) => variant.url).filter(Boolean));
}

function firstRelation<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function urlMatchesAsset(value: string | null | undefined, asset: MediaAssetRow, urls: Set<string>) {
  if (!value) return false;
  if (urls.has(value)) return true;
  return Boolean(asset.slug && value.includes(asset.slug));
}

async function fetchMediaAssetRows(): Promise<MediaAssetRow[]> {
  const supabase = await createSupabaseServerClient();
  const v2 = await supabase
    .from('media_assets')
    .select('id, slug, asset_type, content_hash, original_width, original_height, mime_type, dominant_color, variants, r2_base_path, file_size_total, storage_provider, archived, hash, r2_path, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (!v2.error) return (v2.data ?? []) as MediaAssetRow[];

  const fallback = await supabase
    .from('media_assets')
    .select('id, slug, asset_type, content_hash, original_width, original_height, mime_type, dominant_color, variants, r2_base_path, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (fallback.error) throw new Error(fallback.error.message);
  return (fallback.data ?? []) as MediaAssetRow[];
}

export async function fetchMediaWorkspaceData(): Promise<MediaWorkspaceData> {
  const supabase = await requireStudio();
  const [assets, titlesResult, articlesResult, creatorsResult, galleryResult, charactersResult] = await Promise.all([
    fetchMediaAssetRows(),
    supabase.from('titles').select('id, slug, title_english, cover_slug, updated_at'),
    supabase.from('articles').select('id, slug, title, featured_image_id, updated_at'),
    supabase.from('creators').select('id, slug, name, image, updated_at'),
    supabase.from('title_gallery').select('id, title_id, category, image_url, caption, sort_order, created_at, titles:titles(slug, title_english)').order('created_at', { ascending: false }),
    supabase.from('title_characters').select('id, title_id, name, role, description, sort_order, created_at, titles:titles(slug, title_english), character_images(id, character_id, image_url, caption, sort_order)').order('created_at', { ascending: false }),
  ]);

  const titles = titlesResult.error ? [] : (titlesResult.data ?? []) as TitleRow[];
  const articles = articlesResult.error ? [] : (articlesResult.data ?? []) as ArticleRow[];
  const creators = creatorsResult.error ? [] : (creatorsResult.data ?? []) as CreatorRow[];
  const galleryRows = galleryResult.error ? [] : (galleryResult.data ?? []) as unknown as GalleryRow[];
  const characterRows = charactersResult.error ? [] : (charactersResult.data ?? []) as unknown as CharacterRow[];

  const hashCounts = new Map<string, number>();
  for (const asset of assets) {
    const hash = asset.hash ?? asset.content_hash ?? '';
    if (hash) hashCounts.set(hash, (hashCounts.get(hash) ?? 0) + 1);
  }

  const referencedUrls: string[] = [];
  for (const creator of creators) if (creator.image) referencedUrls.push(creator.image);
  for (const image of galleryRows) referencedUrls.push(image.image_url);
  for (const character of characterRows) for (const image of character.character_images ?? []) referencedUrls.push(image.image_url);

  const mappedAssets: StudioMediaAsset[] = assets.map((asset) => {
    const urls = assetUrlSet(asset);
    const usages: MediaUsageRecord[] = [];

    for (const title of titles) {
      if (title.cover_slug === asset.slug || (asset.asset_type === 'cover' && title.slug === asset.slug)) {
        usages.push({ id: title.id, type: 'title', label: title.title_english, subtitle: title.slug, href: `/studio/titles/${title.slug}`, field: 'Cover' });
      }
    }

    for (const article of articles) {
      if (article.featured_image_id === asset.id) {
        usages.push({ id: article.id, type: 'article', label: article.title, subtitle: article.slug, href: `/studio/articles/${article.slug}`, field: 'Article cover' });
      }
    }

    for (const creator of creators) {
      if (urlMatchesAsset(creator.image, asset, urls)) {
        usages.push({ id: creator.id, type: 'creator', label: creator.name, subtitle: creator.slug, href: '/studio/creators', field: 'Profile image' });
      }
    }

    for (const image of galleryRows) {
      if (urlMatchesAsset(image.image_url, asset, urls)) {
        const title = firstRelation(image.titles);
        usages.push({ id: image.id, type: 'gallery', label: image.caption || `${title?.title_english ?? 'Gallery'} image`, subtitle: title?.title_english ?? null, href: '/studio/media?tab=gallery', field: 'Gallery image' });
      }
    }

    for (const character of characterRows) {
      for (const image of character.character_images ?? []) {
        if (urlMatchesAsset(image.image_url, asset, urls)) {
          const title = firstRelation(character.titles);
          usages.push({ id: character.id, type: 'character', label: character.name, subtitle: title?.title_english ?? null, href: '/studio/media?tab=characters', field: 'Character image' });
        }
      }
    }

    const hash = asset.hash ?? asset.content_hash ?? '';
    return {
      id: asset.id,
      slug: asset.slug,
      assetType: asset.asset_type,
      contentHash: asset.content_hash ?? '',
      hash,
      originalWidth: asset.original_width,
      originalHeight: asset.original_height,
      mimeType: asset.mime_type,
      dominantColor: asset.dominant_color,
      variants: asset.variants ?? [],
      previewUrl: assetPreviewUrl(asset),
      r2BasePath: asset.r2_path ?? asset.r2_base_path,
      storageProvider: asset.storage_provider ?? 'r2',
      fileSizeTotal: assetStorageSize(asset),
      usageCount: usages.length,
      duplicateCount: hash ? Math.max(0, (hashCounts.get(hash) ?? 1) - 1) : 0,
      archived: Boolean(asset.archived),
      usages,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    };
  });

  const galleryMap = new Map<string, StudioGalleryImage[]>();
  for (const row of galleryRows) {
    const title = firstRelation(row.titles);
    const titleName = title?.title_english ?? 'Untitled title';
    const titleSlug = title?.slug ?? row.title_id;
    const image: StudioGalleryImage = { id: row.id, titleId: row.title_id, titleName, titleSlug, category: row.category, imageUrl: row.image_url, caption: row.caption, sortOrder: row.sort_order, createdAt: row.created_at };
    const key = `${row.title_id}:${row.category}`;
    galleryMap.set(key, [...(galleryMap.get(key) ?? []), image]);
  }

  const galleries: StudioGalleryGroup[] = Array.from(galleryMap.entries()).map(([id, images]) => {
    const first = images[0];
    const sortedImages = images.sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      id,
      titleId: first.titleId,
      titleName: first.titleName,
      titleSlug: first.titleSlug,
      name: `${first.titleName} — ${first.category.replace(/-/g, ' ')}`,
      category: first.category,
      imageCount: sortedImages.length,
      images: sortedImages,
      updatedAt: sortedImages[sortedImages.length - 1]?.createdAt ?? first.createdAt,
    };
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const characters: StudioCharacterMedia[] = characterRows.map((row) => {
    const images = (row.character_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
    const title = firstRelation(row.titles);
    return {
      id: row.id,
      titleId: row.title_id,
      titleName: title?.title_english ?? 'Untitled title',
      titleSlug: title?.slug ?? row.title_id,
      name: row.name,
      role: row.role,
      description: row.description,
      imageCount: images.length,
      previewImageUrl: images[0]?.image_url ?? null,
      updatedAt: row.created_at,
    };
  });

  const storageUsed = mappedAssets.reduce((sum, asset) => sum + asset.fileSizeTotal, 0);
  const unusedAssets = mappedAssets.filter((asset) => asset.usageCount === 0 && !asset.archived);
  const duplicateAssets = mappedAssets.filter((asset) => asset.duplicateCount > 0);
  let storageSnapshot: ReturnType<typeof buildMediaStorageSnapshot> | null = null;
  let storageHealthIssues: MediaHealthIssue[] = [];
  try {
    storageSnapshot = buildMediaStorageSnapshot(mappedAssets, referencedUrls, await listMediaStorageObjects());
    storageHealthIssues = storageSnapshot.healthIssues;
  } catch (error) {
    storageHealthIssues = [{
      id: 'storage-unavailable:r2',
      type: 'broken-reference',
      severity: 'critical',
      title: 'R2 storage unavailable',
      detail: error instanceof Error ? error.message : 'Could not list Cloudflare R2 objects.',
      assetId: null,
      objectKey: null,
      updatedAt: new Date().toISOString(),
    }];
  }
  const brokenAssets = storageHealthIssues.filter((issue) => issue.type === 'missing-r2-object' || issue.type === 'broken-reference').length;
  const orphanAssets = storageHealthIssues.filter((issue) => issue.type === 'missing-db-metadata' || issue.type === 'orphan-asset').length;
  const stats = {
    totalAssets: mappedAssets.length,
    storageUsed: storageSnapshot ? storageSnapshot.storageObjects.reduce((sum, object) => sum + object.size, 0) : storageUsed,
    unusedAssets: unusedAssets.length,
    orphanAssets,
    duplicateAssets: duplicateAssets.length,
    totalGalleries: galleries.length,
    totalGalleryImages: galleryRows.length,
    totalCharacters: characters.length,
    charactersWithImages: characters.filter((character) => character.imageCount > 0).length,
    charactersMissingImages: characters.filter((character) => character.imageCount === 0).length,
    brokenAssets,
  };
  const r2StorageUsed = storageSnapshot ? storageSnapshot.storageObjects.reduce((sum, object) => sum + object.size, 0) : storageUsed;

  return {
    assets: mappedAssets,
    galleries,
    characters,
    stats,
    storage: {
      totalFiles: storageSnapshot ? storageSnapshot.storageObjects.length : mappedAssets.reduce((sum, asset) => sum + Math.max(1, asset.variants.length), 0),
      storageUsed: r2StorageUsed,
      averageAssetSize: storageSnapshot?.storageObjects.length ? Math.round(r2StorageUsed / storageSnapshot.storageObjects.length) : mappedAssets.length ? Math.round(storageUsed / mappedAssets.length) : 0,
      unusedStorage: unusedAssets.reduce((sum, asset) => sum + asset.fileSizeTotal, 0),
      potentialSavings: duplicateAssets.reduce((sum, asset) => sum + asset.fileSizeTotal, 0),
      brokenAssets,
      orphanAssets,
      largestAssets: [...mappedAssets].sort((a, b) => b.fileSizeTotal - a.fileSizeTotal).slice(0, 8),
      recentlyUploaded: [...mappedAssets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
      largestObjects: storageSnapshot?.largestObjects ?? [],
      recentlyUploadedObjects: storageSnapshot?.recentlyUploadedObjects ?? [],
    },
    storageExplorer: storageSnapshot?.folders ?? [],
    healthIssues: storageHealthIssues,
  };
}

export async function archiveMediaAsset(assetId: string, archived: boolean): Promise<MediaActionResult> {
  const supabase = await requireStudio();
  const { data: asset } = await supabase.from('media_assets').select('id, slug, archived').eq('id', assetId).single();
  const { error } = await supabase.from('media_assets').update({ archived, updated_at: new Date().toISOString() }).eq('id', assetId);
  if (error) return { success: false, error: error.message };

  await logStudioActivity({
    eventType: archived ? 'ASSET_ARCHIVED' : 'ASSET_RESTORED',
    entityType: 'media',
    entityId: assetId,
    entityName: asset?.slug ?? null,
    metadata: { oldValues: { archived: asset?.archived ?? false }, newValues: { archived }, changedFields: ['archived'] },
  });

  revalidatePath('/studio/media');
  revalidatePath('/studio/activity');
  return { success: true };
}

export async function deleteMediaAsset(assetId: string): Promise<MediaActionResult> {
  const data = await fetchMediaWorkspaceData();
  const asset = data.assets.find((item) => item.id === assetId);
  if (!asset) return { success: false, error: 'Asset not found.' };
  if (asset.usageCount > 0) return { success: false, error: 'Asset is still in use. Replace or detach usages before deleting.' };

  const supabase = await requireStudio();
  const { error } = await deleteRegisteredAsset(supabase, { id: asset.id, slug: asset.slug, assetType: asset.assetType, contentHash: asset.contentHash || asset.hash, r2BasePath: asset.r2BasePath });
  if (error) return { success: false, error: error.message };

  await logStudioActivity({ eventType: 'ASSET_DELETED', entityType: 'media', entityId: assetId, entityName: asset.slug, metadata: { fileSizeTotal: asset.fileSizeTotal, assetType: asset.assetType } });
  revalidatePath('/studio/media');
  revalidatePath('/studio/activity');
  return { success: true };
}

export async function archiveMediaAssets(assetIds: string[]): Promise<MediaActionResult> {
  const uniqueIds = Array.from(new Set(assetIds)).filter(Boolean);
  if (uniqueIds.length === 0) return { success: false, error: 'Select at least one asset.' };

  const supabase = await requireStudio();
  const { error } = await archiveRegisteredAssets(supabase, uniqueIds);
  if (error) return { success: false, error: error.message };

  await logStudioActivity({
    eventType: 'MEDIA_BULK_ACTION_APPLIED',
    entityType: 'media',
    entityId: 'bulk-archive',
    entityName: 'Archive selected assets',
    metadata: { action: 'archive', assetIds: uniqueIds, count: uniqueIds.length },
  });

  revalidatePath('/studio/media');
  revalidatePath('/studio/activity');
  return { success: true };
}

export async function replaceMediaAssetReferences(oldAssetId: string, newAssetId: string): Promise<MediaActionResult> {
  const data = await fetchMediaWorkspaceData();
  const oldAsset = data.assets.find((asset) => asset.id === oldAssetId);
  const newAsset = data.assets.find((asset) => asset.id === newAssetId);
  if (!oldAsset || !newAsset) return { success: false, error: 'Replacement asset not found.' };

  const supabase = await requireStudio();
  const newUrl = newAsset.previewUrl;

  for (const usage of oldAsset.usages) {
    if (usage.type === 'article') await supabase.from('articles').update({ featured_image_id: newAsset.id, updated_at: new Date().toISOString() }).eq('id', usage.id);
    if (usage.type === 'title') await supabase.from('titles').update({ cover_slug: newAsset.slug, updated_at: new Date().toISOString() }).eq('id', usage.id);
    if (usage.type === 'creator' && newUrl) await supabase.from('creators').update({ image: newUrl, updated_at: new Date().toISOString() }).eq('id', usage.id);
    if (usage.type === 'gallery' && newUrl) await supabase.from('title_gallery').update({ image_url: newUrl }).eq('id', usage.id);
    if (usage.type === 'character' && newUrl) {
      const oldUrls = new Set(oldAsset.variants.map((variant) => variant.url));
      const imageRows = await supabase.from('character_images').select('id, image_url').eq('character_id', usage.id);
      for (const row of (imageRows.data ?? []) as { id: string; image_url: string }[]) {
        if (oldUrls.has(row.image_url) || row.image_url.includes(oldAsset.slug)) await supabase.from('character_images').update({ image_url: newUrl }).eq('id', row.id);
      }
    }
  }

  await logStudioActivity({
    eventType: 'ASSET_REPLACED',
    entityType: 'media',
    entityId: oldAssetId,
    entityName: oldAsset.slug,
    metadata: { oldValues: { assetId: oldAssetId, slug: oldAsset.slug }, newValues: { assetId: newAssetId, slug: newAsset.slug }, changedFields: ['assetReferences'], usageCount: oldAsset.usageCount },
  });

  revalidatePath('/studio/media');
  revalidatePath('/studio');
  revalidatePath('/studio/activity');
  return { success: true };
}

export async function addGalleryAssetToGroup(input: { titleId: string; category: string; assetId: string; caption?: string }): Promise<MediaActionResult> {
  const data = await fetchMediaWorkspaceData();
  const asset = data.assets.find((item) => item.id === input.assetId);
  if (!asset?.previewUrl) return { success: false, error: 'Select an asset with a usable preview URL.' };

  const supabase = await requireStudio();
  const latest = await supabase
    .from('title_gallery')
    .select('sort_order')
    .eq('title_id', input.titleId)
    .eq('category', input.category)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest.error) return { success: false, error: latest.error.message };

  const { error } = await supabase.from('title_gallery').insert({
    title_id: input.titleId,
    category: input.category,
    image_url: asset.previewUrl,
    caption: input.caption?.trim() || null,
    sort_order: ((latest.data as { sort_order: number } | null)?.sort_order ?? -1) + 1,
  });
  if (error) return { success: false, error: error.message };

  await logStudioActivity({
    eventType: 'GALLERY_UPDATED',
    entityType: 'gallery',
    entityId: input.titleId,
    entityName: asset.slug,
    metadata: { changedFields: ['image_url'], newValues: { assetId: asset.id, category: input.category } },
  });

  revalidatePath('/studio/media');
  revalidatePath('/studio/activity');
  return { success: true };
}

export async function addCharacterAssetImage(input: { characterId: string; assetId: string; caption?: string }): Promise<MediaActionResult> {
  const data = await fetchMediaWorkspaceData();
  const asset = data.assets.find((item) => item.id === input.assetId);
  if (!asset?.previewUrl) return { success: false, error: 'Select an asset with a usable preview URL.' };

  const supabase = await requireStudio();
  const latest = await supabase
    .from('character_images')
    .select('sort_order')
    .eq('character_id', input.characterId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest.error) return { success: false, error: latest.error.message };

  const { error } = await supabase.from('character_images').insert({
    character_id: input.characterId,
    image_url: asset.previewUrl,
    caption: input.caption?.trim() || null,
    sort_order: ((latest.data as { sort_order: number } | null)?.sort_order ?? -1) + 1,
  });
  if (error) return { success: false, error: error.message };

  await logStudioActivity({
    eventType: 'CHARACTER_UPDATED',
    entityType: 'character',
    entityId: input.characterId,
    entityName: asset.slug,
    metadata: { changedFields: ['image_url'], newValues: { assetId: asset.id } },
  });

  revalidatePath('/studio/media');
  revalidatePath('/studio/activity');
  return { success: true };
}
