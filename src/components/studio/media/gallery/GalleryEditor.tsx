'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { addGalleryAssetToGroup } from '@/app/studio/media/actions';
import { GalleryAssetPicker } from './GalleryAssetPicker';
import type { StudioGalleryGroup, StudioMediaAsset } from '@/app/studio/media/types';

const CATEGORIES = [
  { value: 'best-scene', label: 'Best Scene' },
  { value: 'romantic-scene', label: 'Romantic Scene' },
  { value: 'funny-scene', label: 'Funny Scene' },
  { value: 'general', label: 'General' },
  { value: 'cover', label: 'Cover' },
];

export function GalleryEditor({ gallery, assets }: { gallery: StudioGalleryGroup; assets: StudioMediaAsset[] }) {
  const router = useRouter();
  const [category, setCategory] = useState(gallery.category);
  const [caption, setCaption] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAssetId) {
      toast.warning('Choose an asset first.');
      return;
    }

    startTransition(async () => {
      const result = await addGalleryAssetToGroup({ titleId: gallery.titleId, category, assetId: selectedAssetId, caption });
      if (result.success) {
        toast.success('Gallery image added.');
        setCaption('');
        setSelectedAssetId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-white/10 bg-bg-surface/35 p-4">
      <div>
        <h3 className="font-heading text-sm font-semibold text-text-primary">Add Asset To Gallery</h3>
        <p className="mt-1 font-body text-sm text-text-secondary">{gallery.name}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={`h-9 rounded-md border px-3 font-body text-xs transition-colors ${category === item.value ? 'border-accent-primary bg-accent-primary/10 text-text-primary' : 'border-white/10 text-text-secondary hover:bg-white/5'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <GalleryAssetPicker assets={assets} selectedAssetId={selectedAssetId} onSelect={setSelectedAssetId} />

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Optional caption"
          className="h-10 rounded-md border border-white/10 bg-bg-deep/50 px-3 font-body text-sm text-text-primary outline-none focus:border-accent-primary/60"
        />
        <button type="submit" disabled={isPending} className="h-10 rounded-md bg-accent-primary px-4 font-heading text-sm text-white hover:bg-accent-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? 'Adding...' : 'Add Image'}
        </button>
      </div>
    </form>
  );
}
