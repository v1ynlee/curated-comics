'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { searchStudioMedia } from '@/app/studio/media/search-actions';
import { MediaSearchBar } from './MediaSearchBar';
import { MediaSearchFilters } from './MediaSearchFilters';
import { MediaSearchResults } from './MediaSearchResults';
import { SearchQueryHelp } from './SearchQueryHelp';
import { SearchSuggestionList } from './SearchSuggestionList';
import type { MediaHealthIssue } from '@/app/studio/media/types';
import type { MediaSearchResponse } from '@/services/studio/media-search';

export function MediaSearchPanel({ healthIssues }: { healthIssues: MediaHealthIssue[] }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<MediaSearchResponse | null>(null);
  const [pending, startTransition] = useTransition();

  function runSearch(nextQuery = query) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setResponse(null);
      return;
    }
    setQuery(trimmed);
    startTransition(async () => {
      try {
        setResponse(await searchStudioMedia(trimmed));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Media search failed.');
      }
    });
  }

  return (
    <section className="mb-5 space-y-3 rounded-lg border border-white/10 bg-bg-surface/30 p-4">
      <MediaSearchBar query={query} pending={pending} onQueryChange={setQuery} onSubmit={() => runSearch()} />
      <SearchQueryHelp />
      <MediaSearchFilters onSelect={runSearch} />
      <SearchSuggestionList suggestions={response?.suggestions ?? []} onSelect={runSearch} />
      {response && <MediaSearchResults results={response.results} total={response.total} healthIssues={healthIssues} />}
    </section>
  );
}
