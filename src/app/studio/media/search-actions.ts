'use server';

import { fetchMediaWorkspaceData } from './actions';
import { searchMediaAssets, type MediaSearchResponse } from '@/services/studio/media-search';

export async function searchStudioMedia(query: string): Promise<MediaSearchResponse> {
  const data = await fetchMediaWorkspaceData();
  return searchMediaAssets(query, data.assets, data.healthIssues);
}
