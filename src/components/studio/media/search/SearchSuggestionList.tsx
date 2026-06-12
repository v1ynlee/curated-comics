export function SearchSuggestionList({ suggestions, onSelect }: { suggestions: string[]; onSelect: (query: string) => void }) {
  if (suggestions.length === 0) return null;
  return <div className="flex flex-wrap gap-2">{suggestions.map((item) => <button key={item} type="button" onClick={() => onSelect(item)} className="rounded-md border border-white/10 px-2 py-1 font-body text-xs text-text-secondary hover:bg-white/5">{item}</button>)}</div>;
}
