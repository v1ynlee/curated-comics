'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { UploadActions } from './UploadActions';
import { UploadQueue, type UploadQueueItem } from './UploadQueue';
import { UploadValidation, validateMediaUpload } from './UploadValidation';
import type { AssetType } from '@/types/media';

const DEFAULT_ASSET_TYPE: AssetType = 'article-image';

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File) {
    const error = validateMediaUpload(file);
    if (error) {
      toast.warning(error);
      return;
    }

    const id = `${file.name}:${Date.now()}`;
    setQueue([{ id, name: file.name, progress: 15, status: 'uploading' }]);
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('slug', file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'media-asset');
    data.append('assetType', DEFAULT_ASSET_TYPE);

    const response = await fetch('/api/media/upload', { method: 'POST', body: data });
    const payload = await response.json().catch(() => ({}));
    setUploading(false);

    if (!response.ok) {
      setQueue([{ id, name: file.name, progress: 100, status: 'error', error: typeof payload.error === 'string' ? payload.error : 'Upload failed' }]);
      toast.error(typeof payload.error === 'string' ? payload.error : 'Upload failed.');
      return;
    }

    setQueue([{ id, name: file.name, progress: 100, status: 'complete' }]);
    toast.success('Asset uploaded.');
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-bg-surface/30 p-3">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); }} />
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-text-tertiary"><Upload className="h-4 w-4" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-text-primary">Upload to Media Library</p>
          <UploadValidation />
          <div className="mt-3"><UploadActions disabled={uploading} onChoose={() => inputRef.current?.click()} /></div>
        </div>
      </div>
      <UploadQueue items={queue} />
    </div>
  );
}
