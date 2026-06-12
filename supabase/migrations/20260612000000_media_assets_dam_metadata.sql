-- ============================================================
-- Studio Media V2 — Digital Asset Management metadata
-- Adds optional DAM fields while preserving existing upload flow.
-- ============================================================

alter table public.media_assets
  drop constraint if exists media_assets_asset_type_check;

alter table public.media_assets
  add constraint media_assets_asset_type_check
  check (asset_type in (
    'cover',
    'banner',
    'article-image',
    'thumbnail',
    'og-asset',
    'title_cover',
    'creator_image',
    'article_cover',
    'gallery_image',
    'character_image'
  ));

alter table public.media_assets
  add column if not exists entity_id uuid,
  add column if not exists usage_count integer not null default 0,
  add column if not exists storage_provider text not null default 'r2',
  add column if not exists r2_path text,
  add column if not exists file_size_total bigint not null default 0,
  add column if not exists hash text,
  add column if not exists archived boolean not null default false;

update public.media_assets
set
  hash = coalesce(hash, content_hash),
  r2_path = coalesce(r2_path, r2_base_path),
  file_size_total = case
    when file_size_total > 0 then file_size_total
    else coalesce((
      select sum(coalesce((variant ->> 'size')::bigint, 0))
      from jsonb_array_elements(variants) as variant
    ), 0)
  end;

create index if not exists idx_media_assets_archived
  on public.media_assets(archived);

create index if not exists idx_media_assets_hash
  on public.media_assets(hash);

create index if not exists idx_media_assets_entity_id
  on public.media_assets(entity_id);
