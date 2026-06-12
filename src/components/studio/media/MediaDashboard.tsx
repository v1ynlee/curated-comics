'use client';

import { useState } from 'react';
import { AssetGrid } from '@/components/studio/media/assets/AssetGrid';
import { CharacterDashboard } from '@/components/studio/media/characters/CharacterDashboard';
import { GalleryDashboard } from '@/components/studio/media/gallery/GalleryDashboard';
import { StorageExplorer } from '@/components/studio/media/storage/StorageExplorer';
import { UploadDropzone } from '@/components/studio/media/upload/UploadDropzone';
import { MediaStats } from './MediaStats';
import { MediaTabs } from './MediaTabs';
import type { MediaTab, MediaWorkspaceData } from '@/app/studio/media/types';

function formatBytes(value: number) {
  if (value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function MediaDashboard({ data, initialTab }: { data: MediaWorkspaceData; initialTab: MediaTab }) {
  const [activeTab, setActiveTab] = useState<MediaTab>(initialTab);

  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">Media</h1>
          <p className="mt-1 max-w-2xl font-body text-sm text-text-secondary">
            Central workspace for assets, gallery images, character images, usage, storage, and media health.
          </p>
        </div>
        <div className="w-full lg:w-[360px]">
          <UploadDropzone />
        </div>
      </div>

      <MediaStats stats={data.stats} />

      <div className="mt-6 rounded-lg border border-white/10 bg-bg-surface/30">
        <MediaTabs activeTab={activeTab} onChange={setActiveTab} />
        <div className="p-4 md:p-5">
          {activeTab === 'assets' && <AssetGrid assets={data.assets} />}
          {activeTab === 'gallery' && <GalleryDashboard galleries={data.galleries} assets={data.assets} />}
          {activeTab === 'characters' && <CharacterDashboard characters={data.characters} assets={data.assets} />}
          {activeTab === 'storage-explorer' && <StorageExplorer folders={data.storageExplorer} healthIssues={data.healthIssues} />}
          {activeTab === 'storage' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
                <h2 className="font-heading text-lg font-semibold text-text-primary">Storage Monitoring</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Total files" value={data.storage.totalFiles.toLocaleString()} />
                  <Row label="Storage used" value={formatBytes(data.storage.storageUsed)} />
                  <Row label="Average asset size" value={formatBytes(data.storage.averageAssetSize)} />
                  <Row label="Unused storage" value={formatBytes(data.storage.unusedStorage)} />
                  <Row label="Potential duplicate savings" value={formatBytes(data.storage.potentialSavings)} />
                  <Row label="Broken assets" value={data.storage.brokenAssets.toString()} />
                  <Row label="Orphan assets" value={data.storage.orphanAssets.toString()} />
                </dl>
              </section>
              <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
                <h2 className="font-heading text-lg font-semibold text-text-primary">Largest R2 Objects</h2>
                <div className="mt-4 space-y-2">
                  {data.storage.largestObjects.map((object) => <Row key={object.key} label={object.key} value={formatBytes(object.size)} />)}
                  {data.storage.largestObjects.length === 0 && data.storage.largestAssets.map((asset) => <Row key={asset.id} label={asset.slug} value={formatBytes(asset.fileSizeTotal)} />)}
                </div>
              </section>
            </div>
          )}
          {activeTab === 'usage' && (
            <div className="space-y-5">
              <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
                <h2 className="font-heading text-lg font-semibold text-text-primary">Usage Analytics</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Metric label="Most Used Asset" value={[...data.assets].sort((a, b) => b.usageCount - a.usageCount)[0]?.slug ?? 'None'} />
                  <Metric label="Unused Images" value={data.stats.unusedAssets.toString()} />
                  <Metric label="Duplicate Hashes" value={data.stats.duplicateAssets.toString()} />
                </div>
              </section>
              <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
                <h2 className="font-heading text-lg font-semibold text-text-primary">Unused Assets</h2>
                <div className="mt-4 grid gap-2">
                  {data.assets.filter((asset) => asset.usageCount === 0).slice(0, 12).map((asset) => <Row key={asset.id} label={asset.slug} value={asset.assetType} />)}
                  {data.assets.every((asset) => asset.usageCount > 0) && <p className="font-body text-sm text-text-secondary">No unused assets detected.</p>}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="truncate font-body text-sm text-text-secondary">{label}</span><span className="shrink-0 font-data text-sm text-text-primary">{value}</span></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-bg-deep/40 p-3"><p className="font-body text-xs text-text-tertiary">{label}</p><p className="mt-2 truncate font-data text-lg text-text-primary">{value}</p></div>;
}
