-- ============================================================
-- Editorial QA Ignores
-- Allows Studio editors to intentionally suppress known QA items.
-- ============================================================

create table if not exists public.editorial_qa_ignores (
  id uuid primary key default gen_random_uuid(),
  issue_key text not null unique,
  issue_type text not null,
  entity_type text not null,
  entity_id text,
  entity_name text,
  reason text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_editorial_qa_ignores_issue_type
  on public.editorial_qa_ignores(issue_type);

create index if not exists idx_editorial_qa_ignores_entity
  on public.editorial_qa_ignores(entity_type, entity_id);

alter table public.editorial_qa_ignores enable row level security;

drop policy if exists "Authenticated users can view qa ignores" on public.editorial_qa_ignores;
create policy "Authenticated users can view qa ignores"
  on public.editorial_qa_ignores for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can manage qa ignores" on public.editorial_qa_ignores;
create policy "Authenticated users can manage qa ignores"
  on public.editorial_qa_ignores for all
  to authenticated
  using (true)
  with check (true);
