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
import { deleteAsset } from '@/services/studio/media-operations';
import { fetchMediaWorkspaceData } from '@/app/studio/media/actions';

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

    const supabase = await createSupabaseServerClient();
    const data = await fetchMediaWorkspaceData();
    const asset = data.assets.find((item) => item.id === assetId);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const result = await deleteAsset(supabase, asset);
    if (!result.success) return NextResponse.json({ error: result.error, report: result.report }, { status: 409 });

    return NextResponse.json({ success: true, report: result.report });
  } catch (err) {
    console.error('[media/delete] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
