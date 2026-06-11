export default function StudioCreatorsLoading() {
  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-44 animate-shimmer rounded-md bg-bg-surface/70" />
          <div className="h-4 w-72 animate-shimmer rounded-md bg-bg-surface/50" />
        </div>
        <div className="h-10 w-32 animate-shimmer rounded-md bg-bg-surface/70" />
      </div>
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex gap-5">
          <div className="h-6 w-20 animate-shimmer rounded-md bg-bg-surface/60" />
          <div className="h-6 w-16 animate-shimmer rounded-md bg-bg-surface/60" />
          <div className="h-6 w-16 animate-shimmer rounded-md bg-bg-surface/60" />
        </div>
        <div className="h-10 w-72 animate-shimmer rounded-md bg-bg-surface/60" />
      </div>
      <div className="rounded-lg border border-white/10 bg-bg-surface/35">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[1.6fr_100px_130px_100px_120px_48px] gap-3 border-b border-white/10 px-4 py-3 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-shimmer rounded-full bg-bg-surface/70" />
              <div className="h-4 w-40 animate-shimmer rounded-md bg-bg-surface/60" />
            </div>
            <div className="h-4 w-16 animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="h-4 w-12 animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="h-4 w-16 animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="h-4 w-20 animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="h-8 w-8 animate-shimmer rounded-md bg-bg-surface/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
