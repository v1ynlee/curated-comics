export type StudioTaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type StudioTaskFilter = 'all' | 'titles' | 'articles' | 'creators' | 'narratives' | 'ai' | 'qa';
export type StudioTaskSource = 'qa' | 'ai' | 'draft' | 'article' | 'creator' | 'narrative';
export type StudioTaskEntityType = 'title' | 'article' | 'creator' | 'narrative' | 'ai' | 'draft';

export interface StudioTask {
  id: string;
  priority: StudioTaskPriority;
  source: StudioTaskSource;
  entityType: StudioTaskEntityType;
  entityId: string | null;
  entityName: string;
  issue: string;
  detail: string | null;
  createdAt: string;
  openHref: string;
  resolveHref: string;
  assignHref: string | null;
  metadata?: Record<string, unknown>;
}
