import { create } from "zustand";
import type { Venue } from "@/types";

interface VenueState {
  // --- Listing data ---
  venues: Venue[];
  currentVenue: Venue | null;
  totalCount: number;
  currentPage: number;

  // --- UI state ---
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: string;
  sortOrder: string;
  setVenues: (venues: Venue[], totalCount?: number) => void;
  setCurrentVenue: (venue: Venue | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: string) => void;
}

export const useVenueStore = create<VenueState>((set) => ({
  venues: [],
  currentVenue: null,
  totalCount: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  // Default: show newest venues first
  searchQuery: "",
  sortBy: "created",
  sortOrder: "desc",

  setVenues: (venues, totalCount = 0) => set({ venues, totalCount }),
  setCurrentVenue: (venue) => set({ currentVenue: venue }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
}));
