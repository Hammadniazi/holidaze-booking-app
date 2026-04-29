import { useState, useCallback, useEffect } from "react";
import { venuesApi } from "@/api/client";
import { useVenueStore } from "@/store/venueStore";
import type { ApiResponse, Venue } from "@/types";
import { ApiError } from "@/api/client";

export function useVenues(page = 1, limit = 12) {
  const { setVenues, setLoading, setError, searchQuery } = useVenueStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    setError(null);
    try {
      const res = searchQuery
        ? ((await venuesApi.search(searchQuery)) as ApiResponse<Venue[]>)
        : ((await venuesApi.getAll({ page, limit })) as ApiResponse<Venue[]>);

      const meta =
        "meta" in res && res.meta && "totalCount" in res.meta
          ? (res.meta as { totalCount: number })
          : { totalCount: 0 };

      setVenues(res.data, meta.totalCount);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to load venues";
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [page, limit, searchQuery, setVenues, setLoading, setError]);

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
