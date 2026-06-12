// ============================================================
// Media Upload API Route
// POST /api/media/upload
// Accepts FormData with file, slug, and assetType.
// Validates auth, MIME, size; processes through Sharp; uploads
// variants atomically to R2; UPSERTs media_assets in Supabase.
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/db/supabase-server';
import { validateUpload, processImage } from '@/lib/storage/image-processor';
import { atomicUploadVariants, type UploadVariant } from '@/lib/storage/atomic-upload';
import { getUploadAssetPath, getUploadAssetPrefix, getUploadMetadata, type UploadDestination } from '@/lib/storage/media-paths';
import { registerUploadedAsset } from '@/services/studio/media-registry';
import type { AssetType, MediaVariant } from '@/types/media';

const VALID_ASSET_TYPES: AssetType[] = [
  'cover',
  'banner',
  'article-image',
  'thumbnail',
  'og-asset',
  'title_cover',
  'creator_image',
  'article_cover',
  'gallery_image',
  'character_image',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Validate Supabase auth session
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 }
    );
  }

  const file = formData.get('file') as File | null;
  const slug = formData.get('slug') as string | null;
  const destination = (formData.get('destination') as UploadDestination | null) ?? 'temporary';
  const uploadMetadata = getUploadMetadata(destination);
  const assetType = (formData.get('assetType') as AssetType | null) ?? uploadMetadata.assetType;
  const entityId = formData.get('entityId') as string | null;

  if (!file || !slug || !assetType) {
    return NextResponse.json(
      { error: 'Missing required fields: file, slug, assetType' },
      { status: 400 }
    );
  }

  if (!VALID_ASSET_TYPES.includes(assetType)) {
    return NextResponse.json(
      { error: `Invalid asset type: ${assetType}. Allowed: ${VALID_ASSET_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // 3. Validate MIME type and file size
  const validation = validateUpload(file);
  if (!validation.valid) {
    // Determine whether it's a MIME or size error based on the error message
    if (validation.error!.includes('MIME type')) {
      return NextResponse.json(
        { error: validation.error },
        { status: 415 }
      );
    }
    // File size error
    return NextResponse.json(
      { error: 'File size exceeds maximum 10MB' },
      { status: 413 }
    );
  }

  // 4. Process image through Sharp
  let processingResult;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    processingResult = await processImage(buffer, assetType);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown processing error';
    return NextResponse.json(
      { error: `Image processing failed: ${message}` },
      { status: 422 }
    );
  }

  // 5. Upload variants atomically to R2
  const {
    contentHash,
    variants,
    blurDataUri,
    dominantColor,
    originalWidth,
    originalHeight,
    aspectRatio,
    mimeType,
  } = processingResult;

  const uploadVariants: UploadVariant[] = variants.map((variant) => {
    const descriptor = `${variant.width}w`;
    const key = getUploadAssetPath(destination, { slug, contentHash, descriptor, format: variant.format });
    return {
      key,
      buffer: variant.buffer,
      contentType: `image/${variant.format}`,
    };
  });

  try {
    await atomicUploadVariants(uploadVariants);
  } catch {
    return NextResponse.json(
      { error: 'Storage service unavailable' },
      { status: 503 }
    );
  }

  // 6. Build variant metadata for Supabase
  const variantMetadata: MediaVariant[] = variants.map((variant, index) => {
    const key = uploadVariants[index].key;
    return {
      width: variant.width,
      format: variant.format,
      url: key,
      size: variant.size,
    };
  });

  const r2BasePath = getUploadAssetPrefix(destination, slug, contentHash);
  const fileSizeTotal = variants.reduce((sum, v) => sum + v.size, 0);

  // 7. UPSERT media_assets row in Supabase
  const { data: asset, error: dbError } = await registerUploadedAsset(supabase, {
    slug,
    assetType,
    contentHash,
    originalWidth,
    originalHeight,
    aspectRatio,
    mimeType,
    dominantColor,
    blurDataUri,
    variants: variantMetadata,
    r2BasePath,
    fileSizeTotal,
    destination,
    entityType: uploadMetadata.entityType,
    entityId,
    canonicalPath: variantMetadata[0]?.url ?? null,
    provider: uploadMetadata.provider,
  });

  if (dbError) {
    return NextResponse.json(
      { error: `Database error: ${dbError.message}` },
      { status: 500 }
    );
  }

  // 8. Return processed asset data
  return NextResponse.json({
    success: true,
    asset,
  });
}
