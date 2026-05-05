import { create } from "zustand";
import type { Booking } from "@/types";
interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  removeBooking: (bookingId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}
export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),
  removeBooking: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== bookingId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
