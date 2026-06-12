import type { AssetType, MediaVariant } from '@/types/media';

export type MediaTab = 'assets' | 'gallery' | 'characters' | 'storage-explorer' | 'storage' | 'usage';
export type MediaUsageType = 'title' | 'creator' | 'article' | 'gallery' | 'character';

export interface MediaUsageRecord {
  id: string;
  type: MediaUsageType;
  label: string;
  subtitle: string | null;
  href: string;
  field: string;
}

export interface StudioMediaAsset {
  id: string;
  slug: string;
  assetType: AssetType;
  contentHash: string;
  hash: string;
  originalWidth: number | null;
  originalHeight: number | null;
  mimeType: string | null;
  dominantColor: string | null;
  variants: MediaVariant[];
  previewUrl: string | null;
  r2BasePath: string | null;
  storageProvider: string;
  fileSizeTotal: number;
  usageCount: number;
  duplicateCount: number;
  archived: boolean;
  usages: MediaUsageRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface StudioGalleryImage {
  id: string;
  titleId: string;
  titleName: string;
  titleSlug: string;
  category: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface StudioGalleryGroup {
  id: string;
  titleId: string;
  titleName: string;
  titleSlug: string;
  name: string;
  category: string;
  imageCount: number;
  images: StudioGalleryImage[];
  updatedAt: string;
}

export interface StudioCharacterMedia {
  id: string;
  titleId: string;
  titleName: string;
  titleSlug: string;
  name: string;
  role: 'main' | 'supporting' | 'antagonist' | 'side';
  description: string | null;
  imageCount: number;
  previewImageUrl: string | null;
  updatedAt: string;
}

export interface MediaStatsData {
  totalAssets: number;
  storageUsed: number;
  unusedAssets: number;
  orphanAssets: number;
  duplicateAssets: number;
  totalGalleries: number;
  totalGalleryImages: number;
  totalCharacters: number;
  charactersWithImages: number;
  charactersMissingImages: number;
  brokenAssets: number;
}

export interface MediaStorageObject {
  key: string;
  url: string;
  size: number;
  lastModified: string | null;
  etag: string | null;
  matchedAssetId: string | null;
  usageCount: number;
}

export interface StorageExplorerFolder {
  id: string;
  name: string;
  prefix: string;
  fileCount: number;
  totalSize: number;
  lastUploadedAsset: MediaStorageObject | null;
  orphanAssetCount: number;
  unusedAssetCount: number;
}

export type MediaHealthIssueType = 'missing-db-metadata' | 'missing-r2-object' | 'broken-reference' | 'duplicate-asset' | 'duplicate-hash' | 'orphan-asset' | 'unused-asset';

export interface MediaHealthIssue {
  id: string;
  type: MediaHealthIssueType;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  assetId: string | null;
  objectKey: string | null;
  updatedAt: string;
}

export interface StorageStatsData {
  totalFiles: number;
  storageUsed: number;
  averageAssetSize: number;
  unusedStorage: number;
  potentialSavings: number;
  brokenAssets: number;
  orphanAssets: number;
  largestAssets: StudioMediaAsset[];
  recentlyUploaded: StudioMediaAsset[];
  largestObjects: MediaStorageObject[];
  recentlyUploadedObjects: MediaStorageObject[];
}

export interface MediaWorkspaceData {
  assets: StudioMediaAsset[];
  galleries: StudioGalleryGroup[];
  characters: StudioCharacterMedia[];
  stats: MediaStatsData;
  storage: StorageStatsData;
  storageExplorer: StorageExplorerFolder[];
  healthIssues: MediaHealthIssue[];
}

export type MediaActionResult = { success: true } | { success: false; error: string };
