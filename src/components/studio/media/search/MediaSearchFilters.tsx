export function MediaSearchFilters({ onSelect }: { onSelect: (query: string) => void }) {
  const filters = ['unused', 'missing-r2', 'duplicate', 'archived', 'active', 'health:red', 'health:yellow', 'type:title-cover', 'type:gallery-image'];
  return <div className="flex flex-wrap gap-2">{filters.map((filter) => <button key={filter} type="button" onClick={() => onSelect(filter)} className="rounded-md border border-white/10 px-2 py-1 font-body text-xs text-text-secondary hover:bg-white/5">{filter}</button>)}</div>;
}
