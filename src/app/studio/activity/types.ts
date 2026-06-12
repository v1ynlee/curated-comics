import type { ActivityEntityType, ActivityEventType } from '@/services/studio/activity-log';

export type ActivityFilter = 'all' | 'titles' | 'articles' | 'creators' | 'media' | 'curation' | 'ai' | 'drafts' | 'qa';

export interface ActivityItem {
  id: string;
  eventType: ActivityEventType;
  entityType: ActivityEntityType;
  entityId: string | null;
  entityName: string | null;
  actorId: string | null;
  actorName: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
