'use client';

export function UploadPreview({ url, name }: { url: string; name: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-white/10 bg-bg-surface/35">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-32 w-full object-cover" />
      <figcaption className="truncate p-2 font-body text-xs text-text-secondary">{name}</figcaption>
    </figure>
  );
}
