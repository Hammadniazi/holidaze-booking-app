import { useState, useCallback } from "react";
import { bookingsApi } from "@/api/client";
import { toast } from "sonner";
import { useBookingStore } from "@/store/bookingStore";
import type { ApiResponse, Booking } from "@/types";
import { ApiError } from "@/api/client";

export function useBookings() {
  const { addBooking, setError } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBooking = useCallback(
    async (data: {
      dateFrom: string;
      dateTo: string;
      guests: number;
      venueId: string;
    }) => {
      setIsSubmitting(true);
      try {
        const res = (await bookingsApi.create(data)) as ApiResponse<Booking>;
        addBooking(res.data);
        toast.success("Booking confirmed!");
        return res.data;
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Booking failed";
        toast.error(msg);
        setError(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [addBooking, setError],
  );
  return { createBooking, isSubmitting };
}
