-- ============================================================
-- Studio Media — upload intent metadata
-- Persists canonical storage path and editor-selected destination.
-- ============================================================

alter table public.media_assets
  add column if not exists upload_destination text,
  add column if not exists canonical_path text;

create index if not exists idx_media_assets_upload_destination
  on public.media_assets(upload_destination);

create index if not exists idx_media_assets_canonical_path
  on public.media_assets(canonical_path);
