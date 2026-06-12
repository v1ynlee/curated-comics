import { AlertTriangle, Folder, HardDrive } from 'lucide-react';
import type { MediaHealthIssue, StorageExplorerFolder } from '@/app/studio/media/types';

function formatBytes(value: number) {
  if (value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function StorageExplorer({ folders, healthIssues }: { folders: StorageExplorerFolder[]; healthIssues: MediaHealthIssue[] }) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">platforms</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-text-tertiary">
              <tr>
                <th className="px-3 py-2 font-medium">Folder</th>
                <th className="px-3 py-2 font-medium">Files</th>
                <th className="px-3 py-2 font-medium">Storage</th>
                <th className="px-3 py-2 font-medium">Last Uploaded</th>
                <th className="px-3 py-2 font-medium">Orphan</th>
                <th className="px-3 py-2 font-medium">Unused</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {folders.map((folder) => (
                <tr key={folder.id} className="hover:bg-white/[0.03]">
                  <td className="px-3 py-3 font-body text-text-primary"><span className="inline-flex items-center gap-2"><Folder className="h-4 w-4 text-text-tertiary" aria-hidden="true" />{folder.name}</span></td>
                  <td className="px-3 py-3 font-data text-text-secondary">{folder.fileCount.toLocaleString()}</td>
                  <td className="px-3 py-3 font-data text-text-secondary">{formatBytes(folder.totalSize)}</td>
                  <td className="px-3 py-3 font-body text-xs text-text-tertiary">{folder.lastUploadedAsset?.key ?? 'None'}</td>
                  <td className="px-3 py-3 font-data text-text-secondary">{folder.orphanAssetCount}</td>
                  <td className="px-3 py-3 font-data text-text-secondary">{folder.unusedAssetCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">Storage Health</h2>
        </div>
        <div className="mt-4 space-y-2">
          {healthIssues.slice(0, 12).map((issue) => (
            <div key={issue.id} className="rounded-md border border-white/10 bg-bg-deep/35 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-sm text-text-primary">{issue.title}</p>
                <span className="font-data text-xs text-text-tertiary">{issue.type}</span>
              </div>
              <p className="mt-1 truncate font-body text-xs text-text-secondary">{issue.detail}</p>
            </div>
          ))}
          {healthIssues.length === 0 && <p className="font-body text-sm text-text-secondary">No R2 storage health issues detected.</p>}
        </div>
      </section>
    </div>
  );
}
