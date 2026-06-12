import { buildAssetHealthReport } from './media-asset-health';
import type { MediaHealthIssue, StudioMediaAsset } from '@/app/studio/media/types';

export interface MediaSearchResult {
  asset: StudioMediaAsset;
  healthScore: number;
  health: 'green' | 'yellow' | 'red';
  canonicalPath: string | null;
}

export interface MediaSearchResponse {
  query: string;
  total: number;
  results: MediaSearchResult[];
  suggestions: string[];
}

function normalize(value: string) {
  return value.toLowerCase().replace(/_/g, '-');
}

function tokenValue(token: string, prefix: string) {
  return token.startsWith(`${prefix}:`) ? token.slice(prefix.length + 1) : null;
}

function scoreMatch(asset: StudioMediaAsset, token: string, score: number) {
  if (token.startsWith('score:<')) return score < Number(token.slice(7));
  if (token.startsWith('score:>')) return score > Number(token.slice(7));
  return true;
}

function matchesToken(asset: StudioMediaAsset, issues: MediaHealthIssue[], token: string, score: number, health: string) {
  const normalized = normalize(token);
  const type = tokenValue(normalized, 'type');
  if (type) return normalize(asset.assetType).includes(type);
  const hash = tokenValue(normalized, 'hash') ?? tokenValue(normalized, 'duplicate-group');
  if (hash) return normalize(asset.hash).includes(hash);
  const folder = tokenValue(normalized, 'folder');
  if (folder) return normalize(asset.r2BasePath ?? asset.canonicalPreviewUrl ?? '').includes(folder);
  const provider = tokenValue(normalized, 'provider');
  if (provider) return normalize(asset.storageProvider).includes(provider);
  const healthValue = tokenValue(normalized, 'health');
  if (healthValue) return health === healthValue;
  if (normalized.startsWith('score:')) return scoreMatch(asset, normalized, score);
  if (normalized === 'unused') return asset.usageCount === 0;
  if (normalized === 'archived') return asset.archived;
  if (normalized === 'active') return !asset.archived;
  if (normalized === 'duplicate') return asset.duplicateCount > 0;
  if (normalized === 'missing-r2') return issues.some((issue) => issue.assetId === asset.id && issue.type === 'missing-r2-object');
  if (normalized === 'missing-metadata' || normalized === 'orphan') return issues.some((issue) => issue.objectKey && issue.type === 'missing-db-metadata');
  for (const prefix of ['title', 'creator', 'character', 'gallery', 'article', 'creator-role']) {
    const value = tokenValue(normalized, prefix);
    if (value) return asset.usages.some((usage) => normalize(`${usage.type} ${usage.label} ${usage.subtitle ?? ''} ${usage.field}`).includes(value));
  }
  if (normalized.startsWith('created:') || normalized.startsWith('modified:')) return true;
  return normalize(`${asset.slug} ${asset.assetType} ${asset.hash} ${asset.r2BasePath ?? ''}`).includes(normalized);
}

export function searchMediaAssets(query: string, assets: StudioMediaAsset[], issues: MediaHealthIssue[], limit = 50): MediaSearchResponse {
  const tokens = query.split(/\s+/).map((token) => token.trim()).filter(Boolean);
  const results: MediaSearchResult[] = [];

  for (const asset of assets) {
    const report = buildAssetHealthReport(asset, issues);
    if (tokens.every((token) => matchesToken(asset, issues, token, report.score, report.color))) {
      results.push({ asset, healthScore: report.score, health: report.color, canonicalPath: asset.canonicalPreviewUrl });
    }
  }

  results.sort((a, b) => b.healthScore - a.healthScore || new Date(b.asset.updatedAt).getTime() - new Date(a.asset.updatedAt).getTime());

  return {
    query,
    total: results.length,
    results: results.slice(0, limit),
    suggestions: ['unused type:character-image', 'missing-r2 health:red', 'duplicate provider:r2', 'title:solo-leveling type:gallery-image', 'score:<60 active'],
  };
}
