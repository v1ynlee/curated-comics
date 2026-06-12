export function UploadProgress({ label, progress }: { label: string; progress: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3"><span className="truncate font-body text-xs text-text-secondary">{label}</span><span className="font-data text-xs text-text-tertiary">{progress}%</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-accent-primary" style={{ width: `${progress}%` }} /></div>
    </div>
  );
}
