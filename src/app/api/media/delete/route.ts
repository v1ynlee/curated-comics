// ============================================================
// Media Delete API Route
// Source of truth: .kiro/specs/platform-evolution-planning/design.md
//
// DELETE /api/media/delete
// Body: { assetId: string }
//
// Deletes all R2 objects under the asset's prefix and removes
// the media_assets row from Supabase.
//
// Errors:
//   401 — Unauthorized (no valid session)
//   404 — Asset not found in media_assets
//   503 — Storage service unavailable (R2 unreachable)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, createSupabaseServerClient } from '@/lib/db/supabase-server';
import { deleteR2Prefix } from '@/lib/storage/r2-client';
import { getMediaAssetPrefix } from '@/lib/storage/media-paths';
import type { AssetType } from '@/types/media';

export async function DELETE(request: NextRequest) {
  // 1. Validate auth session
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { assetId } = body;

    if (!assetId || typeof assetId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid assetId' },
        { status: 400 },
      );
    }

    // 2. Verify asset exists in media_assets
    const supabase = await createSupabaseServerClient();
    const { data: asset, error: fetchError } = await supabase
      .from('media_assets')
      .select('id, slug, asset_type, content_hash, r2_base_path, r2_path')
      .eq('id', assetId)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // 3. Delete R2 objects by prefix
    // Use r2_base_path if available, otherwise construct from asset_type/slug/content_hash
    const prefix = asset.r2_path || asset.r2_base_path || getMediaAssetPrefix(asset.asset_type as AssetType, asset.slug, asset.content_hash);

    try {
      await deleteR2Prefix(prefix);
    } catch (r2Error) {
      console.error('[media/delete] R2 deletion failed:', r2Error);
      return NextResponse.json(
        { error: 'Storage service unavailable' },
        { status: 503 },
      );
    }

    // 4. Remove media_assets row from Supabase
    const { error: deleteError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', assetId);

    if (deleteError) {
      console.error('[media/delete] Supabase deletion failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove asset record' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[media/delete] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
