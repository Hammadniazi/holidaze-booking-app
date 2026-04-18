import { MapPinIcon, StarIcon, UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_VENUES = [
  {
    id: "1",
    name: "Beachfront Villa Santorini",
    location: "Santorini, Greece",
    price: 320,
    rating: 4.9,
    maxGuests: 6,
    tags: ["Beach", "Pool"],
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
  },
  {
    id: "2",
    name: "Alpine Cabin Retreat",
    location: "Innsbruck, Austria",
    price: 185,
    rating: 4.7,
    maxGuests: 4,
    tags: ["Mountains", "Fireplace"],
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  },
  {
    id: "3",
    name: "Downtown Loft Oslo",
    location: "Oslo, Norway",
    price: 140,
    rating: 4.5,
    maxGuests: 2,
    tags: ["City", "WiFi"],
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  },
  {
    id: "4",
    name: "Tuscany Farmhouse",
    location: "Florence, Italy",
    price: 250,
    rating: 4.8,
    maxGuests: 8,
    tags: ["Countryside", "Wine"],
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    id: "5",
    name: "Coastal Cottage Cornwall",
    location: "Cornwall, UK",
    price: 175,
    rating: 4.6,
    maxGuests: 5,
    tags: ["Sea View", "Garden"],
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80",
  },
  {
    id: "6",
    name: "Desert Oasis Marrakech",
    location: "Marrakech, Morocco",
    price: 210,
    rating: 4.9,
    maxGuests: 3,
    tags: ["Pool", "Unique"],
    image:
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80",
  },
];

const VenueListPage = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero / Search */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Find your perfect stay
        </h1>
        <p className="text-muted-foreground mb-6">
          Browse holiday venues from around the world
        </p>
        <div className="mx-auto flex max-w-lg gap-2">
          <Input placeholder="Search destinations…" className="h-10" />
          <Button className="h-10 px-6">Search</Button>
        </div>
      </div>

      {/* Venue Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_VENUES.map((venue) => (
          <Card key={venue.id} className="overflow-hidden p-0 gap-0">
            <img
              src={venue.image}
              alt={venue.name}
              className="h-48 w-full object-cover"
            />
            <CardHeader className="pt-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {venue.name}
                </CardTitle>
                <span className="flex items-center gap-1 text-sm font-medium shrink-0">
                  <StarIcon className="size-4 fill-yellow-400 text-yellow-400" />
                  {venue.rating}
                </span>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {venue.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {venue.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <UsersIcon className="size-4" />
                Up to {venue.maxGuests} guests
              </span>
              <span className="font-semibold">
                ${venue.price}
                <span className="text-xs font-normal text-muted-foreground">
                  /night
                </span>
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export const VenueListPageSkeleton = () => (
  <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-xl" />
      ))}
    </div>
  </section>
);

export default VenueListPage;
