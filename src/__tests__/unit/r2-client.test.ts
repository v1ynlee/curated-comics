import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateR2Config, getR2PublicUrl } from '@/lib/storage/r2-client';

describe('R2 Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateR2Config', () => {
    it('returns config when all env vars are present', () => {
      process.env.R2_ACCOUNT_ID = 'test-account-id';
      process.env.R2_ACCESS_KEY_ID = 'test-access-key';
      process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
      process.env.R2_BUCKET_NAME = 'test-bucket';
      process.env.R2_PUBLIC_URL = 'https://cdn.example.com';

      const config = validateR2Config();

      expect(config).toEqual({
        accountId: 'test-account-id',
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
        bucketName: 'test-bucket',
        publicUrl: 'https://cdn.example.com',
      });
    });

    it('throws when all env vars are missing', () => {
      delete process.env.R2_ACCOUNT_ID;
      delete process.env.R2_ACCESS_KEY_ID;
      delete process.env.R2_SECRET_ACCESS_KEY;
      delete process.env.R2_BUCKET_NAME;
      delete process.env.R2_PUBLIC_URL;

      expect(() => validateR2Config()).toThrow(
        '[R2] Missing environment variables: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL'
      );
    });

    it('throws listing only the missing variables', () => {
      process.env.R2_ACCOUNT_ID = 'test-account-id';
      process.env.R2_ACCESS_KEY_ID = 'test-access-key';
      delete process.env.R2_SECRET_ACCESS_KEY;
      process.env.R2_BUCKET_NAME = 'test-bucket';
      delete process.env.R2_PUBLIC_URL;

      expect(() => validateR2Config()).toThrow(
        '[R2] Missing environment variables: R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL'
      );
    });

    it('throws when a single env var is missing', () => {
      process.env.R2_ACCOUNT_ID = 'test-account-id';
      process.env.R2_ACCESS_KEY_ID = 'test-access-key';
      process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
      process.env.R2_BUCKET_NAME = 'test-bucket';
      delete process.env.R2_PUBLIC_URL;

      expect(() => validateR2Config()).toThrow(
        '[R2] Missing environment variables: R2_PUBLIC_URL'
      );
    });

    it('treats empty string as missing', () => {
      process.env.R2_ACCOUNT_ID = '';
      process.env.R2_ACCESS_KEY_ID = 'test-access-key';
      process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
      process.env.R2_BUCKET_NAME = 'test-bucket';
      process.env.R2_PUBLIC_URL = 'https://cdn.example.com';

      expect(() => validateR2Config()).toThrow(
        '[R2] Missing environment variables: R2_ACCOUNT_ID'
      );
    });
  });

  describe('getR2PublicUrl', () => {
    beforeEach(() => {
      process.env.R2_ACCOUNT_ID = 'test-account-id';
      process.env.R2_ACCESS_KEY_ID = 'test-access-key';
      process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
      process.env.R2_BUCKET_NAME = 'test-bucket';
      process.env.R2_PUBLIC_URL = 'https://cdn.example.com';
    });

    it('returns CDN URL for a given key', () => {
      const url = getR2PublicUrl('covers/solo-leveling/abc123def456/320w.avif');
      expect(url).toBe(
        'https://cdn.example.com/covers/solo-leveling/abc123def456/320w.avif'
      );
    });

    it('handles trailing slash in R2_PUBLIC_URL', () => {
      process.env.R2_PUBLIC_URL = 'https://cdn.example.com/';
      const url = getR2PublicUrl('covers/test/hash/640w.webp');
      expect(url).toBe('https://cdn.example.com/covers/test/hash/640w.webp');
    });

    it('handles multiple trailing slashes in R2_PUBLIC_URL', () => {
      process.env.R2_PUBLIC_URL = 'https://cdn.example.com///';
      const url = getR2PublicUrl('banners/test/hash/1200w.avif');
      expect(url).toBe('https://cdn.example.com/banners/test/hash/1200w.avif');
    });
  });
});
