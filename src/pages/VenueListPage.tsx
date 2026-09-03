import { useVenueStore } from "@/store/venueStore";
import { useVenues } from "@/hooks/useVenues";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { VenueSearch } from "@/components/venues/VenueSearch";
import { getPageNumbers } from "@/utils";

const ITEMS_PER_PAGE = 16;

export const VenueListPage = () => {
  const {
    venues,
    totalCount,
    currentPage,
    setCurrentPage,
    isLoading,
    error,
    searchQuery,
    minGuests,
  } = useVenueStore();
  const { isLoading: fetching } = useVenues(currentPage, ITEMS_PER_PAGE);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const loading = isLoading || fetching;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Guest capacity is refined client-side — the list endpoint has no such
  // filter — so the count below says plainly what is being counted.
  const visible = minGuests > 0
    ? venues.filter((v) => v.maxGuests >= minGuests)
    : venues;

  const resultLabel = loading
    ? "Loading venues…"
    : minGuests > 0
      ? `${visible.length} of ${venues.length} on this page fit ${minGuests}+ guests`
      : searchQuery
        ? `${totalCount} ${totalCount === 1 ? "result" : "results"} for “${searchQuery}”`
        : `${totalCount.toLocaleString()} venues available`;

  return (
    <Container className="py-10 sm:py-14">
      {/* Hero — one line of type and the search bar. The grid is the hero on a
          listing product, so it starts above the fold rather than below a
          decorative masthead. */}
      <div className="mb-8">
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Find your perfect stay.
        </h1>
        <p className="mt-3 max-w-xl text-base text-(--color-muted-foreground)">
          Cabins, lofts and villas from hosts around the world.
        </p>
      </div>

      <div className="mb-8">
        <VenueSearch />
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p
          className="text-sm text-(--color-muted-foreground)"
          aria-live="polite"
        >
          {resultLabel}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" title="Couldn't load venues" className="mb-6">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-card) py-20 text-center">
          <SearchX
            className="mx-auto mb-4 h-10 w-10 text-(--color-muted-foreground)"
            aria-hidden="true"
          />
          <h2 className="font-display text-xl font-semibold">No venues found</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-(--color-muted-foreground)">
            {minGuests > 0
              ? `Nothing on this page sleeps ${minGuests} or more. Try a lower guest count or another page.`
              : searchQuery
                ? `No venues match “${searchQuery}”. Try a shorter or different term.`
                : "No venues available yet. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-12 flex flex-wrap items-center justify-center gap-1.5"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="select-none px-1.5 text-(--color-muted-foreground)"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className="tnum"
                onClick={() => setCurrentPage(page)}
                disabled={loading}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </Container>
  );
};
