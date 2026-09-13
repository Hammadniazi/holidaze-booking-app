import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ApiError, venuesApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { VenueCardSkeleton } from "@/components/ui/skeleton";
import { VenueCard } from "@/components/venues/VenueCard";
import { useFavoritesStore } from "@/store/favoritesStore";
import type { ApiResponse, Venue } from "@/types";
import { Heart } from "lucide-react";

/**
 * The read side of the favourites store.
 *
 * The heart on every card wrote to a persisted store that nothing ever read
 * back, so saving a venue was a dead end. There is no endpoint for "these
 * ids", so each is fetched on its own — a personal list, not a catalogue.
 */
export function SavedVenuesPage() {
  const ids = useFavoritesStore((state) => state.ids);
  const remove = useFavoritesStore((state) => state.remove);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [prunedCount, setPrunedCount] = useState(0);

  // The ids to fetch are captured once. Reading live `ids` here would refetch
  // the whole list every time someone un-hearts a card on this very page.
  const requestedIds = useRef(ids);

  const load = useCallback(async () => {
    const wanted = requestedIds.current;
    if (wanted.length === 0) {
      setVenues([]);
      setIsLoading(false);
      return;
    }

    setLoadError(null);
    const results = await Promise.allSettled(
      wanted.map((id) => venuesApi.getOne(id) as Promise<ApiResponse<Venue>>),
    );

    const loaded: Venue[] = [];
    const gone: string[] = [];
    let unreachable = 0;

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        loaded.push(result.value.data);
      } else if (
        result.reason instanceof ApiError &&
        result.reason.status === 404
      ) {
        // Deleted by its host. Retrying will never bring it back, so the id
        // is dropped rather than left to fail on every future visit.
        gone.push(wanted[i]);
      } else {
        unreachable++;
      }
    });

    gone.forEach(remove);
    setPrunedCount(gone.length);
    setVenues(loaded);
    setLoadError(
      unreachable > 0
        ? `${unreachable} of your saved ${unreachable === 1 ? "venue" : "venues"} couldn't be loaded.`
        : null,
    );
    setIsLoading(false);
  }, [remove]);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = async () => {
    setIsRetrying(true);
    await load();
    setIsRetrying(false);
  };

  // Filtered against live `ids` so un-hearting a card removes it at once,
  // without a refetch.
  const visible = venues.filter((venue) => ids.includes(venue.id));
  const nothingLoaded = visible.length === 0;

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Saved venues
        </h1>
        <p className="mt-2 text-sm text-(--color-muted-foreground)">
          {/* Said plainly: the store is localStorage, not the account, so the
              list genuinely does not follow the user to another device. */}
          Kept on this device. Clearing your browser data clears them.
        </p>
      </div>

      {prunedCount > 0 && (
        <p
          className="mb-6 text-sm text-(--color-muted-foreground)"
          role="status"
        >
          {prunedCount === 1
            ? "One saved venue is no longer listed and has been removed."
            : `${prunedCount} saved venues are no longer listed and have been removed.`}
        </p>
      )}

      {loadError && !nothingLoaded && (
        <ErrorState
          title="Couldn't load some saved venues"
          message={loadError}
          onRetry={() => void retry()}
          isRetrying={isRetrying}
          className="mb-6"
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: Math.min(requestedIds.current.length || 4, 8) }).map(
            (_, i) => (
              <VenueCardSkeleton key={i} />
            ),
          )}
        </div>
      ) : loadError && nothingLoaded ? (
        <ErrorState
          title="Couldn't load your saved venues"
          message={`${loadError} They are still saved — this is a problem loading them.`}
          onRetry={() => void retry()}
          isRetrying={isRetrying}
        />
      ) : nothingLoaded ? (
        <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-card) py-20 text-center">
          <Heart
            className="mx-auto mb-4 h-10 w-10 text-(--color-muted-foreground)"
            aria-hidden="true"
          />
          <h2 className="font-display text-xl font-semibold">
            Nothing saved yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-(--color-muted-foreground)">
            Tap the heart on any venue and it will wait for you here.
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Browse venues</Link>
          </Button>
        </div>
      ) : (
        <>
          <p
            className="mb-4 text-sm text-(--color-muted-foreground)"
            aria-live="polite"
          >
            {visible.length} saved {visible.length === 1 ? "venue" : "venues"}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
