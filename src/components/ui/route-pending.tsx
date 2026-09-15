import { Container } from "./container";
import { Skeleton } from "./skeleton";

/**
 * Shown while a route's chunk downloads.
 *
 * Deliberately generic: it stands in for pages of different shapes, so it
 * holds the page's rhythm — a heading, a line of supporting text, a block —
 * rather than impersonating any one of them.
 */
export function RoutePending() {
  return (
    <Container className="py-10 sm:py-14">
      <div role="status" aria-label="Loading page">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <Skeleton className="mt-8 h-64 w-full rounded-(--radius-lg)" />
        <span className="sr-only">Loading page…</span>
      </div>
    </Container>
  );
}
