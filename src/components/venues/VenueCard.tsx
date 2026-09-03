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
  /** Spans two grid columns with a wider crop. Used for the first result. */
  featured?: boolean;
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

export function VenueCard({ venue, featured = false, index = 0 }: VenueCardProps) {
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
        "shadow-(--elev-1) transition-shadow duration-(--motion-base) ease-(--ease-out)",
        "hover:shadow-(--elev-2)",
        "focus-within:ring-2 focus-within:ring-(--color-ring) focus-within:ring-offset-2",
        "focus-within:ring-offset-(--color-background)",
        featured && "sm:col-span-2",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-(--color-muted)",
          // The featured card is as tall as the row its neighbours set, so its
          // media grows to absorb the slack instead of leaving a gap above the
          // title. On mobile it is a single column, so a ratio applies again.
          featured
            ? "aspect-[2/1] sm:aspect-auto sm:min-h-70 sm:flex-1"
            : "aspect-[3/2]",
        )}
      >
        <img
          src={imageUrl}
          alt={venue.media[0]?.alt || venue.name}
          className="h-full w-full object-cover transition-transform duration-(--motion-slow) ease-(--ease-out) group-hover:scale-[1.04]"
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
          <Heart className="h-[18px] w-[18px]" fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>

      <div
        className={cn(
          "flex flex-col",
          // Only the standard card stretches its content box — that is what
          // lets `mt-auto` below pin prices to a shared baseline across a row.
          // On the featured card the *media* absorbs the slack instead, so the
          // content box stays its natural height and leaves no gap.
          featured ? "p-5" : "flex-1 p-4",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "font-display font-semibold leading-snug line-clamp-1",
              featured ? "text-xl" : "text-base",
            )}
          >
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

        {/* Always occupies a line, so the price below keeps a shared baseline
            across every card in the row even when a venue has no location. */}
        <p className="mt-1 flex min-h-5 items-center gap-1 text-xs text-(--color-muted-foreground)">
          {location && (
            <>
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{location}</span>
            </>
          )}
        </p>

        {!featured && (
          <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-relaxed text-(--color-muted-foreground)">
            {truncate(venue.description, 100)}
          </p>
        )}

        {amenities.length > 0 && (
          <p className="mt-2 line-clamp-1 text-xs text-(--color-muted-foreground)">
            {amenities.join(" · ")}
          </p>
        )}

        {/* mt-auto pins the price row to the bottom of every card regardless of
            how much metadata sits above it. */}
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-3">
          <p className="tnum">
            <span
              className={cn(
                "font-display font-bold text-(--color-accent-brand)",
                featured ? "text-2xl" : "text-lg",
              )}
            >
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
