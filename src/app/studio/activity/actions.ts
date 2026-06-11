'use server';

import { getServerUser, createSupabaseServerClient } from '@/lib/db/supabase-server';
import { logStudioActivity, type LogActivityInput } from '@/services/studio/activity-log';
import type { ActivityFilter, ActivityItem } from './types';

interface ActivityRow {
  id: string;
  event_type: ActivityItem['eventType'];
  entity_type: ActivityItem['entityType'];
  entity_id: string | null;
  entity_name: string | null;
  actor_id: string | null;
  actor_name: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const FILTER_ENTITY_TYPES: Record<Exclude<ActivityFilter, 'all'>, string[]> = {
  titles: ['title'],
  articles: ['article'],
  creators: ['creator'],
  curation: ['curation', 'narrative', 'featured'],
  ai: ['ai'],
  drafts: ['draft'],
  qa: ['qa'],
};

function mapRow(row: ActivityRow): ActivityItem {
  return {
    id: row.id,
    eventType: row.event_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityName: row.entity_name,
    actorId: row.actor_id,
    actorName: row.actor_name,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export async function fetchActivityFeed(filter: ActivityFilter = 'all', search = ''): Promise<ActivityItem[]> {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('editorial_activity_log')
    .select('id, event_type, entity_type, entity_id, entity_name, actor_id, actor_name, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(120);

  if (filter !== 'all') {
    query = query.in('entity_type', FILTER_ENTITY_TYPES[filter]);
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    query = query.ilike('entity_name', `%${trimmedSearch}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as ActivityRow[]).map(mapRow);
}

export async function logStudioActivityAction(input: LogActivityInput) {
  await logStudioActivity(input);
  return { success: true };
}
