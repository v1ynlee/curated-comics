-- ============================================================
-- Article Editorial Workflow State
-- Independent from publication_state for newsroom-style review flow.
-- ============================================================

alter table public.articles
  add column if not exists editorial_state text not null default 'draft';

alter table public.articles
  drop constraint if exists articles_editorial_state_check;

alter table public.articles
  add constraint articles_editorial_state_check
  check (editorial_state in (
    'draft',
    'needs_edit',
    'ready_for_review',
    'approved',
    'scheduled',
    'published',
    'archived'
  ));

update public.articles
set editorial_state = case publication_state
  when 'scheduled' then 'scheduled'
  when 'published' then 'published'
  when 'archived' then 'archived'
  else editorial_state
end;

create index if not exists idx_articles_editorial_state
  on public.articles(editorial_state);
