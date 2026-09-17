import { useState, useCallback, useEffect, useRef } from "react";
import { venuesApi } from "@/api/client";
import { useVenueStore } from "@/store/venueStore";
import type { ApiResponse, Venue } from "@/types";
import { ApiError } from "@/api/client";

interface VenueQuery {
  page: number;
  limit: number;
  searchQuery: string;
  sortBy: string;
  sortOrder: string;
}

export function useVenues({
  page,
  limit,
  searchQuery,
  sortBy,
  sortOrder,
}: VenueQuery) {
  const { setVenues, setLoading, setError } = useVenueStore();
  const [isLoading, setIsLoading] = useState(false);
  // Sort, search and page can change faster than the API answers. Each
  // request takes a number, and only the newest one may write its result —
  // otherwise a slow earlier response lands last and overwrites the grid.
  const latestRequest = useRef(0);

  const fetchVenues = useCallback(async () => {
    const requestId = ++latestRequest.current;
    const isStale = () => requestId !== latestRequest.current;
    setIsLoading(true);
    setLoading(true);
    setError(null);
    try {
      const res = searchQuery
        ? ((await venuesApi.search(searchQuery, {
            page,
            limit,
            sort: sortBy,
            sortOrder,
          })) as ApiResponse<Venue[]>)
        : ((await venuesApi.getAll({
            page,
            limit,
            sort: sortBy,
            sortOrder,
          })) as ApiResponse<Venue[]>);

      if (isStale()) return;
      const totalCount = (res.meta as { totalCount?: number })?.totalCount ?? 0;

      setVenues(res.data, totalCount);
    } catch (err) {
      if (isStale()) return;
      const msg =
        err instanceof ApiError ? err.message : "We couldn't reach the server.";
      setError(msg);
    } finally {
      if (!isStale()) {
        setIsLoading(false);
        setLoading(false);
      }
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
  // A 404 is an answer — the venue is gone. Anything else is a failure to
  // reach the API, which a retry can fix. The page words itself accordingly.
  const [notFound, setNotFound] = useState(false);

  const fetchVenue = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) {
      setIsLoading(true);
      setLoading(true);
    }
    // Cleared before the attempt: without this a successful retry still
    // renders the previous failure, and Try again looks broken.
    setLocalError(null);
    setError(null);
    setNotFound(false);
    try {
      const res = (await venuesApi.getOne(id)) as ApiResponse<Venue>;
      setCurrentVenue(res.data);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "We couldn't reach the server.";
      setLocalError(msg);
      setError(msg);
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
    } finally {
      if (!silent) {
        setIsLoading(false);
        setLoading(false);
      }
    }
  }, [id, setCurrentVenue, setLoading, setError]);

  useEffect(() => {
    void fetchVenue();
    return () => setCurrentVenue(null);
  }, [fetchVenue, setCurrentVenue]);

  return { isLoading, error, notFound, refetch: fetchVenue };
}
