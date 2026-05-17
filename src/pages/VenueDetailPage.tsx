import { BookingForm } from "@/components/bookings/BookingForm";
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
  Car,
  ChevronLeft,
  ChevronRight,
  Coffee,
  ExternalLink,
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

  // API defaults unset coordinates to 0,0 — treat that as "no coords"
  const hasCoords = venue.location.lat !== 0 || venue.location.lng !== 0;

  // Google Maps embed src — pin on exact coords if available, city search otherwise
  const mapEmbedSrc = hasCoords
    ? `https://maps.google.com/maps?q=${venue.location.lat},${venue.location.lng}&t=m&z=15&output=embed&iwloc=B`
    : location
      ? `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=m&z=13&output=embed&iwloc=B`
      : null;

  // Google Maps link for "Open in Google Maps"
  const mapsLink = hasCoords
    ? `https://www.google.com/maps?q=${venue.location.lat},${venue.location.lng}`
    : `https://www.google.com/maps/search/?q=${encodeURIComponent(location)}`;

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
              <span
                aria-label={`Rated ${venue.rating.toFixed(1)} out of 5`}
                className="flex items-center gap-1 shrink-0 text-sm"
              >
                <Star
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                <span aria-hidden="true" className="font-medium">
                  {venue.rating.toFixed(1)}
                </span>
              </span>
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

          {/* Upcoming bookings: calendar already shows blocked dates visually */}
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
            <BookingForm venue={venue} onSuccess={() => {}} />
          </div>
        </div>
      </div>

      {/* Map  */}

      {mapEmbedSrc && (
        <div className="mt-10 pt-8 border-t border-(--color-border)">
          <h2 className="text-xl font-semibold mb-1">Where you'll be</h2>
          {location && (
            <p className="text-sm text-(--color-muted-foreground) mb-5">
              {location}
            </p>
          )}

          <div className="rounded-2xl overflow-hidden h-64 sm:h-80">
            <iframe
              title="Venue location"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedSrc}
              className="block border-0 w-full h-full"
            />
          </div>

          {/* Below map: just the link */}
          <div className="mt-3 flex justify-end">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium underline text-(--color-foreground) hover:text-(--color-primary) transition-colors"
            >
              Show more on map
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueDetailPage;
