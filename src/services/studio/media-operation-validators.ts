import type { SupabaseClient } from '@supabase/supabase-js';
import { listR2Objects } from '@/lib/storage/r2-client';
import { resolveCanonicalPath } from '@/lib/storage/media-resolver';
import type { StudioMediaAsset } from '@/app/studio/media/types';

export interface OperationCheck {
  step: string;
  ok: boolean;
  detail: string;
}

export interface OperationValidationReport {
  ok: boolean;
  checks: OperationCheck[];
}

function pass(step: string, detail: string): OperationCheck {
  return { step, ok: true, detail };
}

function fail(step: string, detail: string): OperationCheck {
  return { step, ok: false, detail };
}

export function assetCanonicalKeys(asset: StudioMediaAsset) {
  return asset.variants.map((variant) => resolveCanonicalPath(variant.url)).filter((key): key is string => Boolean(key));
}

export async function validateMediaOperation(
  supabase: SupabaseClient,
  asset: StudioMediaAsset,
  options: { requireUnused?: boolean; requireStorage?: boolean } = {},
): Promise<OperationValidationReport> {
  const checks: OperationCheck[] = [];

  if (options.requireUnused && asset.usageCount > 0) checks.push(fail('usage', `Asset is used by ${asset.usageCount} reference${asset.usageCount === 1 ? '' : 's'}.`));
  else checks.push(pass('usage', asset.usageCount === 0 ? 'No usage references detected.' : `${asset.usageCount} usage references detected.`));

  const metadata = await supabase.from('media_assets').select('id, slug, archived').eq('id', asset.id).maybeSingle();
  if (metadata.error) checks.push(fail('metadata', metadata.error.message));
  else if (!metadata.data) checks.push(fail('metadata', 'Metadata record is missing.'));
  else checks.push(pass('metadata', 'Metadata record exists.'));

  if (options.requireStorage !== false) {
    const keys = assetCanonicalKeys(asset);
    if (keys.length === 0) {
      checks.push(fail('storage', 'Asset has no canonical storage paths.'));
    } else {
      const objects = await listR2Objects(asset.r2BasePath ?? keys[0]);
      const objectKeys = new Set(objects.map((object) => object.key));
      const missing = keys.filter((key) => !objectKeys.has(key));
      if (objects.length === 0 || missing.length > 0) checks.push(fail('storage', `Missing R2 object: ${missing[0] ?? keys[0]}`));
      else checks.push(pass('storage', `${objects.length} R2 object${objects.length === 1 ? '' : 's'} found.`));
    }
  }

  return { ok: checks.every((check) => check.ok), checks };
}
