import { ApiError, profileApi } from "@/api/client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { updateProfileSchema, type UpdateProfileInput } from "@/schemas";
import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import type { ApiResponse, Booking, Profile } from "@/types";
import {
  AVATAR_PLACEHOLDER,
  buildImageUrl,
  formatDate,
  formatPrice,
} from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Edit, MapPin, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { setAuth } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const { deleteBooking } = useBookings();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = (await profileApi.getOne(user.name)) as ApiResponse<
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
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      bio: user?.bio ?? "",
      avatar: { url: user?.avatar?.url ?? "", alt: user?.avatar?.alt ?? "" },
    },
  });
  const onUpdateProfile = async (data: UpdateProfileInput) => {
    if (!user) return;
    setServerError(null);
    try {
      const payload: UpdateProfileInput = {};
      if (data.bio) payload.bio = data.bio;
      if (data.avatar?.url)
        payload.avatar = { url: data.avatar.url, alt: data.avatar.alt ?? "" };
      if (data.banner?.url) payload.banner = { url: data.banner.url, alt: "" };

      const res = (await profileApi.update(
        user.name,
        payload,
      )) as ApiResponse<Profile>;
      setProfileData(res.data);
      setAuth({ ...user, ...res.data, accessToken: user.accessToken });
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Update failed";
      setServerError(msg);
    }
  };

  const avatarUrl = buildImageUrl(
    profileData?.avatar?.url ?? user?.avatar?.url,
    AVATAR_PLACEHOLDER,
  );
  const bannerUrl = buildImageUrl(profileData?.banner?.url, "");

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-(--color-primary) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="relative mb-8">
        {bannerUrl && (
          <div className="h-36 rounded-(--radius) overflow-hidden mb-0">
            <img
              src={bannerUrl}
              alt="Profile banner"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div
          className={`flex items-end flex-wrap gap-4 ${bannerUrl ? "-mt-10 px-4" : ""}`}
        >
          <img
            src={avatarUrl}
            alt={user?.name}
            className="h-20 w-20 rounded-full object-cover border-4 border-(--color-background) bg-(--color-muted)"
            onError={(e) => {
              (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER;
            }}
          />
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{user?.name}</h1>
              {user?.venueManager && (
                <Badge variant="default">Venue Manager</Badge>
              )}
            </div>
            <p className="text-sm text-(--color-muted-foreground)">
              {user?.email}
            </p>
            {profileData?.bio && (
              <p className="text-sm mt-1">{profileData.bio}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setEditOpen(true)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {profileData?._count?.bookings ?? bookings.length}
            </p>
            <p className="text-xs text-(--color-muted-foreground)">Bookings</p>
          </CardContent>
        </Card>
        {user?.venueManager && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {profileData?._count?.venues ?? 0}
              </p>
              <p className="text-xs text-(--color-muted-foreground)">
                Venues managed
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bookings section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> My Bookings
        </h2>

        {bookings.length === 0 ? (
          <div className="text-center py-12 rounded-(--radius) border border-dashed border-(--color-border)">
            <Calendar className="mx-auto h-10 w-10 text-(--color-muted-foreground) mb-3" />
            <h3 className="font-medium mb-1">No bookings yet</h3>
            <p className="text-sm text-(--color-muted-foreground) mb-4">
              Start exploring venues to make your first booking.
            </p>
            <Button asChild>
              <a href="/">Browse venues</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {booking.venue?.media?.[0]?.url && (
                      <div className="w-28 shrink-0 overflow-hidden bg-(--color-muted)">
                        <img
                          src={booking.venue.media[0].url}
                          alt={booking.venue.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-(--color-destructive) hover:text-(--color-destructive) hover:bg-destructive/10 shrink-0"
                          onClick={() => void deleteBooking(booking.id)}
                          aria-label="Cancel booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-(--color-muted-foreground)">
                            Check-in:{" "}
                          </span>
                          <span className="font-medium">
                            {formatDate(booking.dateFrom)}
                          </span>
                        </div>
                        <div>
                          <span className="text-(--color-muted-foreground)">
                            Check-out:{" "}
                          </span>
                          <span className="font-medium">
                            {formatDate(booking.dateTo)}
                          </span>
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
        )}
      </div>

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
          <Input
            id="bio"
            label="Bio"
            placeholder="Tell us about yourself..."
            error={errors.bio?.message}
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
