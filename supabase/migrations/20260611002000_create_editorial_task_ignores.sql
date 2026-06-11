-- ============================================================
-- Editorial Task Ignores
-- Suppresses derived task queue items without mutating source data.
-- ============================================================

create table if not exists public.editorial_task_ignores (
  id uuid primary key default gen_random_uuid(),
  task_key text not null unique,
  task_type text not null,
  entity_type text not null,
  entity_id text,
  entity_name text,
  reason text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_editorial_task_ignores_task_type
  on public.editorial_task_ignores(task_type);

create index if not exists idx_editorial_task_ignores_entity
  on public.editorial_task_ignores(entity_type, entity_id);

alter table public.editorial_task_ignores enable row level security;

drop policy if exists "Authenticated users can view task ignores" on public.editorial_task_ignores;
create policy "Authenticated users can view task ignores"
  on public.editorial_task_ignores for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can manage task ignores" on public.editorial_task_ignores;
create policy "Authenticated users can manage task ignores"
  on public.editorial_task_ignores for all
  to authenticated
  using (true)
  with check (true);
