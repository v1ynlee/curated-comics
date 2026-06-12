'use client';

import { Archive, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StudioMediaAsset } from '@/app/studio/media/types';

function formatBytes(value: number) {
  if (value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function AssetCard({ asset, selected, onSelect, onPreview, onArchive, onDelete }: { asset: StudioMediaAsset; selected: boolean; onSelect: (checked: boolean) => void; onPreview: () => void; onArchive: () => void; onDelete: () => void }) {
  return (
    <article className={cn('overflow-hidden rounded-lg border bg-bg-surface/35', selected ? 'border-accent-primary/60' : 'border-white/10')}>
      <button type="button" onClick={onPreview} className="block aspect-[4/3] w-full bg-bg-deep text-left" style={{ backgroundColor: asset.dominantColor ?? undefined }}>
        {asset.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.previewUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full items-center justify-center font-body text-xs text-text-tertiary">No preview</span>
        )}
      </button>
      <div className="space-y-3 p-3">
        <div className="flex items-start gap-2">
          <input type="checkbox" checked={selected} onChange={(event) => onSelect(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-bg-deep" aria-label={`Select ${asset.slug}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-medium text-text-primary">{asset.slug}</p>
            <p className="mt-1 font-body text-xs capitalize text-text-tertiary">{asset.assetType.replace(/[-_]/g, ' ')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-text-tertiary">
          <span>{formatBytes(asset.fileSizeTotal)}</span>
          <span>{asset.usageCount} use{asset.usageCount === 1 ? '' : 's'}</span>
          {asset.duplicateCount > 0 && <span>{asset.duplicateCount} duplicate{asset.duplicateCount === 1 ? '' : 's'}</span>}
          {asset.archived && <span>archived</span>}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <button type="button" onClick={onPreview} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-body text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Preview</button>
          <div className="flex gap-1">
            <button type="button" onClick={onArchive} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary" aria-label={asset.archived ? 'Restore asset' : 'Archive asset'}><Archive className="h-3.5 w-3.5" aria-hidden="true" /></button>
            <button type="button" onClick={onDelete} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-semantic-danger hover:bg-semantic-danger/10" aria-label="Delete asset"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}
