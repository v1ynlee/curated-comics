'use client';

import { X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { AssetUsagePanel } from './AssetUsagePanel';
import { AssetReplaceDialog } from './AssetReplaceDialog';
import { AssetHealthPanel } from './AssetHealthPanel';
import type { MediaHealthIssue, StudioMediaAsset } from '@/app/studio/media/types';

function formatBytes(value: number) {
  if (value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function AssetPreviewDrawer({ asset, healthIssues, onClose }: { asset: StudioMediaAsset; healthIssues: MediaHealthIssue[]; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed left-0 top-0 z-modal h-[100dvh] w-[100dvw] bg-black/55" role="dialog" aria-modal="true" aria-label="Asset preview">
        <button type="button" className="absolute inset-0 cursor-default" aria-label="Close asset preview" onClick={onClose} />
        <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-2xl flex-col border-l border-white/10 bg-bg-deep">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5">
            <div className="min-w-0">
              <h2 className="truncate font-heading text-xl font-semibold text-text-primary">{asset.slug}</h2>
              <p className="mt-1 font-body text-sm capitalize text-text-secondary">{asset.assetType.replace(/[-_]/g, ' ')}</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-text-tertiary hover:bg-white/5 hover:text-text-primary" aria-label="Close asset preview"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-bg-surface/35" style={{ backgroundColor: asset.dominantColor ?? undefined }}>
              {asset.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.previewUrl} alt="" className="max-h-[360px] w-full object-contain" />
              ) : <div className="flex h-56 items-center justify-center font-body text-sm text-text-tertiary">No preview available</div>}
            </div>
            <dl className="grid gap-3 rounded-lg border border-white/10 bg-bg-surface/35 p-4 sm:grid-cols-2">
              <Info label="Dimensions" value={asset.originalWidth && asset.originalHeight ? `${asset.originalWidth} x ${asset.originalHeight}` : 'Unknown'} />
              <Info label="Size" value={formatBytes(asset.fileSizeTotal)} />
              <Info label="MIME" value={asset.mimeType ?? 'Unknown'} />
              <Info label="Provider" value={asset.storageProvider} />
              <Info label="Usage Count" value={asset.usageCount.toString()} />
              <Info label="Hash" value={asset.hash || 'Unknown'} />
            </dl>
            <AssetHealthPanel asset={asset} healthIssues={healthIssues} />
            <AssetReplaceDialog asset={asset} />
            <AssetUsagePanel usages={asset.usages} />
          </div>
        </aside>
      </div>
    </ModalPortal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="font-body text-xs text-text-tertiary">{label}</dt><dd className="mt-1 break-all font-body text-sm text-text-primary">{value}</dd></div>;
}
