import { AlertTriangle, Database, HardDrive, Image as ImageIcon, Link2Off } from 'lucide-react';
import type { MediaStatsData } from '@/app/studio/media/types';

function formatBytes(value: number) {
  if (value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function MediaStats({ stats }: { stats: MediaStatsData }) {
  const items = [
    { label: 'Total Assets', value: stats.totalAssets.toString(), icon: ImageIcon },
    { label: 'Storage Used', value: formatBytes(stats.storageUsed), icon: HardDrive },
    { label: 'Unused Assets', value: stats.unusedAssets.toString(), icon: Link2Off },
    { label: 'Duplicate Assets', value: stats.duplicateAssets.toString(), icon: Database },
    { label: 'Broken Assets', value: stats.brokenAssets.toString(), icon: AlertTriangle },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-body text-sm text-text-secondary">{item.label}</p>
              <Icon className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
            </div>
            <p className="mt-3 font-data text-2xl text-text-primary">{item.value}</p>
          </div>
        );
      })}
    </section>
  );
}
