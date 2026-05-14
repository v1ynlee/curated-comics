// ============================================================
// Cloudflare R2 Client
// S3-compatible object storage client for media asset operations.
// All credentials are server-side only — never exposed to client bundles.
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
// ============================================================

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

/**
 * Validates that all required R2 environment variables are present.
 * Throws a descriptive error listing any missing variables.
 */
export function validateR2Config(): R2Config {
  const required = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[R2] Missing environment variables: ${missing.join(', ')}`
    );
  }

  return {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicUrl: process.env.R2_PUBLIC_URL!,
  };
}

/**
 * Creates an S3-compatible client configured for Cloudflare R2.
 */
export function createR2Client(): S3Client {
  const config = validateR2Config();

  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/**
 * Uploads a single object to R2.
 * Returns the public CDN URL for the uploaded object.
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const config = validateR2Config();
  const client = createR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return getR2PublicUrl(key);
}

/**
 * Deletes a single object from R2 by key.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const config = validateR2Config();
  const client = createR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })
  );
}

/**
 * Deletes all objects under a given prefix in R2.
 * Lists objects with the prefix, then batch-deletes them.
 */
export async function deleteR2Prefix(prefix: string): Promise<void> {
  const config = validateR2Config();
  const client = createR2Client();

  let continuationToken: string | undefined;

  do {
    const listResponse = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    const objects = listResponse.Contents;

    if (objects && objects.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: config.bucketName,
          Delete: {
            Objects: objects.map((obj) => ({ Key: obj.Key })),
            Quiet: true,
          },
        })
      );
    }

    continuationToken = listResponse.IsTruncated
      ? listResponse.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

/**
 * Returns the public CDN URL for a given R2 object key.
 */
export function getR2PublicUrl(key: string): string {
  const config = validateR2Config();
  // Ensure no double slashes between publicUrl and key
  const baseUrl = config.publicUrl.replace(/\/+$/, '');
  return `${baseUrl}/${key}`;
}
