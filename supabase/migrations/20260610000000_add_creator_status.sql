-- Add archive support for Studio creator management.

alter table public.creators
add column if not exists status text not null default 'active';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'creators_status_check'
  ) then
    alter table public.creators
    add constraint creators_status_check check (status in ('active', 'archived'));
  end if;
end $$;

create index if not exists idx_creators_status on public.creators(status);
