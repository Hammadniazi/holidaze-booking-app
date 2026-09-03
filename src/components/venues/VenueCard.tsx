import { Link } from "@tanstack/react-router";
import type { Venue } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  buildImageUrl,
  VENUE_PLACEHOLDER,
  truncate,
  cn,
} from "@/utils";
import { Star, MapPin, Users, Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";

interface VenueCardProps {
  venue: Venue;
  /** Index within the grid, used to stagger the entrance. */
  index?: number;
}

/** Amenity labels, as text. Icons alone left this information unavailable to
 *  screen-reader and touch users, and cluttered the photography. */
function amenityLabels(meta: Venue["meta"]): string[] {
  const out: string[] = [];
  if (meta.wifi) out.push("Wifi");
  if (meta.parking) out.push("Parking");
  if (meta.breakfast) out.push("Breakfast");
  if (meta.pets) out.push("Pets allowed");
  return out;
}

/**
 * Every card is identical by design.
 *
 * A results grid exists so people can compare listings, which depends on price,
 * rating and photo sitting in the same place in every card. An oversized lead
 * card breaks that scan and implies an editorial ranking this data does not
 * have — the first result is simply whatever sorted first.
 */
export function VenueCard({ venue, index = 0 }: VenueCardProps) {
  const imageUrl = buildImageUrl(venue.media[0]?.url, VENUE_PLACEHOLDER);
  const location = [venue.location.city, venue.location.country]
    .filter(Boolean)
    .join(", ");
  const favorited = useFavoritesStore((state) => state.ids.includes(venue.id));
  const toggle = useFavoritesStore((state) => state.toggle);
  const amenities = amenityLabels(venue.meta);
  const isRated = venue.rating > 0;

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
      className={cn(
        "group animate-card-in relative flex flex-col overflow-hidden",
        "rounded-(--radius-lg) border border-(--color-border) bg-(--color-card)",
        "shadow-(--elev-1) transition-shadow duration-(--motion-base) ease-out",
        "hover:shadow-(--elev-2)",
        "focus-within:ring-2 focus-within:ring-(--color-ring) focus-within:ring-offset-2",
        "focus-within:ring-offset-(--color-background)",
      )}
    >
      <div className="relative aspect-3/2 overflow-hidden bg-(--color-muted)">
        <img
          src={imageUrl}
          alt={venue.media[0]?.alt || venue.name}
          /* Absolute so the image contributes nothing to the media box's
             intrinsic height. Venue photos are host-uploaded and unconstrained;
             in flow, a portrait source resolves `h-full` against an auto-height
             parent and renders at its natural ratio, stretching the grid row. */
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-(--motion-slow) ease-out group-hover:scale-[1.04]"
          loading={index < 4 ? "eager" : "lazy"}
          onError={(e) => {
            (e.target as HTMLImageElement).src = VENUE_PLACEHOLDER;
          }}
        />

        {/* Sits above the stretched link so it stays independently clickable —
            it is a sibling of the link, never nested inside it. */}
        <button
          type="button"
          aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={favorited}
          onClick={() => toggle(venue.id)}
          className={cn(
            "absolute right-2.5 top-2.5 z-20 grid h-11 w-11 place-items-center rounded-full",
            "backdrop-blur-sm transition-[background-color,color,transform] duration-(--motion-fast)",
            "active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            favorited
              ? "bg-white/90 text-(--color-destructive) shadow-(--elev-1)"
              : "bg-black/35 text-white hover:bg-white/85 hover:text-(--color-destructive)",
          )}
        >
          <Heart className="h-4.5 w-4.5" fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-display text-base font-semibold leading-snug">
            {/* Stretched link: the whole card is the click target, without
                nesting interactive elements inside an anchor. */}
            <Link
              to="/venue/$id"
              params={{ id: venue.id }}
              className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
            >
              {venue.name}
            </Link>
          </h3>

          {isRated ? (
            <span
              className="tnum flex shrink-0 items-center gap-1 text-sm font-medium"
              aria-label={`Rated ${venue.rating.toFixed(1)} out of 5`}
            >
              <Star
                className="h-4 w-4 fill-(--color-star) text-(--color-star)"
                aria-hidden="true"
              />
              <span aria-hidden="true">{venue.rating.toFixed(1)}</span>
            </span>
          ) : (
            <Badge variant="outline" className="shrink-0 font-medium">
              New
            </Badge>
          )}
        </div>

        {/* Each of the next three blocks reserves its height, so the price row
            lands on the same baseline in every card whether or not a venue has
            a location, a description, or amenities. */}
        <p className="mt-1 flex min-h-5 items-center gap-1 text-xs text-(--color-muted-foreground)">
          {location && (
            <>
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{location}</span>
            </>
          )}
        </p>

        <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-relaxed text-(--color-muted-foreground)">
          {truncate(venue.description, 100)}
        </p>

        <p className="mt-2 line-clamp-1 min-h-4 text-xs text-(--color-muted-foreground)">
          {amenities.join(" · ")}
        </p>

        <div className="mt-auto flex items-baseline justify-between gap-2 pt-3">
          <p className="tnum">
            <span className="font-display text-lg font-bold text-(--color-accent-brand)">
              {formatPrice(venue.price)}
            </span>
            <span className="text-xs text-(--color-muted-foreground)"> / night</span>
          </p>
          <span className="flex shrink-0 items-center gap-1 text-xs text-(--color-muted-foreground)">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Up to {venue.maxGuests}
          </span>
        </div>
      </div>
    </article>
  );
}
