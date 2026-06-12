import type { StudioGalleryGroup } from '@/app/studio/media/types';

export function GalleryStats({ galleries }: { galleries: StudioGalleryGroup[] }) {
  const imageCount = galleries.reduce((sum, gallery) => sum + gallery.imageCount, 0);
  const largest = galleries.reduce((current, gallery) => gallery.imageCount > current.imageCount ? gallery : current, galleries[0] ?? null);
  const average = galleries.length ? Math.round(imageCount / galleries.length) : 0;
  const items = [
    ['Total Galleries', galleries.length.toString()],
    ['Total Images', imageCount.toString()],
    ['Average Images', average.toString()],
    ['Largest Gallery', largest?.name ?? 'None'],
  ];
  return <div className="grid gap-3 md:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-lg border border-white/10 bg-bg-surface/35 p-4"><p className="font-body text-xs text-text-tertiary">{label}</p><p className="mt-2 truncate font-data text-lg text-text-primary">{value}</p></div>)}</div>;
}
