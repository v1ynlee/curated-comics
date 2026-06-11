export default function StudioTasksLoading() {
  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6 space-y-3">
        <div className="h-9 w-28 animate-shimmer rounded-md bg-bg-surface/70" />
        <div className="h-4 w-full max-w-xl animate-shimmer rounded-md bg-bg-surface/50" />
      </div>
      <div className="mb-5 flex gap-1 overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-9 w-24 animate-shimmer rounded-md bg-bg-surface/50" />
        ))}
      </div>
      <section className="rounded-lg border border-white/10 bg-bg-surface/35">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="h-5 w-44 animate-shimmer rounded-md bg-bg-surface/70" />
          <div className="mt-2 h-4 w-28 animate-shimmer rounded-md bg-bg-surface/50" />
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[90px_90px_1fr_1.5fr_120px_180px] sm:items-center">
            <div className="h-7 w-20 animate-shimmer rounded-md bg-bg-surface/60" />
            <div className="h-4 w-16 animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="h-4 w-44 animate-shimmer rounded-md bg-bg-surface/70" />
            <div className="h-4 w-64 animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="h-4 w-24 animate-shimmer rounded-md bg-bg-surface/50" />
            <div className="h-8 w-40 animate-shimmer rounded-md bg-bg-surface/60" />
          </div>
        ))}
      </section>
    </div>
  );
}
