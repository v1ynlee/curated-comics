export default function StudioActivityLoading() {
  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-6 space-y-3">
        <div className="h-9 w-32 animate-shimmer rounded-md bg-bg-surface/70" />
        <div className="h-4 w-full max-w-xl animate-shimmer rounded-md bg-bg-surface/50" />
      </div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-9 w-20 animate-shimmer rounded-md bg-bg-surface/50" />
          ))}
        </div>
        <div className="h-10 w-full animate-shimmer rounded-md bg-bg-surface/50 lg:w-80" />
      </div>
      <section className="rounded-lg border border-white/10 bg-bg-surface/35">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="h-5 w-32 animate-shimmer rounded-md bg-bg-surface/70" />
          <div className="mt-2 h-4 w-24 animate-shimmer rounded-md bg-bg-surface/50" />
        </div>
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[32px_1fr_auto] sm:items-center">
            <div className="h-8 w-8 animate-shimmer rounded-md bg-bg-surface/70" />
            <div className="space-y-2">
              <div className="h-4 w-44 animate-shimmer rounded-md bg-bg-surface/70" />
              <div className="h-4 w-64 max-w-full animate-shimmer rounded-md bg-bg-surface/50" />
            </div>
            <div className="h-4 w-16 animate-shimmer rounded-md bg-bg-surface/50" />
          </div>
        ))}
      </section>
    </div>
  );
}
