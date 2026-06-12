'use client';

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { StudioMediaAsset } from '@/app/studio/media/types';

const GALLERY_ASSET_TYPES = new Set(['gallery_image', 'cover', 'title_cover', 'article-image', 'thumbnail']);

export function GalleryAssetPicker({
  assets,
  selectedAssetId,
  onSelect,
}: {
  assets: StudioMediaAsset[];
  selectedAssetId: string | null;
  onSelect: (assetId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assets
      .filter((asset) => !asset.archived && asset.previewUrl && GALLERY_ASSET_TYPES.has(asset.assetType))
      .filter((asset) => !normalizedQuery || `${asset.slug} ${asset.assetType}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 18);
  }, [assets, query]);

  return (
    <div className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
      <label className="font-heading text-sm font-semibold text-text-primary" htmlFor="gallery-asset-search">Asset Library</label>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
        <input
          id="gallery-asset-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search gallery assets"
          className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60"
        />
      </div>
      <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-6">
        {filtered.map((asset) => {
          const selected = asset.id === selectedAssetId;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset.id)}
              className={`overflow-hidden rounded-md border text-left transition-colors ${selected ? 'border-accent-primary bg-accent-primary/10' : 'border-white/10 bg-bg-deep/45 hover:border-white/25'}`}
            >
              <img src={asset.previewUrl ?? ''} alt="" className="aspect-square w-full object-cover" loading="lazy" />
              <span className="block truncate px-2 py-1.5 font-body text-xs text-text-secondary">{asset.slug}</span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="mt-3 font-body text-sm text-text-secondary">No reusable gallery assets match this search.</p>}
    </div>
  );
}
