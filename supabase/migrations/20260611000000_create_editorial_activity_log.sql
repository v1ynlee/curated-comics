-- ============================================================
-- Editorial Activity Log
-- Studio-wide audit trail for editorial actions.
-- ============================================================

create table if not exists public.editorial_activity_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id text,
  entity_name text,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_editorial_activity_log_created_at
  on public.editorial_activity_log(created_at desc);

create index if not exists idx_editorial_activity_log_event_type
  on public.editorial_activity_log(event_type);

create index if not exists idx_editorial_activity_log_entity
  on public.editorial_activity_log(entity_type, entity_id);

create index if not exists idx_editorial_activity_log_metadata
  on public.editorial_activity_log using gin(metadata);

alter table public.editorial_activity_log enable row level security;

drop policy if exists "Authenticated users can view editorial activity" on public.editorial_activity_log;
create policy "Authenticated users can view editorial activity"
  on public.editorial_activity_log for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert editorial activity" on public.editorial_activity_log;
create policy "Authenticated users can insert editorial activity"
  on public.editorial_activity_log for insert
  to authenticated
  with check (auth.uid() = actor_id);
