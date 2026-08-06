import { ApiError, profilesApi, venuesApi } from "@/api/client";
import { Alert } from "@/components/ui/alert";
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
  formatDate,
  formatPrice,
  toUTCDateString,
  VENUE_PLACEHOLDER,
} from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Building2, Edit, MapPin, Trash2 } from "lucide-react";
import { VenueManagement } from "@/components/dashboard/VenueManagement";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { useCallback, useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { parseISO } from "date-fns";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";

export const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { setAuth } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const { deleteBooking, editBooking } = useBookings();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editBookingOpen, setEditBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [editRange, setEditRange] = useState<DateRange | undefined>(undefined);
  const [availabilityBookings, setAvailabilityBookings] = useState<Booking[]>(
    [],
  );
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"venues" | "trips">(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") === "trips" ? "trips" : "venues";
  });

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = (await profilesApi.getOne(user.name)) as ApiResponse<
        Profile & { bookings?: Booking[] }
      >;
      setProfileData(response.data);
      if (response.data.bookings) setBookings(response.data.bookings);
    } catch {
      toast.error("Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user, setBookings]);

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
      from: parseISO(booking.dateFrom),
      to: parseISO(booking.dateTo),
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

  const bookingsListJSX = bookings.length === 0 ? (
    <div className="text-center py-12 rounded-(--radius) border border-dashed border-(--color-border)">
      <Calendar className="mx-auto h-10 w-10 text-(--color-muted-foreground) mb-3" />
      <h3 className="font-medium mb-1">No trips yet</h3>
      <p className="text-sm text-(--color-muted-foreground) mb-4">
        Start exploring venues to make your first booking.
      </p>
      <Button asChild>
        <Link to="/">Browse venues</Link>
      </Button>
    </div>
  ) : (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {booking.venue?.media?.[0]?.url && (
                <div className="h-40 sm:h-auto w-full sm:w-28 shrink-0 overflow-hidden bg-(--color-muted)">
                  <img
                    src={booking.venue.media[0].url}
                    alt={booking.venue.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = VENUE_PLACEHOLDER;
                    }}
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {booking.venue?.name ?? "Venue"}
                    </p>
                    {booking.venue?.location && (
                      <div className="flex items-center gap-1 text-xs text-(--color-muted-foreground) mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {[
                          booking.venue.location.city,
                          booking.venue.location.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
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
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary">
                    {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                  </Badge>
                  {booking.venue?.price && (
                    <span className="text-sm font-medium">
                      {formatPrice(booking.venue.price)} / night
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div role="status" aria-label="Loading">
          <div
            className="animate-spin h-8 w-8 rounded-full border-2 border-(--color-primary) border-t-transparent"
            aria-hidden="true"
          />
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
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
            className="flex border-b border-(--color-border) mb-6"
          >
            <button
              id="tab-btn-venues"
              role="tab"
              aria-selected={activeTab === "venues"}
              aria-controls="tab-venues"
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
        onClose={() => setCancelConfirmId(null)}
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
            onClick={() => setCancelConfirmId(null)}
          >
            Keep booking
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              if (cancelConfirmId) void deleteBooking(cancelConfirmId);
              setCancelConfirmId(null);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Yes, cancel it
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
          <Alert variant="destructive" className="mb-4">
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
          <Alert variant="destructive" className="mb-4">
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
    </div>
  );
};

export default ProfilePage;
