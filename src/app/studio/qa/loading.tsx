export default function StudioQALoading() {
  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6 space-y-3">
        <div className="h-9 w-24 animate-shimmer rounded-md bg-bg-surface/70" />
        <div className="h-4 w-full max-w-xl animate-shimmer rounded-md bg-bg-surface/50" />
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
            <div className="h-4 w-32 animate-shimmer rounded-md bg-bg-surface/70" />
            <div className="mt-2 h-3 w-full animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="mt-4 h-8 w-12 animate-shimmer rounded-md bg-bg-surface/60" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/10 bg-bg-surface/35 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-white/10 py-3 last:border-b-0">
            <div className="h-14 w-10 animate-shimmer rounded-md bg-bg-surface/70" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-48 animate-shimmer rounded-md bg-bg-surface/70" />
              <div className="h-3 w-32 animate-shimmer rounded-md bg-bg-surface/50" />
            </div>
            <div className="h-8 w-24 animate-shimmer rounded-md bg-bg-surface/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
