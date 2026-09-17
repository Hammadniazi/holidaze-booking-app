import { describe, it, expect } from "vitest";
import { parseVenueListSearch } from "@/components/venues/venueListSearch";

describe("parseVenueListSearch", () => {
  it("returns an empty object for the plain homepage", () => {
    expect(parseVenueListSearch({})).toEqual({
      q: undefined,
      sort: undefined,
      page: undefined,
      guests: undefined,
    });
  });

  it("keeps valid values", () => {
    expect(
      parseVenueListSearch({ q: "cabin", sort: "price:asc", page: 3, guests: 4 }),
    ).toEqual({ q: "cabin", sort: "price:asc", page: 3, guests: 4 });
  });

  it("reads numbers that arrive as strings", () => {
    const result = parseVenueListSearch({ page: "2", guests: "6" });
    expect(result.page).toBe(2);
    expect(result.guests).toBe(6);
  });

  it("trims the query and drops a blank one", () => {
    expect(parseVenueListSearch({ q: "  lodge " }).q).toBe("lodge");
    expect(parseVenueListSearch({ q: "   " }).q).toBeUndefined();
  });

  it("drops the default sort and unknown sorts", () => {
    expect(parseVenueListSearch({ sort: "rating:desc" }).sort).toBeUndefined();
    expect(parseVenueListSearch({ sort: "owner:asc" }).sort).toBeUndefined();
  });

  it("drops page 1 and malformed pages and guest counts", () => {
    expect(parseVenueListSearch({ page: 1 }).page).toBeUndefined();
    expect(parseVenueListSearch({ page: -2 }).page).toBeUndefined();
    expect(parseVenueListSearch({ page: "abc" }).page).toBeUndefined();
    expect(parseVenueListSearch({ guests: 2.5 }).guests).toBeUndefined();
    expect(parseVenueListSearch({ guests: 0 }).guests).toBeUndefined();
  });
});
