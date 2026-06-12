'use client';

import { useState } from 'react';
import { AssetPreviewDrawer } from '@/components/studio/media/assets/AssetPreviewDrawer';
import type { MediaSearchResult } from '@/services/studio/media-search';
import type { MediaHealthIssue, StudioMediaAsset } from '@/app/studio/media/types';

function colorClass(color: MediaSearchResult['health']) {
  if (color === 'green') return 'text-semantic-success';
  if (color === 'yellow') return 'text-semantic-warning';
  return 'text-semantic-danger';
}

export function MediaSearchResults({ results, total, healthIssues }: { results: MediaSearchResult[]; total: number; healthIssues: MediaHealthIssue[] }) {
  const [preview, setPreview] = useState<StudioMediaAsset | null>(null);
  if (total === 0) return <p className="rounded-lg border border-white/10 bg-bg-surface/35 p-4 font-body text-sm text-text-secondary">No search results.</p>;
  return (
    <div className="space-y-3">
      <p className="font-body text-xs text-text-tertiary">Showing {results.length} of {total} result{total === 1 ? '' : 's'}.</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {results.map((result) => (
          <button key={result.asset.id} type="button" onClick={() => setPreview(result.asset)} className="rounded-lg border border-white/10 bg-bg-surface/35 p-3 text-left hover:bg-white/[0.03]">
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.asset.previewUrl ?? ''} alt="" className="h-14 w-14 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm text-text-primary">{result.asset.slug}</p>
                <p className="mt-1 font-body text-xs text-text-secondary">{result.asset.assetType} · {result.asset.storageProvider}</p>
                <p className="mt-1 truncate font-data text-xs text-text-tertiary">{result.canonicalPath ?? 'No canonical path'}</p>
              </div>
              <span className={`font-data text-xs ${colorClass(result.health)}`}>{result.healthScore}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 font-body text-xs text-text-tertiary"><span>Usage {result.asset.usageCount}</span><span>Modified {new Date(result.asset.updatedAt).toLocaleDateString()}</span><span>Preview</span></div>
          </button>
        ))}
      </div>
      {preview && <AssetPreviewDrawer asset={preview} healthIssues={healthIssues} onClose={() => setPreview(null)} />}
    </div>
  );
}
