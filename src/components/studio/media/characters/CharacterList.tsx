'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { CharacterEditor } from './CharacterEditor';
import { CharacterPreview } from './CharacterPreview';
import type { StudioCharacterMedia, StudioMediaAsset } from '@/app/studio/media/types';

export function CharacterList({ characters, assets }: { characters: StudioCharacterMedia[]; assets: StudioMediaAsset[] }) {
  const [preview, setPreview] = useState<StudioCharacterMedia | null>(null);
  const [editing, setEditing] = useState<StudioCharacterMedia | null>(null);
  if (characters.length === 0) return <div className="rounded-lg border border-white/10 bg-bg-surface/35 px-4 py-12 text-center font-body text-sm text-text-secondary">No character records found.</div>;
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-bg-surface/35">
        <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs text-text-tertiary"><tr><th className="px-4 py-3 font-medium">Image</th><th className="px-4 py-3 font-medium">Character</th><th className="px-4 py-3 font-medium">Comic</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Images</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-white/10">{characters.map((character) => (<tr key={character.id} className="hover:bg-white/[0.03]"><td className="px-4 py-3">{character.previewImageUrl ? (<img src={character.previewImageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />) : <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-xs text-text-tertiary">None</span>}</td><td className="px-4 py-3 font-body text-text-primary">{character.name}</td><td className="px-4 py-3 font-body text-text-secondary">{character.titleName}</td><td className="px-4 py-3 font-body text-xs capitalize text-text-secondary">{character.role}</td><td className="px-4 py-3 font-data text-text-secondary">{character.imageCount}</td><td className="px-4 py-3 text-right"><div className="inline-flex gap-2"><button type="button" onClick={() => setEditing(character)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 font-body text-xs text-text-secondary hover:bg-white/5"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Edit</button><button type="button" onClick={() => setPreview(character)} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent-primary px-2.5 font-heading text-xs text-white hover:bg-accent-primary/90"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Preview</button></div></td></tr>))}</tbody></table>
      </div>
      {editing && <CharacterEditor character={editing} assets={assets} />}
      {preview && <CharacterPreview character={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
