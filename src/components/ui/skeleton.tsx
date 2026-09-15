import { cn } from "@/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-(--radius) bg-(--color-muted)",
        className,
      )}
    />
  );
}

/** Mirrors the real card's geometry (3:2 crop, same padding and rows) so the
 *  grid does not reflow when results land. */
export function VenueCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-card)">
      <Skeleton className="aspect-3/2 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors one row of the venue manager's list: 32-wide thumbnail, title,
 *  meta line, and the badge row beneath it. */
export function VenueRowSkeleton() {
  return (
    <div className="overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-card)">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="h-44 w-full shrink-0 rounded-none sm:h-auto sm:w-32" />
        <div className="flex-1 space-y-2.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-8 w-28 rounded-(--radius)" />
          </div>
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Stats row plus the first rows of the venue manager, in their real
 *  geometry, so nothing jumps when the data lands. */
export function VenueManagementSkeleton() {
  return (
    <div role="status" aria-label="Loading your venues">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-[86px] rounded-(--radius-lg) ${i === 2 ? "hidden sm:block" : ""}`}
          />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <VenueRowSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">Loading your venues…</span>
    </div>
  );
}

/** Banner, overlapping avatar, identity block and one content row — the
 *  profile page's own shape rather than a centred spinner. */
export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile">
      <div className="mb-8">
        <Skeleton className="h-32 w-full" />
        <div className="relative px-4 sm:px-6">
          <Skeleton className="absolute -top-10 h-20 w-20 rounded-full border-4 border-(--color-background)" />
          <div className="flex justify-end pt-3 pb-1">
            <Skeleton className="h-10 w-32 rounded-(--radius)" />
          </div>
          <div className="mt-2 space-y-2 pl-24 sm:pl-0">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
      </div>
      <Skeleton className="mb-4 h-10 w-56 rounded-(--radius)" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <VenueRowSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">Loading profile…</span>
    </div>
  );
}
