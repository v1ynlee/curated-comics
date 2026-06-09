// ============================================================
// Studio Curation Loading State
// ============================================================

import { CurationTabSkeleton } from './components/CurationSkeleton';

export default function StudioCurationLoading() {
  return (
    <div className="container-content max-w-7xl py-8">
      <div className="mb-7 flex flex-col gap-2">
        <div className="h-9 w-48 animate-shimmer rounded-sm bg-surface-elevated" />
        <div className="h-4 w-full max-w-2xl animate-shimmer rounded-sm bg-surface-elevated" />
      </div>
      <CurationTabSkeleton />
    </div>
  );
}
