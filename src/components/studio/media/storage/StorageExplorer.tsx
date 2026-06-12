'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Folder, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { reconcileMediaIssue } from '@/app/studio/media/actions';
import type { MediaHealthIssue, StorageExplorerFolder, StudioMediaAsset } from '@/app/studio/media/types';

function formatBytes(value: number) {
  if (value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function actionFor(issue: MediaHealthIssue) {
  if (issue.type === 'missing-db-metadata') return 'Register Metadata';
  if (issue.type === 'missing-r2-object') return 'Replace Missing Object';
  if (issue.type === 'broken-reference') return 'Relink Asset';
  if (issue.type === 'unused-asset') return 'Archive Asset';
  if (issue.type === 'orphan-asset') return 'Delete Orphan';
  return 'Review Issue';
}

function toneClass(severity: MediaHealthIssue['severity']) {
  if (severity === 'critical') return 'text-semantic-danger';
  if (severity === 'warning') return 'text-semantic-warning';
  return 'text-text-secondary';
}

export function StorageExplorer({ folders, healthIssues, assets }: { folders: StorageExplorerFolder[]; healthIssues: MediaHealthIssue[]; assets: StudioMediaAsset[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function fixIssue(issue: MediaHealthIssue) {
    const action = actionFor(issue);
    if (!window.confirm(`${action}? This will update storage or metadata and write an activity log entry.`)) return;
    startTransition(async () => {
      const result = await reconcileMediaIssue(issue);
      if (result.success) {
        toast.success(`${action} complete.`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

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
          {healthIssues.slice(0, 12).map((issue) => {
            const asset = issue.assetId ? assets.find((item) => item.id === issue.assetId) : null;
            return (
            <div key={issue.id} className="rounded-md border border-white/10 bg-bg-deep/35 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-sm text-text-primary">{issue.title}</p>
                <span className={`font-data text-xs ${toneClass(issue.severity)}`}>{issue.severity}</span>
              </div>
              <p className="mt-1 truncate font-body text-xs text-text-secondary">{issue.detail}</p>
              <div className="mt-2 grid gap-1 font-body text-xs text-text-tertiary sm:grid-cols-3">
                <span>Detected: {new Date(issue.updatedAt).toLocaleDateString()}</span>
                <span>Affected: {asset?.slug ?? issue.objectKey ?? 'Unknown'}</span>
                <span>Action: {actionFor(issue)}</span>
              </div>
              <button type="button" disabled={pending} onClick={() => fixIssue(issue)} className="mt-3 h-8 rounded-md border border-white/10 px-3 font-body text-xs text-text-secondary hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">Fix</button>
            </div>
            );
          })}
          {healthIssues.length === 0 && <p className="font-body text-sm text-text-secondary">No R2 storage health issues detected.</p>}
        </div>
      </section>
    </div>
  );
}
