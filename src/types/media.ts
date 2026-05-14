// ============================================================
// Media Asset Types
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

export type AssetType = 'cover' | 'banner' | 'article-image' | 'thumbnail' | 'og-asset';

export interface MediaVariant {
  width: number;
  format: 'avif' | 'webp';
  url: string;
  size: number;
}

export interface MediaAsset {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedVariant {
  width: number;
  format: 'avif' | 'webp';
  buffer: Buffer;
  size: number;
}

export interface ProcessingResult {
  contentHash: string;
  variants: ProcessedVariant[];
  blurDataUri: string;
  dominantColor: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
  mimeType: string;
}
