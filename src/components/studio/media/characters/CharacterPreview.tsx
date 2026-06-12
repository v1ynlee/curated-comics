'use client';

import { X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import type { StudioCharacterMedia } from '@/app/studio/media/types';

export function CharacterPreview({ character, onClose }: { character: StudioCharacterMedia; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed left-0 top-0 z-modal h-[100dvh] w-[100dvw] bg-black/55" role="dialog" aria-modal="true" aria-label="Character preview">
        <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close character preview" />
        <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-xl flex-col border-l border-white/10 bg-bg-deep">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5"><div><h2 className="font-heading text-xl font-semibold text-text-primary">{character.name}</h2><p className="mt-1 font-body text-sm text-text-secondary">{character.titleName} · {character.role}</p></div><button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-text-tertiary hover:bg-white/5"><X className="h-4 w-4" aria-hidden="true" /></button></div>
          <div className="space-y-4 overflow-y-auto p-5">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-bg-surface/35">
              {character.previewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={character.previewImageUrl} alt="" className="max-h-80 w-full object-cover" />
              ) : <div className="flex h-56 items-center justify-center font-body text-sm text-text-tertiary">Missing image</div>}
            </div>
            <p className="font-body text-sm leading-6 text-text-secondary">{character.description || 'No character description yet.'}</p>
          </div>
        </aside>
      </div>
    </ModalPortal>
  );
}
