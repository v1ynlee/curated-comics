'use client';

import { Search } from 'lucide-react';
import type { AssetType } from '@/types/media';

export type AssetUsageFilter = 'all' | 'used' | 'unused' | 'duplicates' | 'archived';

interface AssetFiltersProps {
  query: string;
  type: AssetType | 'all';
  usage: AssetUsageFilter;
  types: AssetType[];
  onQueryChange: (value: string) => void;
  onTypeChange: (value: AssetType | 'all') => void;
  onUsageChange: (value: AssetUsageFilter) => void;
}

export function AssetFilters({ query, type, usage, types, onQueryChange, onTypeChange, onUsageChange }: AssetFiltersProps) {
  return (
    <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_180px_180px]">
      <label className="relative block min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search assets" className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-3 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60" />
      </label>
      <select value={type} onChange={(event) => onTypeChange(event.target.value as AssetType | 'all')} className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60">
        <option value="all">All types</option>
        {types.map((item) => <option key={item} value={item}>{item.replace(/[-_]/g, ' ')}</option>)}
      </select>
      <select value={usage} onChange={(event) => onUsageChange(event.target.value as AssetUsageFilter)} className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60">
        <option value="all">All usage</option>
        <option value="used">Used</option>
        <option value="unused">Unused</option>
        <option value="duplicates">Duplicates</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  );
}
