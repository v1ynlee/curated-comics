// ============================================================
// Atomic Upload Helper
// Ensures all-or-nothing semantics for multi-variant uploads to R2.
// If any upload fails, previously uploaded keys are rolled back.
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import { uploadToR2, deleteFromR2 } from './r2-client';

export interface UploadVariant {
  key: string;
  buffer: Buffer;
  contentType: string;
}

/**
 * Uploads all variant buffers to R2 atomically.
 * If any upload fails, deletes all previously uploaded keys (rollback)
 * and re-throws the original error.
 *
 * @param variants - Array of objects with key, buffer, and contentType
 * @returns Array of public CDN URLs for all uploaded variants
 * @throws Re-throws the original upload error after rollback
 */
export async function atomicUploadVariants(
  variants: UploadVariant[]
): Promise<string[]> {
  const uploadedKeys: string[] = [];

  try {
    for (const variant of variants) {
      await uploadToR2(variant.key, variant.buffer, variant.contentType);
      uploadedKeys.push(variant.key);
    }
  } catch (error) {
    // Rollback: delete all previously uploaded keys
    await rollbackUploads(uploadedKeys);
    throw error;
  }

  return uploadedKeys;
}

/**
 * Deletes all keys from R2, suppressing individual delete errors
 * to ensure best-effort cleanup during rollback.
 */
async function rollbackUploads(keys: string[]): Promise<void> {
  const deletePromises = keys.map(async (key) => {
    try {
      await deleteFromR2(key);
    } catch {
      // Suppress individual delete errors during rollback.
      // Best-effort cleanup — logging could be added here if needed.
    }
  });

  await Promise.all(deletePromises);
}
