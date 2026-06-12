'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { addCharacterAssetImage } from '@/app/studio/media/actions';
import { CharacterAssetPicker } from './CharacterAssetPicker';
import type { StudioCharacterMedia, StudioMediaAsset } from '@/app/studio/media/types';

export function CharacterEditor({ character, assets }: { character: StudioCharacterMedia; assets: StudioMediaAsset[] }) {
  const router = useRouter();
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
      const result = await addCharacterAssetImage({ characterId: character.id, assetId: selectedAssetId, caption });
      if (result.success) {
        toast.success('Character image added.');
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
        <h3 className="font-heading text-sm font-semibold text-text-primary">Add Character Image</h3>
        <p className="mt-1 font-body text-sm text-text-secondary">{character.name} · {character.titleName}</p>
      </div>

      <CharacterAssetPicker assets={assets} selectedAssetId={selectedAssetId} onSelect={setSelectedAssetId} />

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
