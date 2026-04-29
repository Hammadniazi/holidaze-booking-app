import { create } from "zustand";
import type { Venue } from "@/types";

interface VenueState {
  venues: Venue[];
  currentVenue: Venue | null;
  totalCount: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setVenues: (venues: Venue[], totalCount?: number) => void;
  setCurrentVenue: (venue: Venue | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
}

export const useVenueStore = create<VenueState>((set) => ({
  venues: [],
  currentVenue: null,
  totalCount: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  searchQuery: "",

  setVenues: (venues, totalCount = 0) => set({ venues, totalCount }),
  setCurrentVenue: (venue) => set({ currentVenue: venue }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
