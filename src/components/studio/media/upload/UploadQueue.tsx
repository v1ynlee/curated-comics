import { UploadProgress } from './UploadProgress';

export interface UploadQueueItem {
  id: string;
  name: string;
  progress: number;
  status: 'queued' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export function UploadQueue({ items }: { items: UploadQueueItem[] }) {
  if (items.length === 0) return null;
  return <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-bg-surface/35 p-3">{items.map((item) => <UploadProgress key={item.id} label={item.error ? `${item.name} — ${item.error}` : item.name} progress={item.progress} />)}</div>;
}
