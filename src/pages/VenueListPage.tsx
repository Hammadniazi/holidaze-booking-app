import { useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useVenueStore } from "@/store/venueStore";
import { useVenues } from "@/hooks/useVenues";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Container } from "@/components/ui/container";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { VenueSearch } from "@/components/venues/VenueSearch";
import { getPageNumbers } from "@/utils";
import {
  DEFAULT_SORT,
  rememberListSearch,
  type VenueListSearch,
} from "@/components/venues/venueListSearch";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ITEMS_PER_PAGE = 16;

export const VenueListPage = () => {
  useDocumentTitle();
  const search: VenueListSearch = useSearch({ from: "/" });
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    rememberListSearch(search);
  }, [search]);

  const currentPage = search.page ?? 1;
  const searchQuery = search.q ?? "";
  const minGuests = search.guests ?? 0;
  const [sortBy, sortOrder] = (search.sort ?? DEFAULT_SORT).split(":");

  const { venues, totalCount, isLoading, error } = useVenueStore();
  const { isLoading: fetching, refetch } = useVenues({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    searchQuery,
    sortBy,
    sortOrder,
  });

  // Pagination sits under the grid, so a new page used to open scrolled to
  // its bottom. Bring the results back into view, and move focus to the
  // count so a keyboard or screen-reader user starts reading from the top.
  const goToPage = (page: number) => {
    void navigate({
      to: "/",
      search: { ...search, page: page > 1 ? page : undefined },
      resetScroll: false,
    });
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    resultsRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    resultsRef.current?.focus({ preventScroll: true });
  };

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
    : error
      ? "Venues could not be loaded"
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
        <VenueSearch search={search} />
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p
          ref={resultsRef}
          tabIndex={-1}
          className="scroll-mt-24 text-sm text-(--color-muted-foreground) focus:outline-none"
          aria-live="polite"
        >
          {resultLabel}
        </p>
      </div>

      {/* A failed load leaves `venues` empty, which the branch below would
          report as "No venues found" — a search result rather than a failure.
          The error takes that slot instead, unless results are already on
          screen, in which case it sits above them and they stay. */}
      {error && venues.length > 0 && (
        <ErrorState
          title="Couldn't refresh venues"
          message={`${error} Showing the last results loaded.`}
          onRetry={() => void refetch()}
          className="mb-6"
        />
      )}

      {error && venues.length === 0 ? (
        <ErrorState
          title="Couldn't load venues"
          message={error}
          onRetry={() => void refetch()}
        />
      ) : loading ? (
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
            onClick={() => goToPage(currentPage - 1)}
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
                onClick={() => goToPage(page)}
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
            onClick={() => goToPage(currentPage + 1)}
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
