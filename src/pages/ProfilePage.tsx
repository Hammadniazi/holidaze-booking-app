import { ApiError, profilesApi, venuesApi } from "@/api/client";
import { Alert } from "@/components/ui/alert";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import {
  updateProfileSchema,
  createEditBookingSchema,
  type UpdateProfileInput,
  type EditBookingInput,
} from "@/schemas";
import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import type { ApiResponse, Booking, Profile, Venue } from "@/types";
import {
  AVATAR_PLACEHOLDER,
  buildImageUrl,
  calculateNights,
  formatDate,
  formatPrice,
  fromUTCDateString,
  toUTCDateString,
  venuePlaceholder,
} from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Building2, Edit, MapPin, Trash2 } from "lucide-react";
import { VenueManagement } from "@/components/dashboard/VenueManagement";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { useCallback, useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { isBefore, startOfDay } from "date-fns";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const ProfilePage = () => {
  useDocumentTitle("Your profile");
  const { user, isAuthenticated } = useAuth();
  const { setAuth } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const { deleteBooking, editBooking } = useBookings();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [editBookingOpen, setEditBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [editRange, setEditRange] = useState<DateRange | undefined>(undefined);
  const [availabilityBookings, setAvailabilityBookings] = useState<Booking[]>(
    [],
  );
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState<"venues" | "trips">(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") === "trips" ? "trips" : "venues";
  });

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login", search: { redirect: "/profile" } });
    }
  }, [isAuthenticated, navigate]);

  // Tabs follow the ARIA pattern: one tab stop for the whole list, and the
  // arrow, Home and End keys move between tabs (and select them).
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order = ["venues", "trips"] as const;
    const current = order.indexOf(activeTab);
    const next =
      e.key === "ArrowRight"
        ? order[(current + 1) % order.length]
        : e.key === "ArrowLeft"
          ? order[(current - 1 + order.length) % order.length]
          : e.key === "Home"
            ? order[0]
            : e.key === "End"
              ? order[order.length - 1]
              : null;
    if (!next) return;
    e.preventDefault();
    setActiveTab(next);
    document.getElementById(`tab-btn-${next}`)?.focus();
  };

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoadError(null);
    try {
      const response = (await profilesApi.getOne(user.name)) as ApiResponse<
        Profile & { bookings?: Booking[] }
      >;
      setProfileData(response.data);
      if (response.data.bookings) setBookings(response.data.bookings);
    } catch (error) {
      // Bookings arrive in this response, so a silent failure shows
      // "No trips yet" to someone who has trips.
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "We couldn't reach the server.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, setBookings]);

  const retryProfile = async () => {
    setIsRetrying(true);
    await fetchProfile();
    setIsRetrying(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const {
    register,
    handleSubmit,
    reset: resetProfileForm,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bio: user?.bio ?? "",
      avatar: { url: user?.avatar?.url ?? "", alt: user?.avatar?.alt ?? "" },
    },
  });

  const openEditProfile = () => {
    // Re-populate from the freshly fetched profile (not the auth store's
    // stale login-time snapshot) so bio/avatar/banner all reflect what's
    // actually on the page right now — banner previously wasn't prefilled
    // at all, making it look unset even when one exists.
    resetProfileForm({
      bio: profileData?.bio ?? "",
      avatar: {
        url: profileData?.avatar?.url ?? "",
        alt: profileData?.avatar?.alt ?? "",
      },
      banner: {
        url: profileData?.banner?.url ?? "",
        alt: profileData?.banner?.alt ?? "",
      },
    });
    setEditOpen(true);
  };

  const {
    register: registerBooking,
    handleSubmit: handleBookingSubmit,
    reset: resetBookingForm,
    setValue: setEditBookingValue,
    formState: { errors: bookingErrors, isSubmitting: isBookingSubmitting },
  } = useForm<EditBookingInput>({
    // Re-built on every render so it always reflects the currently selected
    // booking's venue — react-hook-form re-reads `resolver` on each render.
    resolver: zodResolver(
      createEditBookingSchema(
        selectedBooking?.venue?.maxGuests ?? Number.MAX_SAFE_INTEGER,
      ),
    ) as Resolver<EditBookingInput>,
  });

  const openEditBooking = async (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingError(null);
    resetBookingForm({
      dateFrom: booking.dateFrom,
      dateTo: booking.dateTo,
      guests: booking.guests,
    });
    setEditRange({
      from: fromUTCDateString(booking.dateFrom),
      to: fromUTCDateString(booking.dateTo),
    });
    setAvailabilityBookings([]);
    setEditBookingOpen(true);

    // Fetch the venue's current bookings so the calendar can block dates
    // that overlap someone else's stay — excluding this booking's own dates.
    if (booking.venue?.id) {
      setIsLoadingAvailability(true);
      try {
        const res = (await venuesApi.getOne(
          booking.venue.id,
        )) as ApiResponse<Venue>;
        setAvailabilityBookings(
          (res.data.bookings ?? []).filter((b) => b.id !== booking.id),
        );
      } catch {
        // Non-fatal — calendar just won't reflect live conflicts if this fails
      } finally {
        setIsLoadingAvailability(false);
      }
    }
  };

  const handleEditRangeSelect = (r: DateRange | undefined) => {
    setEditRange(r);
    if (r?.from)
      setEditBookingValue("dateFrom", toUTCDateString(r.from), {
        shouldValidate: true,
      });
    if (r?.to)
      setEditBookingValue("dateTo", toUTCDateString(r.to), {
        shouldValidate: true,
      });
  };

  const onUpdateBooking = async (data: EditBookingInput) => {
    if (!selectedBooking) return;
    setBookingError(null);
    try {
      await editBooking(selectedBooking.id, {
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        guests: data.guests,
      });
      setEditBookingOpen(false);
      setSelectedBooking(null);
    } catch {
      setBookingError("Failed to update booking. Please try again.");
    }
  };
  const onUpdateProfile = async (data: UpdateProfileInput) => {
    if (!user) return;
    setServerError(null);
    try {
      const payload: UpdateProfileInput = {};

      if (data.bio !== undefined) payload.bio = data.bio;

      if (data.avatar?.url)
        payload.avatar = { url: data.avatar.url, alt: data.avatar.alt ?? "" };
      if (data.banner?.url)
        payload.banner = { url: data.banner.url, alt: data.banner.alt ?? "" };

      const response = (await profilesApi.update(
        user.name,
        payload,
      )) as ApiResponse<Profile>;
      // Use the API response as the source of truth so cleared fields reflect immediately
      setProfileData(response.data);
      setAuth({ ...user, ...response.data, accessToken: user.accessToken });
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : "Update failed";
      setServerError(msg);
    }
  };

  const avatarUrl = buildImageUrl(
    profileData?.avatar?.url ?? user?.avatar?.url,
    AVATAR_PLACEHOLDER,
  );
  const bannerUrl = buildImageUrl(profileData?.banner?.url, "");

  // Trips split at today: what is coming up leads, soonest first, and past
  // stays follow newest first. Past stays are a record — they cannot be
  // edited or cancelled, so they offer neither.
  const today = startOfDay(new Date());
  const isPastBooking = (b: Booking) =>
    isBefore(fromUTCDateString(b.dateTo), today);
  const byCheckIn = [...bookings].sort((a, b) =>
    a.dateFrom.localeCompare(b.dateFrom),
  );
  const upcomingBookings = byCheckIn.filter((b) => !isPastBooking(b));
  const pastBookings = byCheckIn.filter(isPastBooking).reverse();

  const renderBookingCard = (booking: Booking, isPast: boolean) => {
    const nights = calculateNights(
      fromUTCDateString(booking.dateFrom),
      fromUTCDateString(booking.dateTo),
    );
    return (
      <Card
        key={booking.id}
        className={`overflow-hidden ${isPast ? "opacity-80" : ""}`}
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {booking.venue?.media?.[0]?.url && (
              <div className="h-40 sm:h-auto w-full sm:w-28 shrink-0 overflow-hidden bg-(--color-muted)">
                <img
                  src={booking.venue.media[0].url}
                  alt={booking.venue.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = venuePlaceholder(
                      booking.venue?.id ?? booking.id,
                      booking.venue?.name,
                    );
                  }}
                />
              </div>
            )}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {booking.venue?.id ? (
                    <Link
                      to="/venue/$id"
                      params={{ id: booking.venue.id }}
                      className="block font-semibold truncate hover:text-(--color-primary) transition-colors"
                    >
                      {booking.venue.name}
                    </Link>
                  ) : (
                    <p className="font-semibold truncate">Venue</p>
                  )}
                  {booking.venue?.location && (
                    <div className="flex items-center gap-1 text-xs text-(--color-muted-foreground) mt-0.5">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {[
                        booking.venue.location.city,
                        booking.venue.location.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </div>
                {!isPast && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-(--color-muted-foreground) hover:text-(--color-foreground)"
                      onClick={() => void openEditBooking(booking)}
                      aria-label="Edit booking"
                    >
                      <Edit className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-(--color-destructive) hover:text-(--color-destructive) hover:bg-destructive/10"
                      onClick={() => setCancelConfirmId(booking.id)}
                      aria-label="Cancel booking"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <div>
                  <span className="text-(--color-muted-foreground)">Check-in: </span>
                  <span className="font-medium">{formatDate(booking.dateFrom)}</span>
                </div>
                <div>
                  <span className="text-(--color-muted-foreground)">Check-out: </span>
                  <span className="font-medium">{formatDate(booking.dateTo)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <Badge variant="secondary">
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </Badge>
                {booking.venue?.price ? (
                  <span className="tnum text-sm">
                    <span className="text-(--color-muted-foreground)">
                      {nights} {nights === 1 ? "night" : "nights"} ·{" "}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(nights * booking.venue.price)}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const bookingsListJSX = loadError && bookings.length === 0 ? (
    <ErrorState
      title="Couldn't load your trips"
      message={`${loadError} Your bookings are safe — this is a problem loading them.`}
      onRetry={() => void retryProfile()}
      isRetrying={isRetrying}
    />
  ) : (
    <div className="space-y-8">
      <section aria-labelledby="upcoming-trips-heading">
        <h3
          id="upcoming-trips-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wider text-(--color-muted-foreground)"
        >
          Upcoming
        </h3>
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-12 rounded-(--radius) border border-dashed border-(--color-border)">
            <Calendar
              className="mx-auto h-10 w-10 text-(--color-muted-foreground) mb-3"
              aria-hidden="true"
            />
            <p className="font-medium mb-1">No upcoming trips</p>
            <p className="text-sm text-(--color-muted-foreground) mb-4">
              {pastBookings.length > 0
                ? "Ready for the next one?"
                : "Start exploring venues to make your first booking."}
            </p>
            <Button asChild>
              <Link to="/">Browse venues</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((b) => renderBookingCard(b, false))}
          </div>
        )}
      </section>

      {pastBookings.length > 0 && (
        <section aria-labelledby="past-trips-heading">
          <h3
            id="past-trips-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-(--color-muted-foreground)"
          >
            Past
          </h3>
          <div className="space-y-3">
            {pastBookings.map((b) => renderBookingCard(b, true))}
          </div>
        </section>
      )}
    </div>
  );

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <Container className="py-8">
        <ProfileSkeleton />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Profile header */}
      <div className="mb-8">
        {/* Banner */}
        <div
          className={`w-full rounded-(--radius) overflow-hidden ${bannerUrl ? "h-48 sm:h-56" : "h-32 bg-linear-to-br from-(--color-muted) to-(--color-accent)/40"}`}
        >
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Profile banner"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="relative px-4 sm:px-6">
          {/* Avatar */}
          <div className="absolute -top-10">
            <img
              src={avatarUrl}
              alt={user?.name}
              className="h-20 w-20 rounded-full object-cover border-4 border-(--color-background) bg-(--color-muted)"
              onError={(e) => {
                (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER;
              }}
            />
          </div>

          {/* Edit button */}
          <div className="flex justify-end pt-3 pb-1">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={openEditProfile}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit profile
            </Button>
          </div>

          {/* Name, email, bio */}
          <div className="mt-2 pl-24 sm:pl-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{user?.name}</h1>
              {user?.venueManager && (
                <Badge variant="default">Venue Manager</Badge>
              )}
            </div>
            <p className="text-sm text-(--color-muted-foreground) mt-0.5">
              {user?.email}
            </p>
            {profileData?.bio ? (
              <p className="text-sm mt-1 text-(--color-foreground)">
                {profileData.bio}
              </p>
            ) : (
              <p className="text-sm mt-1 text-(--color-muted-foreground) italic">
                No bio yet
              </p>
            )}
          </div>
        </div>
      </div>



      {/* Manager layout: tabbed */}
      {user?.venueManager && (
        <div>
          {/* Tab bar */}
          <div
            role="tablist"
            aria-label="Profile sections"
            onKeyDown={handleTabKeyDown}
            className="flex border-b border-(--color-border) mb-6"
          >
            <button
              id="tab-btn-venues"
              role="tab"
              aria-selected={activeTab === "venues"}
              aria-controls="tab-venues"
              tabIndex={activeTab === "venues" ? 0 : -1}
              onClick={() => setActiveTab("venues")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "venues"
                  ? "border-(--color-primary) text-(--color-foreground)"
                  : "border-transparent text-(--color-muted-foreground) hover:text-(--color-foreground)"
              }`}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              My Venues
            </button>
            <button
              id="tab-btn-trips"
              role="tab"
              aria-selected={activeTab === "trips"}
              aria-controls="tab-trips"
              tabIndex={activeTab === "trips" ? 0 : -1}
              onClick={() => setActiveTab("trips")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "trips"
                  ? "border-(--color-primary) text-(--color-foreground)"
                  : "border-transparent text-(--color-muted-foreground) hover:text-(--color-foreground)"
              }`}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              My Trips
              {bookings.length > 0 && (
                <span className="ml-0.5 rounded-full bg-(--color-muted) px-1.5 py-0.5 text-xs font-medium">
                  {bookings.length}
                </span>
              )}
            </button>
          </div>

          {/* Venues tab */}
          <div
            id="tab-venues"
            role="tabpanel"
            aria-labelledby="tab-btn-venues"
            hidden={activeTab !== "venues"}
          >
            <VenueManagement />
          </div>

          {/* Trips tab */}
          <div
            id="tab-trips"
            role="tabpanel"
            aria-labelledby="tab-btn-trips"
            hidden={activeTab !== "trips"}
          >
            {bookingsListJSX}
          </div>
        </div>
      )}

      {/* Customer bookings section (non-managers) */}
      {!user?.venueManager && (
        <section aria-labelledby="trips-heading">
          <h2
            id="trips-heading"
            className="text-lg font-semibold mb-6 flex items-center gap-2"
          >
            <Calendar className="h-5 w-5 text-(--color-primary)" aria-hidden="true" />
            My Trips
            {bookings.length > 0 && (
              <span className="text-sm font-normal text-(--color-muted-foreground)">
                · {bookings.length}
              </span>
            )}
          </h2>
          {bookingsListJSX}
        </section>
      )}

      {/* Cancel booking confirmation dialog */}
      <Dialog
        open={!!cancelConfirmId}
        onClose={() => !isCancelling && setCancelConfirmId(null)}
        title="Cancel booking"
      >
        <p className="text-sm text-(--color-muted-foreground) mb-5">
          Are you sure you want to cancel this booking? This action cannot be
          undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isCancelling}
            onClick={() => setCancelConfirmId(null)}
          >
            Keep booking
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            isLoading={isCancelling}
            onClick={async () => {
              if (!cancelConfirmId) return;
              // The dialog stays open until the API answers, so a second
              // click cannot send a second request, and a failure is not
              // hidden behind a dialog that already closed.
              setIsCancelling(true);
              try {
                await deleteBooking(cancelConfirmId);
                setCancelConfirmId(null);
              } catch {
                // useBookings has already shown the error toast.
              } finally {
                setIsCancelling(false);
              }
            }}
          >
            {!isCancelling && <Trash2 className="h-4 w-4 mr-1" />}
            {isCancelling ? "Cancelling…" : "Yes, cancel it"}
          </Button>
        </div>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog
        open={editBookingOpen}
        onClose={() => setEditBookingOpen(false)}
        title="Edit Booking"
        description={selectedBooking?.venue?.name ?? undefined}
      >
        {bookingError && (
          <Alert variant="destructive" className="mb-4" focusOnMount>
            {bookingError}
          </Alert>
        )}
        <form
          onSubmit={handleBookingSubmit(onUpdateBooking)}
          className="space-y-4"
        >
          {isLoadingAvailability ? (
            <div className="h-64 flex items-center justify-center rounded-(--radius) border border-(--color-border) text-sm text-(--color-muted-foreground)">
              Checking availability...
            </div>
          ) : (
            <BookingCalendar
              bookings={availabilityBookings}
              selected={editRange}
              onRangeSelect={handleEditRangeSelect}
            />
          )}
          {(bookingErrors.dateFrom || bookingErrors.dateTo) && (
            <p className="text-xs text-(--color-destructive)">
              Please select valid check-in and check-out dates
            </p>
          )}
          <Input
            id="editGuests"
            label="Number of guests"
            type="number"
            min={1}
            max={selectedBooking?.venue?.maxGuests}
            error={bookingErrors.guests?.message}
            {...registerBooking("guests", { valueAsNumber: true })}
          />
          {selectedBooking?.venue?.maxGuests && (
            <p className="text-xs text-(--color-muted-foreground) -mt-2">
              Max {selectedBooking.venue.maxGuests} guests
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setEditBookingOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isBookingSubmitting}
            >
              Save changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
      >
        {serverError && (
          <Alert variant="destructive" className="mb-4" focusOnMount>
            {serverError}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
          <Textarea
            id="bio"
            label="Bio"
            placeholder="Tell us about yourself..."
            error={errors.bio?.message}
            rows={3}
            {...register("bio")}
          />
          <Input
            id="avatarUrl"
            label="Avatar URL"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            error={errors.avatar?.url?.message}
            {...register("avatar.url")}
          />
          <Input
            id="bannerUrl"
            label="Banner URL (optional)"
            type="url"
            placeholder="https://example.com/banner.jpg"
            error={errors.banner?.url?.message}
            {...register("banner.url")}
          />
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
