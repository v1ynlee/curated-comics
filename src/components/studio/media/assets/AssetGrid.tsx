'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { archiveMediaAsset, archiveMediaAssets, deleteMediaAsset } from '@/app/studio/media/actions';
import type { AssetType } from '@/types/media';
import type { StudioMediaAsset } from '@/app/studio/media/types';
import { AssetBulkActions } from './AssetBulkActions';
import { AssetCard } from './AssetCard';
import { AssetFilters, type AssetUsageFilter } from './AssetFilters';
import { AssetPreviewDrawer } from './AssetPreviewDrawer';

export function AssetGrid({ assets }: { assets: StudioMediaAsset[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<AssetType | 'all'>('all');
  const [usage, setUsage] = useState<AssetUsageFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<StudioMediaAsset | null>(null);
  const [pending, startTransition] = useTransition();
  const types = useMemo(() => Array.from(new Set(assets.map((asset) => asset.assetType))).sort(), [assets]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (type !== 'all' && asset.assetType !== type) return false;
      if (usage === 'used' && asset.usageCount === 0) return false;
      if (usage === 'unused' && asset.usageCount > 0) return false;
      if (usage === 'duplicates' && asset.duplicateCount === 0) return false;
      if (usage === 'archived' && !asset.archived) return false;
      if (!normalizedQuery) return true;
      return [asset.slug, asset.assetType, asset.mimeType ?? '', asset.hash].join(' ').toLowerCase().includes(normalizedQuery);
    });
  }, [assets, query, type, usage]);

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id));
  }

  function runArchive(asset: StudioMediaAsset) {
    startTransition(async () => {
      const result = await archiveMediaAsset(asset.id, !asset.archived);
      if (result.success) {
        toast.success(asset.archived ? 'Asset restored.' : 'Asset archived.');
        router.refresh();
      } else toast.error(result.error);
    });
  }

  function runDelete(asset: StudioMediaAsset) {
    startTransition(async () => {
      const result = await deleteMediaAsset(asset.id);
      if (result.success) {
        toast.success('Asset deleted.');
        router.refresh();
      } else toast.error(result.error);
    });
  }

  function runBulkArchive() {
    startTransition(async () => {
      const result = await archiveMediaAssets(selectedIds);
      if (result.success) {
        toast.success(`${selectedIds.length} asset${selectedIds.length === 1 ? '' : 's'} archived.`);
        setSelectedIds([]);
        router.refresh();
      } else toast.error(result.error);
    });
  }

  const selectedAssets = assets.filter((asset) => selectedIds.includes(asset.id));

  return (
    <div className={pending ? 'opacity-80' : undefined}>
      <div className="space-y-3">
        <AssetFilters query={query} type={type} usage={usage} types={types} onQueryChange={setQuery} onTypeChange={setType} onUsageChange={setUsage} />
        <AssetBulkActions selectedAssets={selectedAssets} onArchiveSelected={runBulkArchive} onClear={() => setSelectedIds([])} />
      </div>
      {filtered.length === 0 ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-bg-surface/35 px-4 py-12 text-center font-body text-sm text-text-secondary">No assets match this view.</div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} selected={selectedIds.includes(asset.id)} onSelect={(checked) => toggleSelected(asset.id, checked)} onPreview={() => setPreview(asset)} onArchive={() => runArchive(asset)} onDelete={() => runDelete(asset)} />
          ))}
        </div>
      )}
      {preview && <AssetPreviewDrawer asset={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
