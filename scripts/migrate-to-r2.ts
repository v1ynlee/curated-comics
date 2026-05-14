// ============================================================
// Local-to-R2 Migration Script
// Reads existing processed images from public/images/covers/ and
// public/images/banners/, uploads them to R2 with proper bucket
// structure, and creates corresponding media_assets rows in Supabase.
//
// Run with: npx tsx scripts/migrate-to-r2.ts
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { generateContentHash, processImage } from '@/lib/image-processor';
import { atomicUploadVariants, type UploadVariant } from '@/lib/atomic-upload';
import { buildR2Key, buildR2Prefix } from '@/lib/r2-paths';
import { getR2PublicUrl, validateR2Config } from '@/lib/r2-client';
import type { AssetType, MediaVariant } from '@/types/media';

// ─── Configuration ───────────────────────────────────────────

const COVERS_DIR = path.resolve(process.cwd(), 'public/images/covers');
const BANNERS_DIR = path.resolve(process.cwd(), 'public/images/banners');

// Image file extensions we process (not .txt or .json metadata files)
const IMAGE_EXTENSIONS = ['.avif', '.webp', '.png', '.jpg', '.jpeg', '.gif'];

// Regex to parse filenames like "solo-leveling-1200w.avif" or "solo-leveling-320w.webp"
const VARIANT_FILENAME_REGEX = /^(.+)-(\d+)w\.(avif|webp|png|jpg|jpeg|gif)$/;

// ─── Types ───────────────────────────────────────────────────

interface SlugGroup {
  slug: string;
  assetType: AssetType;
  files: { path: string; width: number; format: string }[];
}

interface MigrationResult {
  slug: string;
  assetType: AssetType;
  success: boolean;
  error?: string;
  storageBytes: number;
}

interface MigrationReport {
  totalAssetsProcessed: number;
  successfulUploads: number;
  failedUploads: number;
  failures: { slug: string; assetType: AssetType; error: string }[];
  totalR2StorageBytes: number;
  totalR2StorageMB: string;
}

// ─── Helpers ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSupabaseAdmin(): SupabaseClient<any, 'public', any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      '[Migration] Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Scans a directory for image files and groups them by slug.
 */
function scanAndGroupBySlug(dir: string, assetType: AssetType): SlugGroup[] {
  if (!fs.existsSync(dir)) {
    console.log(`  Directory not found: ${dir} — skipping.`);
    return [];
  }

  const files = fs.readdirSync(dir);
  const slugMap = new Map<string, SlugGroup>();

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext)) continue;

    const match = file.match(VARIANT_FILENAME_REGEX);
    if (!match) continue;

    const [, slug, widthStr, format] = match;
    const width = parseInt(widthStr, 10);

    if (!slugMap.has(slug)) {
      slugMap.set(slug, { slug, assetType, files: [] });
    }

    slugMap.get(slug)!.files.push({
      path: path.join(dir, file),
      width,
      format,
    });
  }

  return Array.from(slugMap.values());
}

/**
 * Finds the largest available source image for a slug group.
 * Prefers the widest variant; among same width, prefers webp > avif > others.
 */
function findLargestSource(group: SlugGroup): { path: string; width: number } | null {
  if (group.files.length === 0) return null;

  const sorted = [...group.files].sort((a, b) => {
    if (b.width !== a.width) return b.width - a.width;
    // Prefer lossless-ish formats as source
    const formatPriority: Record<string, number> = { png: 0, webp: 1, avif: 2, jpg: 3, jpeg: 3, gif: 4 };
    return (formatPriority[a.format] ?? 5) - (formatPriority[b.format] ?? 5);
  });

  return sorted[0];
}

// ─── Main Migration Logic ────────────────────────────────────

