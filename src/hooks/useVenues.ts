import { useState, useCallback, useEffect } from "react";
import { venuesApi } from "@/api/client";
import { useVenueStore } from "@/store/venueStore";
import type { ApiResponse, Venue } from "@/types";
import { ApiError } from "@/api/client";

export function useVenues(page = 1, limit = 12) {
  // Read search/sort state from the global store so any component that writes
  // to the store (e.g. VenueSearch) triggers a re-fetch here automatically.
  const { setVenues, setLoading, setError, searchQuery, sortBy, sortOrder } =
    useVenueStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    setError(null);
    try {
      const res = searchQuery
        ? ((await venuesApi.search(searchQuery)) as ApiResponse<Venue[]>)
        : ((await venuesApi.getAll({
            page,
            limit,
            sort: sortBy,
            sortOrder,
          })) as ApiResponse<Venue[]>);

      const totalCount = (res.meta as { totalCount?: number })?.totalCount ?? 0;

      setVenues(res.data, totalCount);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to load venues";
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [
    page,
    limit,
    searchQuery,
    sortBy,
    sortOrder,
    setVenues,
    setLoading,
    setError,
  ]);

  useEffect(() => {
    void fetchVenues();
  }, [fetchVenues]);

  return { refetch: fetchVenues, isLoading };
}

export function useVenue(id: string) {
  const { setCurrentVenue, setLoading, setError } = useVenueStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const fetchVenue = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setLoading(true);
    try {
      const res = (await venuesApi.getOne(id)) as ApiResponse<Venue>;
      setCurrentVenue(res.data);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to load venue";
      setLocalError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [id, setCurrentVenue, setLoading, setError]);

  useEffect(() => {
    void fetchVenue();
    return () => setCurrentVenue(null);
  }, [fetchVenue, setCurrentVenue]);

  return { isLoading, error, refetch: fetchVenue };
}
