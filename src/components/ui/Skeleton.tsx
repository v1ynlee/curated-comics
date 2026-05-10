// ============================================================
// Skeleton — loading placeholder
// Source of truth: docs/motion/MOTION_SYSTEM.md — Category 6
// ============================================================

import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  /** Aspect ratio for image skeletons, e.g. "2/3" */
  aspectRatio?: string;
}

export function Skeleton({ className, aspectRatio }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer rounded-sm bg-surface-elevated', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
      aria-hidden="true"
    />
  );
}

/** Pre-composed card skeleton matching TitleCard dimensions */
export function TitleCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton aspectRatio="2/3" className="w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
