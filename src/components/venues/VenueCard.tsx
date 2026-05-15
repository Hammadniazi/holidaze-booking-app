import { Link } from "@tanstack/react-router";
import type { Venue } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  buildImageUrl,
  VENUE_PLACEHOLDER,
  truncate,
} from "@/utils";
import { Star, MapPin, Users, Wifi, Car, Coffee, PawPrint, Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";

interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
  const imageUrl = buildImageUrl(venue.media[0]?.url, VENUE_PLACEHOLDER);
  const location = [venue.location.city, venue.location.country]
    .filter(Boolean)
    .join(", ");
  const favorited = useFavoritesStore((state) => state.ids.includes(venue.id));
  const toggle = useFavoritesStore((state) => state.toggle);

  return (
    <Link
      to="/venue/$id"
      params={{ id: venue.id }}
      className="group block focus-visible:outline-none"
    >
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[var(--color-ring)]">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-(--color-muted)">
          <img
            src={imageUrl}
            alt={venue.media[0]?.alt || venue.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = VENUE_PLACEHOLDER;
            }}
          />
          {/* Amenity icons — top-left */}
          <div className="absolute top-2 left-2 flex gap-1">
            {venue.meta.wifi && (
              <span
                className="rounded-full bg-black/60 p-1"
                title="WiFi included"
              >
                <Wifi className="h-3 w-3 text-white" />
              </span>
            )}
            {venue.meta.parking && (
              <span
                className="rounded-full bg-black/60 p-1"
                title="Parking available"
              >
                <Car className="h-3 w-3 text-white" />
              </span>
            )}
            {venue.meta.breakfast && (
              <span
                className="rounded-full bg-black/60 p-1"
                title="Breakfast included"
              >
                <Coffee className="h-3 w-3 text-white" />
              </span>
            )}
            {venue.meta.pets && (
              <span
                className="rounded-full bg-black/60 p-1"
                title="Pets allowed"
              >
                <PawPrint className="h-3 w-3 text-white" />
              </span>
            )}
          </div>

          {/* Favorite heart button — top-right */}
          <button
            type="button"
            aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
            aria-pressed={favorited}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(venue.id);
            }}
            className={[
              "absolute top-2 right-2 rounded-full p-1.5 backdrop-blur-sm transition-all duration-150",
              "active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              favorited
                ? "bg-white/90 text-rose-500 shadow-sm"
                : "bg-black/40 text-white hover:bg-white/80 hover:text-rose-400",
            ].join(" ")}
          >
            <Heart
              className="h-4 w-4 transition-transform duration-150"
              fill={favorited ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base leading-snug line-clamp-1">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-sm text-(--color-muted-foreground)">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{venue.rating.toFixed(1)}</span>
            </div>
          </div>

          {location && (
            <div className="flex items-center gap-1 text-xs text-(--color-muted-foreground) mb-2">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}

          <p className="text-xs text-(--color-muted-foreground) mb-3 line-clamp-2">
            {truncate(venue.description, 100)}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-(--color-foreground)">
                {formatPrice(venue.price)}
              </span>
              <span className="text-xs text-(--color-muted-foreground)">
                {" "}
                / night
              </span>
            </div>
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Users className="h-3 w-3" />
              Up to {venue.maxGuests}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
