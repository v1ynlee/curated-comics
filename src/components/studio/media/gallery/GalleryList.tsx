'use client';

import { useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { GalleryEditor } from './GalleryEditor';
import { GalleryPreview } from './GalleryPreview';
import type { StudioGalleryGroup, StudioMediaAsset } from '@/app/studio/media/types';

export function GalleryList({ galleries, assets }: { galleries: StudioGalleryGroup[]; assets: StudioMediaAsset[] }) {
  const [preview, setPreview] = useState<StudioGalleryGroup | null>(null);
  const [editing, setEditing] = useState<StudioGalleryGroup | null>(null);
  if (galleries.length === 0) return <div className="rounded-lg border border-white/10 bg-bg-surface/35 px-4 py-12 text-center font-body text-sm text-text-secondary">No gallery records found.</div>;
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-bg-surface/35">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs text-text-tertiary"><tr><th className="px-4 py-3 font-medium">Gallery</th><th className="px-4 py-3 font-medium">Related Comic</th><th className="px-4 py-3 font-medium">Images</th><th className="px-4 py-3 font-medium">Last Updated</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {galleries.map((gallery) => (
              <tr key={gallery.id} className="hover:bg-white/[0.03]"><td className="px-4 py-3 font-body text-text-primary capitalize">{gallery.category.replace(/-/g, ' ')}</td><td className="px-4 py-3 font-body text-text-secondary">{gallery.titleName}</td><td className="px-4 py-3 font-data text-text-secondary">{gallery.imageCount}</td><td className="px-4 py-3 font-body text-xs text-text-tertiary">{new Date(gallery.updatedAt).toLocaleDateString()}</td><td className="px-4 py-3 text-right"><div className="inline-flex gap-2"><button type="button" onClick={() => setEditing(gallery)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 font-body text-xs text-text-secondary hover:bg-white/5"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Edit</button><button type="button" onClick={() => setPreview(gallery)} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent-primary px-2.5 font-heading text-xs text-white hover:bg-accent-primary/90"><Eye className="h-3.5 w-3.5" aria-hidden="true" />Preview</button></div></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <GalleryEditor gallery={editing} assets={assets} />}
      {preview && <GalleryPreview gallery={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
