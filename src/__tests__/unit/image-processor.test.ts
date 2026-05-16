import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import {
  generateContentHash,
  validateUpload,
  processImage,
  COVER_WIDTHS,
  BANNER_WIDTHS,
  ARTICLE_WIDTHS,
} from '@/lib/storage/image-processor';

/**
 * Creates a test image buffer of the given dimensions using Sharp.
 */
async function createTestImage(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 128, g: 64, b: 200 },
    },
  })
    .jpeg()
    .toBuffer();
}

describe('Image Processor', () => {
  describe('generateContentHash', () => {
    it('produces a 12-character hex string', () => {
      const buffer = Buffer.from('test content');
      const hash = generateContentHash(buffer);
      expect(hash).toHaveLength(12);
      expect(hash).toMatch(/^[0-9a-f]{12}$/);
    });

    it('is deterministic — same buffer produces same hash', () => {
      const buffer = Buffer.from('deterministic test');
      const hash1 = generateContentHash(buffer);
      const hash2 = generateContentHash(buffer);
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different buffers', () => {
      const buffer1 = Buffer.from('content A');
      const buffer2 = Buffer.from('content B');
      const hash1 = generateContentHash(buffer1);
      const hash2 = generateContentHash(buffer2);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validateUpload', () => {
    it('accepts valid JPEG file', () => {
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateUpload(file)).toEqual({ valid: true });
    });

    it('accepts valid PNG file', () => {
      const file = new File(['x'], 'test.png', { type: 'image/png' });
      expect(validateUpload(file)).toEqual({ valid: true });
    });

    it('accepts valid WebP file', () => {
      const file = new File(['x'], 'test.webp', { type: 'image/webp' });
      expect(validateUpload(file)).toEqual({ valid: true });
    });

    it('accepts valid AVIF file', () => {
      const file = new File(['x'], 'test.avif', { type: 'image/avif' });
      expect(validateUpload(file)).toEqual({ valid: true });
    });

    it('accepts valid GIF file', () => {
      const file = new File(['x'], 'test.gif', { type: 'image/gif' });
      expect(validateUpload(file)).toEqual({ valid: true });
    });

    it('rejects invalid MIME type', () => {
      const file = new File(['x'], 'test.bmp', { type: 'image/bmp' });
      const result = validateUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid MIME type: image/bmp');
      expect(result.error).toContain('Allowed:');
    });

    it('rejects application/pdf MIME type', () => {
      const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
      const result = validateUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid MIME type: application/pdf');
    });

    it('rejects file exceeding 10MB', () => {
      // Create a file object that reports size > 10MB
      const largeContent = new Uint8Array(10 * 1024 * 1024 + 1);
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateUpload(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum 10MB');
    });

    it('accepts file exactly at 10MB', () => {
      const content = new Uint8Array(10 * 1024 * 1024);
      const file = new File([content], 'exact.jpg', { type: 'image/jpeg' });
      expect(validateUpload(file)).toEqual({ valid: true });
    });
  });

  describe('width constants', () => {
    it('COVER_WIDTHS are [320, 480, 640, 1200]', () => {
      expect(COVER_WIDTHS).toEqual([320, 480, 640, 1200]);
    });

    it('BANNER_WIDTHS are [768, 1200, 1920]', () => {
      expect(BANNER_WIDTHS).toEqual([768, 1200, 1920]);
    });

    it('ARTICLE_WIDTHS are [480, 768, 1200]', () => {
      expect(ARTICLE_WIDTHS).toEqual([480, 768, 1200]);
    });
  });

  describe('processImage', () => {
    it('generates correct number of variants for cover images', async () => {
      const buffer = await createTestImage(1200, 1800);
      const result = await processImage(buffer, 'cover');

      // 4 widths × 2 formats = 8 variants
      expect(result.variants).toHaveLength(COVER_WIDTHS.length * 2);
    });

    it('generates correct number of variants for banner images', async () => {
      const buffer = await createTestImage(1920, 600);
      const result = await processImage(buffer, 'banner');

      // 3 widths × 2 formats = 6 variants
      expect(result.variants).toHaveLength(BANNER_WIDTHS.length * 2);
    });

    it('generates correct number of variants for article images', async () => {
      const buffer = await createTestImage(1200, 800);
      const result = await processImage(buffer, 'article-image');

      // 3 widths × 2 formats = 6 variants
      expect(result.variants).toHaveLength(ARTICLE_WIDTHS.length * 2);
    });

    it('produces both AVIF and WebP for each width', async () => {
      const buffer = await createTestImage(1200, 1800);
      const result = await processImage(buffer, 'cover');

      for (const width of COVER_WIDTHS) {
        const avif = result.variants.find(
          (v) => v.width === width && v.format === 'avif'
        );
        const webp = result.variants.find(
          (v) => v.width === width && v.format === 'webp'
        );
        expect(avif).toBeDefined();
        expect(webp).toBeDefined();
      }
    });

    it('returns a valid content hash', async () => {
      const buffer = await createTestImage(640, 480);
      const result = await processImage(buffer, 'cover');
      expect(result.contentHash).toHaveLength(12);
      expect(result.contentHash).toMatch(/^[0-9a-f]{12}$/);
    });

    it('generates a valid LQIP data URI', async () => {
      const buffer = await createTestImage(640, 480);
      const result = await processImage(buffer, 'cover');
      expect(result.blurDataUri).toMatch(
        /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/
      );
    });

    it('extracts dominant color as a hex string', async () => {
      const buffer = await createTestImage(640, 480);
      const result = await processImage(buffer, 'cover');
      expect(result.dominantColor).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('extracts correct original dimensions', async () => {
      const buffer = await createTestImage(800, 600);
      const result = await processImage(buffer, 'cover');
      expect(result.originalWidth).toBe(800);
      expect(result.originalHeight).toBe(600);
    });

    it('computes correct aspect ratio', async () => {
      const buffer = await createTestImage(800, 600);
      const result = await processImage(buffer, 'cover');
      expect(result.aspectRatio).toBeCloseTo(800 / 600, 3);
    });

    it('returns a valid mimeType', async () => {
      const buffer = await createTestImage(640, 480);
      const result = await processImage(buffer, 'cover');
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('does not enlarge images beyond original width', async () => {
      // Image is only 300px wide — should not produce 480, 640, 1200 at full size
      const buffer = await createTestImage(300, 400);
      const result = await processImage(buffer, 'cover');

      for (const variant of result.variants) {
        expect(variant.width).toBeLessThanOrEqual(300);
      }
    });

    it('variant buffers are non-empty', async () => {
      const buffer = await createTestImage(640, 480);
      const result = await processImage(buffer, 'cover');

      for (const variant of result.variants) {
        expect(variant.buffer.length).toBeGreaterThan(0);
        expect(variant.size).toBe(variant.buffer.length);
      }
    });
  });
});
