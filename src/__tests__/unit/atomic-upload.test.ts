import { describe, it, expect, vi, beforeEach } from 'vitest';
import { atomicUploadVariants, UploadVariant } from '@/lib/atomic-upload';

// Mock the r2-client module
vi.mock('@/lib/r2-client', () => ({
  uploadToR2: vi.fn(),
  deleteFromR2: vi.fn(),
}));

import { uploadToR2, deleteFromR2 } from '@/lib/r2-client';

const mockUploadToR2 = vi.mocked(uploadToR2);
const mockDeleteFromR2 = vi.mocked(deleteFromR2);

describe('atomicUploadVariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createVariants = (count: number): UploadVariant[] =>
    Array.from({ length: count }, (_, i) => ({
      key: `covers/test-slug/abc123/${320 * (i + 1)}w.avif`,
      buffer: Buffer.from(`variant-${i}`),
      contentType: 'image/avif',
    }));

  it('uploads all variants and returns their keys on success', async () => {
    const variants = createVariants(3);
    mockUploadToR2.mockResolvedValue('https://cdn.example.com/uploaded');

    const result = await atomicUploadVariants(variants);

    expect(result).toEqual(variants.map((v) => v.key));
    expect(mockUploadToR2).toHaveBeenCalledTimes(3);
    expect(mockUploadToR2).toHaveBeenCalledWith(
      variants[0].key,
      variants[0].buffer,
      variants[0].contentType
    );
    expect(mockUploadToR2).toHaveBeenCalledWith(
      variants[1].key,
      variants[1].buffer,
      variants[1].contentType
    );
    expect(mockUploadToR2).toHaveBeenCalledWith(
      variants[2].key,
      variants[2].buffer,
      variants[2].contentType
    );
  });

  it('returns empty array when given no variants', async () => {
    const result = await atomicUploadVariants([]);

    expect(result).toEqual([]);
    expect(mockUploadToR2).not.toHaveBeenCalled();
  });

  it('rolls back previously uploaded keys when an upload fails', async () => {
    const variants = createVariants(4);
    const uploadError = new Error('R2 service unavailable');

    // First two succeed, third fails
    mockUploadToR2
      .mockResolvedValueOnce('https://cdn.example.com/1')
      .mockResolvedValueOnce('https://cdn.example.com/2')
      .mockRejectedValueOnce(uploadError);

    mockDeleteFromR2.mockResolvedValue(undefined);

    await expect(atomicUploadVariants(variants)).rejects.toThrow(
      'R2 service unavailable'
    );

    // Should have attempted to upload 3 times (failed on 3rd)
    expect(mockUploadToR2).toHaveBeenCalledTimes(3);

    // Should have deleted the 2 successfully uploaded keys
    expect(mockDeleteFromR2).toHaveBeenCalledTimes(2);
    expect(mockDeleteFromR2).toHaveBeenCalledWith(variants[0].key);
    expect(mockDeleteFromR2).toHaveBeenCalledWith(variants[1].key);
  });

  it('re-throws the original error after rollback', async () => {
    const variants = createVariants(2);
    const originalError = new Error('Network timeout');

    mockUploadToR2
      .mockResolvedValueOnce('https://cdn.example.com/1')
      .mockRejectedValueOnce(originalError);

    mockDeleteFromR2.mockResolvedValue(undefined);

    const thrownError = await atomicUploadVariants(variants).catch((e) => e);
    expect(thrownError).toBe(originalError);
  });

  it('still re-throws original error even if rollback deletes fail', async () => {
    const variants = createVariants(3);
    const uploadError = new Error('Upload failed');

    mockUploadToR2
      .mockResolvedValueOnce('https://cdn.example.com/1')
      .mockResolvedValueOnce('https://cdn.example.com/2')
      .mockRejectedValueOnce(uploadError);

    // Rollback deletes also fail
    mockDeleteFromR2.mockRejectedValue(new Error('Delete also failed'));

    await expect(atomicUploadVariants(variants)).rejects.toThrow(
      'Upload failed'
    );

    // Rollback was still attempted for both keys
    expect(mockDeleteFromR2).toHaveBeenCalledTimes(2);
  });

  it('does not attempt rollback when the first upload fails', async () => {
    const variants = createVariants(3);
    const uploadError = new Error('First upload failed');

    mockUploadToR2.mockRejectedValueOnce(uploadError);

    await expect(atomicUploadVariants(variants)).rejects.toThrow(
      'First upload failed'
    );

    // Only 1 upload attempted, no deletes needed
    expect(mockUploadToR2).toHaveBeenCalledTimes(1);
    expect(mockDeleteFromR2).not.toHaveBeenCalled();
  });

  it('uploads variants sequentially (not in parallel)', async () => {
    const variants = createVariants(3);
    const callOrder: string[] = [];

    mockUploadToR2.mockImplementation(async (key) => {
      callOrder.push(key);
      return `https://cdn.example.com/${key}`;
    });

    await atomicUploadVariants(variants);

    // Verify sequential order
    expect(callOrder).toEqual(variants.map((v) => v.key));
  });
});
