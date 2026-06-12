'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { replaceMediaAssetReferences } from '@/app/studio/media/actions';
import type { StudioMediaAsset } from '@/app/studio/media/types';

export function AssetReplaceDialog({ asset }: { asset: StudioMediaAsset }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);

  async function replaceWithFile(file: File) {
    setFileName(file.name);
    const toastId = toast.loading('Uploading replacement asset...');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('slug', asset.slug);
    uploadData.append('assetType', asset.assetType);

    const response = await fetch('/api/media/upload', { method: 'POST', body: uploadData });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.asset?.id) {
      toast.error(typeof payload.error === 'string' ? payload.error : 'Replacement upload failed.', { id: toastId });
      return;
    }

    startTransition(async () => {
      const result = await replaceMediaAssetReferences(asset.id, payload.asset.id);
      if (result.success) {
        toast.success('Asset references replaced.', { id: toastId });
        router.refresh();
      } else {
        toast.error(result.error, { id: toastId });
      }
    });
  }

  return (
    <section className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
      <h3 className="font-heading text-sm font-semibold text-text-primary">Replace Asset</h3>
      <p className="mt-1 font-body text-sm text-text-secondary">Upload a replacement and update detected references without opening individual editors.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void replaceWithFile(file); }} />
        <button type="button" disabled={pending} onClick={() => inputRef.current?.click()} className="inline-flex h-9 items-center rounded-md bg-accent-primary px-3 font-heading text-sm text-white hover:bg-accent-primary/90 disabled:opacity-50">Upload Replacement</button>
        {fileName && <span className="font-body text-xs text-text-tertiary">{fileName}</span>}
      </div>
    </section>
  );
}
