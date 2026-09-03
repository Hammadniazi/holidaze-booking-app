import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VenueCard } from "@/components/venues/VenueCard";
import type { Venue } from "@/types";

// Mock TanStack Router — VenueCard uses <Link> which requires a router context
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    params?: Record<string, string>;
    [key: string]: unknown;
  }) => (
    <a href={params ? to.replace("$id", params.id ?? "") : to} {...rest}>
      {children}
    </a>
  ),
}));

const makeVenue = (overrides: Partial<Venue> = {}): Venue => ({
  id: "venue-1",
  name: "Ocean View Suite",
  description: "A beautiful seaside venue perfect for your getaway.",
  media: [{ url: "https://example.com/photo.jpg", alt: "Ocean view" }],
  price: 150,
  maxGuests: 4,
  rating: 4.5,
  meta: { wifi: false, parking: false, breakfast: false, pets: false },
  location: {
    address: null,
    city: "Oslo",
    zip: null,
    country: "Norway",
    continent: null,
    lat: 0,
    lng: 0,
  },
  created: "2025-01-01",
  updated: "2025-01-01",
  ...overrides,
});

describe("VenueCard", () => {
  it("renders the venue name", () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(screen.getByText("Ocean View Suite")).toBeInTheDocument();
  });

  it("renders the formatted price with NOK currency", () => {
    render(<VenueCard venue={makeVenue({ price: 250 })} />);
    expect(screen.getByText(/NOK/)).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();
  });

  it("renders the city and country as location", () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(screen.getByText("Oslo, Norway")).toBeInTheDocument();
  });

  it("renders the rating value", () => {
    render(<VenueCard venue={makeVenue({ rating: 4.5 })} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("shows a New chip instead of 0.0 for an unrated venue", () => {
    render(<VenueCard venue={makeVenue({ rating: 0 })} />);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
  });

  it("shows the rating rather than a New chip once a venue is rated", () => {
    render(<VenueCard venue={makeVenue({ rating: 3.2 })} />);
    expect(screen.getByText("3.2")).toBeInTheDocument();
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("exposes the favourite control as a labelled button", () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(
      screen.getByRole("button", { name: /favourites/i }),
    ).toBeInTheDocument();
  });

  it("renders a truncated description", () => {
    const longDesc = "A".repeat(120);
    render(<VenueCard venue={makeVenue({ description: longDesc })} />);
    // truncate at 100 chars + ellipsis — should NOT show the full 120 char string
    expect(screen.queryByText(longDesc)).not.toBeInTheDocument();
    expect(screen.getByText(/…/)).toBeInTheDocument();
  });

  // Amenities are visible text, not icon-only tooltips. `title` was reachable
  // by neither keyboard nor touch, and the icons were aria-hidden, so amenity
  // information was unavailable to screen readers browsing the grid. These
  // assertions therefore check what a user can actually perceive.
  it("lists WiFi when meta.wifi is true", () => {
    render(<VenueCard venue={makeVenue({ meta: { wifi: true, parking: false, breakfast: false, pets: false } })} />);
    expect(screen.getByText("Wifi")).toBeInTheDocument();
  });

  it("does not list WiFi when meta.wifi is false", () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(screen.queryByText(/Wifi/)).not.toBeInTheDocument();
  });

  it("lists Parking when meta.parking is true", () => {
    render(<VenueCard venue={makeVenue({ meta: { wifi: false, parking: true, breakfast: false, pets: false } })} />);
    expect(screen.getByText("Parking")).toBeInTheDocument();
  });

  it("lists Breakfast when meta.breakfast is true", () => {
    render(<VenueCard venue={makeVenue({ meta: { wifi: false, parking: false, breakfast: true, pets: false } })} />);
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
  });

  it("lists Pets allowed when meta.pets is true", () => {
    render(<VenueCard venue={makeVenue({ meta: { wifi: false, parking: false, breakfast: false, pets: true } })} />);
    expect(screen.getByText("Pets allowed")).toBeInTheDocument();
  });

  it("lists every amenity when all meta flags are true", () => {
    render(
      <VenueCard
        venue={makeVenue({ meta: { wifi: true, parking: true, breakfast: true, pets: true } })}
      />,
    );
    expect(
      screen.getByText("Wifi · Parking · Breakfast · Pets allowed"),
    ).toBeInTheDocument();
  });

  it("renders no amenity line when every meta flag is false", () => {
    render(<VenueCard venue={makeVenue()} />);
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it("renders the venue image with correct alt text", () => {
    render(<VenueCard venue={makeVenue()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Ocean view");
  });

  it("uses venue name as image alt when media alt is missing", () => {
    const venue = makeVenue({ media: [{ url: "https://example.com/img.jpg" }] });
    render(<VenueCard venue={venue} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Ocean View Suite");
  });

  it("renders guest count", () => {
    render(<VenueCard venue={makeVenue({ maxGuests: 6 })} />);
    expect(screen.getByText(/6/)).toBeInTheDocument();
  });
});
