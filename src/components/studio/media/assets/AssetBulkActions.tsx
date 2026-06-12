'use client';

import type { StudioMediaAsset } from '@/app/studio/media/types';

export function AssetBulkActions({
  selectedAssets,
  onArchiveSelected,
  onClear,
}: {
  selectedAssets: StudioMediaAsset[];
  onArchiveSelected: () => void;
  onClear: () => void;
}) {
  if (selectedAssets.length === 0) return null;

  function exportList() {
    const rows = [
      ['slug', 'asset_type', 'usage_count', 'duplicate_count', 'file_size_total', 'archived', 'updated_at'],
      ...selectedAssets.map((asset) => [asset.slug, asset.assetType, asset.usageCount, asset.duplicateCount, asset.fileSizeTotal, asset.archived, asset.updatedAt]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'media-assets.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const selectedCount = selectedAssets.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-accent-primary/25 bg-accent-primary/10 p-3 md:flex-row md:items-center md:justify-between">
      <p className="font-body text-sm text-text-primary">{selectedCount} asset{selectedCount === 1 ? '' : 's'} selected</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onArchiveSelected} className="rounded-md border border-white/10 px-3 py-2 font-body text-xs text-text-secondary hover:bg-white/5">Archive selected</button>
        <button type="button" onClick={exportList} className="rounded-md border border-white/10 px-3 py-2 font-body text-xs text-text-secondary hover:bg-white/5">Export list</button>
        <button type="button" onClick={onClear} className="rounded-md px-3 py-2 font-body text-xs text-text-tertiary hover:text-text-primary">Clear</button>
      </div>
    </div>
  );
}
