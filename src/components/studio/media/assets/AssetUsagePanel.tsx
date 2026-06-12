import Link from 'next/link';
import type { MediaUsageRecord } from '@/app/studio/media/types';

export function AssetUsagePanel({ usages }: { usages: MediaUsageRecord[] }) {
  if (usages.length === 0) {
    return <p className="rounded-lg border border-white/10 bg-bg-surface/35 p-4 font-body text-sm text-text-secondary">No usage references detected. This asset may be unused or orphaned.</p>;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-bg-surface/35">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="font-heading text-sm font-semibold text-text-primary">Used By</h3>
      </div>
      <div className="divide-y divide-white/10">
        {usages.map((usage) => (
          <Link key={`${usage.type}:${usage.id}:${usage.field}`} href={usage.href} className="grid gap-1 px-4 py-3 transition-colors hover:bg-white/[0.03]">
            <span className="font-body text-xs capitalize text-text-tertiary">{usage.type} · {usage.field}</span>
            <span className="font-body text-sm font-medium text-text-primary">{usage.label}</span>
            {usage.subtitle && <span className="font-body text-xs text-text-secondary">{usage.subtitle}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
