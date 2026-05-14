import { describe, it, expect } from 'vitest';
import { buildR2Key, buildR2Prefix, sanitizePathSegment } from './r2-paths';
import type { AssetType } from '@/types/media';

describe('sanitizePathSegment', () => {
  it('converts to lowercase', () => {
    expect(sanitizePathSegment('SoloLeveling')).toBe('sololeveling');
  });

  it('replaces spaces with hyphens', () => {
    expect(sanitizePathSegment('solo leveling')).toBe('solo-leveling');
  });

  it('strips unsafe characters', () => {
    expect(sanitizePathSegment('hello@world!#$%')).toBe('helloworld');
  });

  it('allows hyphens and underscores', () => {
    expect(sanitizePathSegment('my-slug_v2')).toBe('my-slug_v2');
  });

  it('trims whitespace', () => {
    expect(sanitizePathSegment('  slug  ')).toBe('slug');
  });

  it('handles multiple consecutive spaces', () => {
    expect(sanitizePathSegment('tower   of   god')).toBe('tower-of-god');
  });

  it('returns empty string for all-unsafe input', () => {
    expect(sanitizePathSegment('!@#$%^&*()')).toBe('');
  });
});

describe('buildR2Key', () => {
  it('builds correct key for cover asset', () => {
    const key = buildR2Key('cover', 'solo-leveling', 'a1b2c3d4e5f6', '320w', 'avif');
    expect(key).toBe('covers/solo-leveling/a1b2c3d4e5f6/320w.avif');
  });

  it('builds correct key for banner asset', () => {
    const key = buildR2Key('banner', 'tower-of-god', 'f6e5d4c3b2a1', '1920w', 'webp');
    expect(key).toBe('banners/tower-of-god/f6e5d4c3b2a1/1920w.webp');
  });

  it('builds correct key for article-image asset', () => {
    const key = buildR2Key('article-image', 'my-article', 'abc123def456', '1024w', 'avif');
    expect(key).toBe('articles/my-article/abc123def456/1024w.avif');
  });

  it('builds correct key for thumbnail asset', () => {
    const key = buildR2Key('thumbnail', 'solo-leveling', 'hash12345678', '150', 'webp');
    expect(key).toBe('thumbnails/solo-leveling/hash12345678/150.webp');
  });

  it('builds correct key for og-asset', () => {
    const key = buildR2Key('og-asset', 'solo-leveling', 'a1b2c3d4e5f6', 'og', 'png');
    expect(key).toBe('og-assets/solo-leveling/a1b2c3d4e5f6/og.png');
  });

  it('sanitizes slug with unsafe characters', () => {
    const key = buildR2Key('cover', 'My Title!@#', 'a1b2c3d4e5f6', '320w', 'avif');
    expect(key).toBe('covers/my-title/a1b2c3d4e5f6/320w.avif');
  });

  it('sanitizes slug with spaces', () => {
    const key = buildR2Key('cover', 'solo leveling', 'a1b2c3d4e5f6', '640w', 'webp');
    expect(key).toBe('covers/solo-leveling/a1b2c3d4e5f6/640w.webp');
  });

  it('produces URL-safe keys (no special characters)', () => {
    const key = buildR2Key('banner', 'test slug!', 'HASH123', '768w', 'AVIF');
    // All segments should be lowercase alphanumeric, hyphens, underscores
    const segments = key.split('/');
    for (const segment of segments) {
      // Last segment has a dot for the extension
      const parts = segment.split('.');
      for (const part of parts) {
        expect(part).toMatch(/^[a-z0-9\-_]*$/);
      }
    }
  });

  it('maps all asset types to correct prefixes', () => {
    const mappings: [AssetType, string][] = [
      ['cover', 'covers'],
      ['banner', 'banners'],
      ['article-image', 'articles'],
      ['thumbnail', 'thumbnails'],
      ['og-asset', 'og-assets'],
    ];

    for (const [assetType, expectedPrefix] of mappings) {
      const key = buildR2Key(assetType, 'test', 'hash12', 'desc', 'fmt');
      expect(key.startsWith(`${expectedPrefix}/`)).toBe(true);
    }
  });
});

describe('buildR2Prefix', () => {
  it('builds correct prefix for cover asset', () => {
    const prefix = buildR2Prefix('cover', 'solo-leveling', 'a1b2c3d4e5f6');
    expect(prefix).toBe('covers/solo-leveling/a1b2c3d4e5f6/');
  });

  it('builds correct prefix for banner asset', () => {
    const prefix = buildR2Prefix('banner', 'tower-of-god', 'f6e5d4c3b2a1');
    expect(prefix).toBe('banners/tower-of-god/f6e5d4c3b2a1/');
  });

  it('builds correct prefix for article-image asset', () => {
    const prefix = buildR2Prefix('article-image', 'my-article', 'abc123def456');
    expect(prefix).toBe('articles/my-article/abc123def456/');
  });

  it('ends with trailing slash', () => {
    const prefix = buildR2Prefix('cover', 'test', 'hash12');
    expect(prefix.endsWith('/')).toBe(true);
  });

  it('sanitizes slug in prefix', () => {
    const prefix = buildR2Prefix('cover', 'My Title!', 'a1b2c3d4e5f6');
    expect(prefix).toBe('covers/my-title/a1b2c3d4e5f6/');
  });
});
