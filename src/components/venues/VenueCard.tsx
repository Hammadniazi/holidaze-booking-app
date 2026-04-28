import { Link } from "@tanstack/react-router";
import { Star, MapPin, Wifi, Car, Coffee, PawPrint } from "lucide-react";
import type { Venue } from "@/types";

interface Props {
  venue: Venue;
}

export function VenueCard({ venue }: Props) {
  const image = venue.media[0]?.url ?? "/placeholder.jpg";
  const location = [venue.location.city, venue.location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Link to="/venue/$venueId" params={{ venueId: venue.id }}>
      <div className="group rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={venue.media[0]?.alt ?? venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Rating badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {venue.rating.toFixed(1)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold truncate">{venue.name}</h3>
          {location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          )}

          {/* Amenities */}
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            {venue.meta.wifi && <Wifi className="h-4 w-4" />}
            {venue.meta.parking && <Car className="h-4 w-4" />}
            {venue.meta.breakfast && <Coffee className="h-4 w-4" />}
            {venue.meta.pets && <PawPrint className="h-4 w-4" />}
          </div>

          {/* Price */}
          <p className="mt-3 font-bold">
            ${venue.price}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / night
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
