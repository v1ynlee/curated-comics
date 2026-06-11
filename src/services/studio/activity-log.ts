import { createSupabaseServerClient, getServerUser } from '@/lib/db/supabase-server';

export type ActivityEventType =
  | 'AI_AUTOFILL_APPLIED'
  | 'AI_AUTOFILL_REJECTED'
  | 'DRAFT_SAVED'
  | 'DRAFT_RESTORED'
  | 'DRAFT_DELETED'
  | 'TITLE_CREATED'
  | 'TITLE_UPDATED'
  | 'TITLE_ARCHIVED'
  | 'ARTICLE_CREATED'
  | 'ARTICLE_UPDATED'
  | 'ARTICLE_PUBLISHED'
  | 'ARTICLE_SCHEDULED'
  | 'CREATOR_CREATED'
  | 'CREATOR_UPDATED'
  | 'CREATOR_ARCHIVED'
  | 'FEATURED_TITLE_ADDED'
  | 'FEATURED_TITLE_REMOVED'
  | 'FEATURED_CREATOR_ADDED'
  | 'FEATURED_CREATOR_REMOVED'
  | 'NARRATIVE_CREATED'
  | 'NARRATIVE_UPDATED'
  | 'NARRATIVE_DELETED'
  | 'QA_ACTION_APPLIED';

export type ActivityEntityType = 'title' | 'article' | 'creator' | 'curation' | 'narrative' | 'featured' | 'qa' | 'draft' | 'ai';

export interface LogActivityInput {
  eventType: ActivityEventType;
  entityType: ActivityEntityType;
  entityId?: string | null;
  entityName?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logStudioActivity(input: LogActivityInput) {
  try {
    const user = await getServerUser();
    if (!user) return;

    const supabase = await createSupabaseServerClient();
    const actorName = user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? 'Studio user';

    const { error } = await supabase.from('editorial_activity_log').insert({
      event_type: input.eventType,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      entity_name: input.entityName ?? null,
      actor_id: user.id,
      actor_name: actorName,
      metadata: input.metadata ?? {},
    });

    if (error) {
      console.error('Failed to log studio activity:', error.message);
    }
  } catch (error) {
    console.error('Failed to log studio activity:', error);
  }
}
