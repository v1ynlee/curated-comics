import { buildAssetHealthReport } from '@/services/studio/media-asset-health';
import type { MediaHealthIssue, StudioMediaAsset } from '@/app/studio/media/types';

function colorClass(color: 'green' | 'yellow' | 'red') {
  if (color === 'green') return 'text-semantic-success';
  if (color === 'yellow') return 'text-semantic-warning';
  return 'text-semantic-danger';
}

function Row({ label, value }: { label: string; value: string | number }) {
  return <div className="flex items-center justify-between gap-3"><span className="font-body text-xs text-text-tertiary">{label}</span><span className="break-all text-right font-body text-xs text-text-primary">{value}</span></div>;
}

export function AssetHealthPanel({ asset, healthIssues }: { asset: StudioMediaAsset; healthIssues: MediaHealthIssue[] }) {
  const report = buildAssetHealthReport(asset, healthIssues);
  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-sm font-semibold text-text-primary">Asset Health</h3>
        <span className={`font-data text-sm ${colorClass(report.color)}`}>{report.score}/100</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Row label="Storage" value={report.storageStatus} />
        <Row label="Local Mirror" value={report.localMirrorAvailable ? 'available' : 'not detected'} />
        <Row label="Metadata" value={report.metadataStatus} />
        <Row label="Usage" value={report.usageStatus} />
        <Row label="Replacement" value={report.replacementSafety} />
        <Row label="Duplicate Group" value={report.duplicateGroup ?? 'none'} />
        <Row label="Hash" value={asset.hash || 'unknown'} />
        <Row label="Uploaded" value={new Date(asset.createdAt).toLocaleDateString()} />
        <Row label="Modified" value={new Date(asset.updatedAt).toLocaleDateString()} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {Object.entries(report.relationshipCounts).map(([type, count]) => <Row key={type} label={`${type} relationships`} value={count} />)}
      </div>
      {report.issues.length > 0 && <div className="mt-4 space-y-2">{report.issues.map((issue) => <p key={issue.id} className="rounded-md border border-white/10 bg-bg-deep/35 px-3 py-2 font-body text-xs text-text-secondary">{issue.title}: {issue.detail}</p>)}</div>}
    </section>
  );
}
