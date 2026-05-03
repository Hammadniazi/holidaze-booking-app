import BookingForm from "@/components/bookings/BookingForm";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenue } from "@/hooks/useVenues";
import { useVenueStore } from "@/store/venueStore";
import {
  AVATAR_PLACEHOLDER,
  buildImageUrl,
  formatPrice,
  VENUE_PLACEHOLDER,
} from "@/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Coffee,
  MapPin,
  PawPrint,
  Star,
  Users,
  Wifi,
} from "lucide-react";
import { useState } from "react";

interface VenueDetailPageProps {
  id: string;
}

export const VenueDetailPage = ({ id }: VenueDetailPageProps) => {
  const { currentVenue: venue } = useVenueStore();
  const { isLoading, error } = useVenue(id);
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Skeleton className="h-72 w-full rounded-(--radius)" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Alert variant="destructive" title="Venue not found">
          {error ?? "This venue could not be loaded."}
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => void navigate({ to: "/" })}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to venues
        </Button>
      </div>
    );
  }

  const images =
    venue.media.length > 0
      ? venue.media
      : [{ url: VENUE_PLACEHOLDER, alt: venue.name }];
  const location = [
    venue.location.address,
    venue.location.city,
    venue.location.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void navigate({ to: "/" })}
        className="mb-4 -ml-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> All venues
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="relative h-72 sm:h-96 rounded-(--radius) overflow-hidden bg-(--color-muted)">
            <img
              src={buildImageUrl(images[imgIndex]?.url, VENUE_PLACEHOLDER)}
              alt={images[imgIndex]?.alt || venue.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = VENUE_PLACEHOLDER;
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImgIndex((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`h-2 w-2 rounded-full transition-all ${i === imgIndex ? "bg-white w-4" : "bg-white/50"}`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{venue.name}</h1>
              <div className="flex items-center gap-1 shrink-0 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{venue.rating.toFixed(1)}</span>
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-1.5 text-(--color-muted-foreground) text-sm mb-4">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" /> Up to {venue.maxGuests} guests
              </Badge>
              {venue.meta.wifi && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> WiFi
                </Badge>
              )}
              {venue.meta.parking && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Car className="h-3 w-3" /> Parking
                </Badge>
              )}
              {venue.meta.breakfast && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coffee className="h-3 w-3" /> Breakfast
                </Badge>
              )}
              {venue.meta.pets && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <PawPrint className="h-3 w-3" /> Pets allowed
                </Badge>
              )}
            </div>

            <p className="text-(--color-muted-foreground) leading-relaxed whitespace-pre-line">
              {venue.description}
            </p>
          </div>

          {/* Owner */}
          {venue.owner && (
            <div className="rounded-(--radius) border border-(--color-border) p-4">
              <p className="text-sm font-semibold mb-3">Hosted by</p>
              <div className="flex items-center gap-3">
                <img
                  src={buildImageUrl(
                    venue.owner.avatar?.url,
                    AVATAR_PLACEHOLDER,
                  )}
                  alt={venue.owner.name}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER;
                  }}
                />
                <div>
                  <p className="font-medium text-sm">{venue.owner.name}</p>
                  {venue.owner.bio && (
                    <p className="text-xs text-(--color-muted-foreground)">
                      {venue.owner.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming bookings preview (for managers viewing own venue) */}
          {venue.bookings && venue.bookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Upcoming bookings
              </h2>
              <p className="text-sm text-(--color-muted-foreground) mb-2">
                {venue.bookings.length} booking(s) on record. These dates are
                unavailable.
              </p>
            </div>
          )}
        </div>

        {/* Right: Booking form */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="mb-3">
              <span className="text-2xl font-bold">
                {formatPrice(venue.price)}
              </span>
              <span className="text-sm text-(--color-muted-foreground)">
                {" "}
                / night
              </span>
            </div>
            <BookingForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;
