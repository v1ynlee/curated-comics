import type { MediaHealthIssue, MediaUsageType, StudioMediaAsset } from '@/app/studio/media/types';

export interface AssetHealthReport {
  score: number;
  color: 'green' | 'yellow' | 'red';
  storageStatus: string;
  metadataStatus: string;
  usageStatus: string;
  replacementSafety: string;
  localMirrorAvailable: boolean;
  duplicateGroup: string | null;
  issues: MediaHealthIssue[];
  relationshipCounts: Record<MediaUsageType, number>;
}

export function buildAssetHealthReport(asset: StudioMediaAsset, issues: MediaHealthIssue[]): AssetHealthReport {
  const assetIssues = issues.filter((issue) => issue.assetId === asset.id || (issue.objectKey && asset.canonicalPreviewUrl && issue.objectKey === asset.canonicalPreviewUrl));
  let score = 100;
  if (assetIssues.some((issue) => issue.severity === 'critical')) score -= 45;
  if (assetIssues.some((issue) => issue.severity === 'warning')) score -= 25;
  if (asset.usageCount === 0) score -= 10;
  if (asset.duplicateCount > 0) score -= 10;
  if (asset.archived) score -= 15;
  score = Math.max(0, Math.min(100, score));

  const relationshipCounts: Record<MediaUsageType, number> = { title: 0, creator: 0, article: 0, gallery: 0, character: 0 };
  for (const usage of asset.usages) relationshipCounts[usage.type] += 1;

  return {
    score,
    color: score >= 85 ? 'green' : score >= 60 ? 'yellow' : 'red',
    storageStatus: assetIssues.some((issue) => issue.type === 'missing-r2-object') ? 'object missing' : 'object exists',
    metadataStatus: asset.duplicateCount > 0 ? 'duplicate metadata' : 'registered',
    usageStatus: asset.usageCount > 0 ? 'referenced' : 'unused',
    replacementSafety: asset.usageCount >= 5 ? 'critical asset' : asset.usageCount > 0 ? 'high impact' : 'safe to replace',
    localMirrorAvailable: Boolean(asset.previewUrl?.startsWith('/platforms/')),
    duplicateGroup: asset.duplicateCount > 0 ? asset.hash : null,
    issues: assetIssues,
    relationshipCounts,
  };
}
