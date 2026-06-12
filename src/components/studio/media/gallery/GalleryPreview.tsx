'use client';

import { X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import type { StudioGalleryGroup } from '@/app/studio/media/types';

export function GalleryPreview({ gallery, onClose }: { gallery: StudioGalleryGroup; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed left-0 top-0 z-modal h-[100dvh] w-[100dvw] bg-black/55" role="dialog" aria-modal="true" aria-label="Gallery preview">
        <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close gallery preview" />
        <aside className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-3xl flex-col border-l border-white/10 bg-bg-deep">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5">
            <div className="min-w-0"><h2 className="truncate font-heading text-xl font-semibold text-text-primary">{gallery.name}</h2><p className="mt-1 font-body text-sm text-text-secondary">{gallery.imageCount} images</p></div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-text-tertiary hover:bg-white/5"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <div className="grid flex-1 auto-rows-max grid-cols-2 gap-3 overflow-y-auto p-5 md:grid-cols-3">
            {gallery.images.map((image) => (
              <figure key={image.id} className="overflow-hidden rounded-lg border border-white/10 bg-bg-surface/35">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <figcaption className="p-2 font-body text-xs text-text-secondary">{image.caption || image.category}</figcaption>
              </figure>
            ))}
          </div>
        </aside>
      </div>
    </ModalPortal>
  );
}
