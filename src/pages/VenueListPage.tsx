import { useVenueStore } from "@/store/venueStore";
import { useVenues } from "@/hooks/useVenues";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export const VenueListPage = () => {
  const {
    venues,
    totalCount,
    currentPage,
    setCurrentPage,
    isLoading,
    error,
    searchQuery,
  } = useVenueStore();
  const { isLoading: fetching } = useVenues(currentPage, ITEMS_PER_PAGE);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const loading = isLoading || fetching;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <MapPin className="h-7 w-7 text-[var(--color-primary)]" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Find your perfect stay
        </h1>
        <p className="text-lg text-[var(--color-muted-foreground)] max-w-xl mx-auto">
          Discover thousands of unique venues worldwide, from cozy cottages to
          luxury villas.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl mx-auto">{/* <VenueSearch /> */}</div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {searchQuery
            ? `${venues.length} results for "${searchQuery}"`
            : loading
              ? "Loading venues..."
              : `${totalCount} venues available`}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Alert
          variant="destructive"
          title="Error loading venues"
          className="mb-6"
        >
          {error}
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Venues grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="mx-auto h-12 w-12 text-[var(--color-muted-foreground)] mb-4" />
          <h2 className="text-xl font-semibold mb-2">No venues found</h2>
          <p className="text-[var(--color-muted-foreground)]">
            {searchQuery
              ? `No venues match "${searchQuery}". Try a different search term.`
              : "No venues available yet. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}

      {/* Pagination - only in non-search mode */}
      {!searchQuery && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[var(--color-muted-foreground)]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
