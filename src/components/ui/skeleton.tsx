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
