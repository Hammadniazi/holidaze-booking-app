import { create } from "zustand";
import type { Venue } from "@/types";

interface VenueState {
  // --- Listing data ---
  venues: Venue[];
  currentVenue: Venue | null;
  totalCount: number;

  // --- UI state ---
  isLoading: boolean;
  error: string | null;
  setVenues: (venues: Venue[], totalCount?: number) => void;
  setCurrentVenue: (venue: Venue | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVenueStore = create<VenueState>((set) => ({
  venues: [],
  currentVenue: null,
  totalCount: 0,
  isLoading: false,
  error: null,

  setVenues: (venues, totalCount = 0) => set({ venues, totalCount }),
  setCurrentVenue: (venue) => set({ currentVenue: venue }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
