import { Search } from 'lucide-react';

export function MediaSearchBar({ query, pending, onQueryChange, onSubmit }: { query: string; pending: boolean; onQueryChange: (query: string) => void; onSubmit: () => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
      <input value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onSubmit(); }} placeholder="Search media relationships, storage, health, or hash" className="h-10 w-full rounded-md border border-white/10 bg-bg-deep/50 pl-9 pr-24 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60" />
      <button type="button" onClick={onSubmit} disabled={pending} className="absolute right-1 top-1 h-8 rounded-md bg-accent-primary px-3 font-heading text-xs text-white disabled:cursor-not-allowed disabled:opacity-60">Search</button>
    </div>
  );
}
