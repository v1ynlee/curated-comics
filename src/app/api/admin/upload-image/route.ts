// ============================================================
// Image Upload API Route — Sharp processing pipeline
// Source of truth: docs/performance/IMAGE_PIPELINE.md
//
// POST /api/admin/upload-image
// Body: FormData { file: File, slug: string }
//
// Processes the uploaded image into:
//   - AVIF + WebP at 320w, 480w, 640w, 1200w
//   - Base64 LQIP blur placeholder
//   - Dominant color extraction
//
// Saves to /public/images/covers/ (local dev) or
// uploads to Supabase Storage (production).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/db/supabase-server';
import path from 'path';
import fs from 'fs/promises';

const COVER_SIZES = [320, 480, 640, 1200];
const FORMATS = ['avif', 'webp'] as const;
const QUALITY = { avif: 65, webp: 75 };
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'covers');

export async function POST(request: NextRequest) {
  // Auth check
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const slug = formData.get('slug') as string | null;

    if (!file || !slug) {
      return NextResponse.json(
        { error: 'Missing file or slug' },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 },
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File must be under 5MB' },
        { status: 400 },
      );
    }

    // Import Sharp dynamically (server-only)
    const sharp = (await import('sharp')).default;

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Extract dominant color
    const { dominant } = await image.clone().stats();
    const dominantColor = `#${Math.round(dominant.r).toString(16).padStart(2, '0')}${Math.round(dominant.g).toString(16).padStart(2, '0')}${Math.round(dominant.b).toString(16).padStart(2, '0')}`;

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Generate responsive sizes
    for (const width of COVER_SIZES) {
      for (const format of FORMATS) {
        const outputPath = path.join(OUTPUT_DIR, `${slug}-${width}w.${format}`);
        await image
          .clone()
          .resize(width, null, { fit: 'cover', withoutEnlargement: true })
          [format]({ quality: QUALITY[format] })
          .toFile(outputPath);
      }
    }

    // Generate LQIP blur placeholder
    const blurBuffer = await image
      .clone()
      .resize(20)
      .blur(3)
      .jpeg({ quality: 30 })
      .toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;

    // Save blur placeholder
    await fs.writeFile(
      path.join(OUTPUT_DIR, `${slug}-blur.txt`),
      blurDataURL,
    );

    // Save metadata
    const meta = {
      dominantColor,
      aspectRatio: metadata.width && metadata.height
        ? metadata.width / metadata.height
        : 2 / 3,
      originalSize: {
        width: metadata.width ?? 640,
        height: metadata.height ?? 960,
      },
    };
    await fs.writeFile(
      path.join(OUTPUT_DIR, `${slug}-meta.json`),
      JSON.stringify(meta, null, 2),
    );

    return NextResponse.json({
      slug,
      dominantColor,
      blurDataURL,
      aspectRatio: meta.aspectRatio,
    });
  } catch (err) {
    console.error('[upload-image]', err);
    return NextResponse.json(
      { error: 'Image processing failed' },
      { status: 500 },
    );
  }
}