async function migrateSlugGroup(
  group: SlugGroup,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>
): Promise<MigrationResult> {
  const { slug, assetType } = group;

  try {
    // 1. Find the largest source image
    const source = findLargestSource(group);
    if (!source) {
      return { slug, assetType, success: false, error: 'No valid source image found', storageBytes: 0 };
    }

    // 2. Read the source image buffer
    const buffer = fs.readFileSync(source.path);

    // 3. Generate content hash
    const contentHash = generateContentHash(buffer);

    // 4. Process through Sharp pipeline (generates all variants)
    const result = await processImage(buffer, assetType);

    // 5. Prepare upload variants for atomic upload
    const uploadVariants: UploadVariant[] = result.variants.map((variant) => {
      const descriptor = `${variant.width}w`;
      const key = buildR2Key(assetType, slug, contentHash, descriptor, variant.format);
      const contentType = `image/${variant.format}`;
      return { key, buffer: variant.buffer, contentType };
    });

    // 6. Upload all variants atomically to R2
    await atomicUploadVariants(uploadVariants);

    // 7. Build variant metadata for Supabase
    const variantsMeta: MediaVariant[] = result.variants.map((variant) => {
      const descriptor = `${variant.width}w`;
      const key = buildR2Key(assetType, slug, contentHash, descriptor, variant.format);
      return {
        width: variant.width,
        format: variant.format,
        url: getR2PublicUrl(key),
        size: variant.size,
      };
    });

    // 8. Calculate total storage for this asset
    const totalStorage = result.variants.reduce((sum, v) => sum + v.size, 0);

    // 9. Build R2 base path
    const r2BasePath = buildR2Prefix(assetType, slug, contentHash);

    // 10. Upsert media_assets row in Supabase
    const { error: dbError } = await supabase
      .from('media_assets')
      .upsert(
        {
          slug,
          asset_type: assetType,
          content_hash: contentHash,
          original_width: result.originalWidth,
          original_height: result.originalHeight,
          aspect_ratio: result.aspectRatio,
          mime_type: result.mimeType,
          dominant_color: result.dominantColor,
          blur_data_uri: result.blurDataUri,
          variants: variantsMeta,
          r2_base_path: r2BasePath,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug,asset_type,content_hash' }
      );

    if (dbError) {
      return { slug, assetType, success: false, error: `Supabase error: ${dbError.message}`, storageBytes: 0 };
    }

    return { slug, assetType, success: true, storageBytes: totalStorage };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { slug, assetType, success: false, error: message, storageBytes: 0 };
  }
}

function printReport(report: MigrationReport): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  MIGRATION REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Total assets processed:   ${report.totalAssetsProcessed}`);
  console.log(`  Successful uploads:       ${report.successfulUploads}`);
  console.log(`  Failed uploads:           ${report.failedUploads}`);
  console.log(`  Total R2 storage:         ${report.totalR2StorageMB} MB`);
  console.log('═══════════════════════════════════════════════════════════');

  if (report.failures.length > 0) {
    console.log('\n  FAILURES:');
    console.log('  ─────────────────────────────────────────────────────────');
    for (const failure of report.failures) {
      console.log(`  [${failure.assetType}] ${failure.slug}`);
      console.log(`    Error: ${failure.error}`);
    }
    console.log('  ─────────────────────────────────────────────────────────');
  }

  console.log('\n');
}

// ─── Entry Point ─────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Comic Curated — Local to R2 Migration                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  // Validate R2 configuration
  try {
    validateR2Config();
    console.log('✓ R2 configuration validated');
  } catch (err) {
    console.error('✗ R2 configuration invalid:', (err as Error).message);
    process.exit(1);
  }

  // Create Supabase client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: SupabaseClient<any, 'public', any>;
  try {
    supabase = createSupabaseAdmin();
    console.log('✓ Supabase client created');
  } catch (err) {
    console.error('✗ Supabase setup failed:', (err as Error).message);
    process.exit(1);
  }

  // Scan directories and group by slug
  console.log('\nScanning local image directories...');
  const coverGroups = scanAndGroupBySlug(COVERS_DIR, 'cover');
  console.log(`  Found ${coverGroups.length} cover slugs in ${COVERS_DIR}`);

  const bannerGroups = scanAndGroupBySlug(BANNERS_DIR, 'banner');
  console.log(`  Found ${bannerGroups.length} banner slugs in ${BANNERS_DIR}`);

  const allGroups = [...coverGroups, ...bannerGroups];

  if (allGroups.length === 0) {
    console.log('\nNo images found to migrate. Exiting.');
    return;
  }

  console.log(`\nMigrating ${allGroups.length} total asset groups...\n`);

  // Process each slug group
  const results: MigrationResult[] = [];
  let processed = 0;

  for (const group of allGroups) {
    processed++;
    const progress = `[${processed}/${allGroups.length}]`;
    process.stdout.write(`${progress} Migrating ${group.assetType}/${group.slug}...`);

    const result = await migrateSlugGroup(group, supabase);
    results.push(result);

    if (result.success) {
      const sizeMB = (result.storageBytes / (1024 * 1024)).toFixed(2);
      console.log(` ✓ (${sizeMB} MB)`);
    } else {
      console.log(` ✗ ${result.error}`);
    }
  }

  // Generate report
  const successfulResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);
  const totalStorageBytes = successfulResults.reduce((sum, r) => sum + r.storageBytes, 0);

  const report: MigrationReport = {
    totalAssetsProcessed: results.length,
    successfulUploads: successfulResults.length,
    failedUploads: failedResults.length,
    failures: failedResults.map((r) => ({
      slug: r.slug,
      assetType: r.assetType,
      error: r.error!,
    })),
    totalR2StorageBytes: totalStorageBytes,
    totalR2StorageMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
  };

  printReport(report);

  // Exit with error code if any failures
  if (report.failedUploads > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal error during migration:', err);
  process.exit(1);
});
