import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingInput } from "@/schemas";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import type { Venue } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert } from "../ui/alert";
import { calculateNights, formatDate, formatPrice, toUTCDateString } from "@/utils";
import { BookingCalendar } from "./BookingCalendar";
import { type DateRange } from "react-day-picker";
import { Link, useNavigate } from "@tanstack/react-router";

interface BookingFormProps {
  venue: Venue;
  onSuccess: () => void;
}
export const BookingForm = ({ venue, onSuccess }: BookingFormProps) => {
  const { isAuthenticated } = useAuth();
  const { createBooking, isSubmitting } = useBookings();
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema) as never,
    defaultValues: { venueId: venue.id, guests: 1 },
  });

  const nights =
    range?.from && range?.to ? calculateNights(range.from, range.to) : 0;
  const totalPrice = nights * venue.price;

  const handleRangeSelect = (r: DateRange | undefined) => {
    setRange(r);
    if (r?.from)
      setValue("dateFrom", toUTCDateString(r.from), { shouldValidate: true });
    if (r?.to)
      setValue("dateTo", toUTCDateString(r.to), { shouldValidate: true });
  };

  const onSubmit = async (data: unknown) => {
    const typedData = data as BookingInput;
    setFormError(null);
    try {
      await createBooking({
        dateFrom: typedData.dateFrom,
        dateTo: typedData.dateTo,
        guests: typedData.guests,
        venueId: typedData.venueId,
      });
      setSuccess(true);
      reset();
      setRange(undefined);
      onSuccess?.();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  };
  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-(--color-muted-foreground) mb-4">
            Please log in to book this venue.
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="success" title="Booking confirmed!">
            Your booking has been successfully created. You can view it in your
            profile.
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSuccess(false)}
            >
              Book again
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                void navigate({ to: "/profile", search: { tab: "trips" } })
              }
            >
              View bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book this venue</CardTitle>
        <p className="text-sm text-(--color-muted-foreground)">
          Select your dates and number of guests
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("venueId")} />

          <BookingCalendar
            bookings={venue.bookings ?? []}
            onRangeSelect={handleRangeSelect}
            selected={range}
          />

          {(errors.dateFrom || errors.dateTo) && (
            <p className="text-xs text-(--color-destructive)">
              Please select valid check-in and check-out dates
            </p>
          )}

          {range?.from && range?.to && (
            <div className="rounded-(--radius) bg-(--color-muted) p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-(--color-muted-foreground)">
                  Check-in
                </span>
                <span className="font-medium">{formatDate(range.from)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-muted-foreground)">
                  Check-out
                </span>
                <span className="font-medium">{formatDate(range.to)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-muted-foreground)">
                  {nights} nights × {formatPrice(venue.price)}
                </span>
                <span className="font-bold">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}

          <Input
            id="guests"
            label="Number of guests"
            type="number"
            min={1}
            max={venue.maxGuests}
            error={errors.guests?.message}
            {...register("guests", { valueAsNumber: true })}
          />
          <p className="text-xs text-(--color-muted-foreground)">
            Max {venue.maxGuests} guests
          </p>

          {formError && (
            <Alert variant="destructive" title="Booking failed">
              {formError}
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!range?.from || !range?.to}
          >
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
