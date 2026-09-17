import { beforeEach, describe, it, expect } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useVenueStore } from "@/store/venueStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import type { AuthUser, Venue } from "@/types";

// ---------------------------------------------------------------------------
// authStore
// ---------------------------------------------------------------------------
describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  const mockUser: AuthUser = {
    name: "testuser",
    email: "testuser@stud.noroff.no",
    venueManager: false,
    accessToken: "test-token-abc",
  };

  it("starts with no user and no token", () => {
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it("setAuth stores the user and extracts the accessToken as token", () => {
    useAuthStore.getState().setAuth(mockUser);
    const { user, token } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(token).toBe("test-token-abc");
  });

  it("setAuth overwrites a previously stored user", () => {
    useAuthStore.getState().setAuth(mockUser);
    const updatedUser: AuthUser = {
      ...mockUser,
      name: "newuser",
      accessToken: "new-token-xyz",
    };
    useAuthStore.getState().setAuth(updatedUser);
    const { user, token } = useAuthStore.getState();
    expect(user?.name).toBe("newuser");
    expect(token).toBe("new-token-xyz");
  });

  it("clearAuth resets user and token to null", () => {
    useAuthStore.getState().setAuth(mockUser);
    useAuthStore.getState().clearAuth();
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it("setAuth with venueManager: true stores the flag correctly", () => {
    const managerUser: AuthUser = { ...mockUser, venueManager: true };
    useAuthStore.getState().setAuth(managerUser);
    expect(useAuthStore.getState().user?.venueManager).toBe(true);
  });

  it("setAuth with venueManager: false stores the flag correctly", () => {
    useAuthStore.getState().setAuth(mockUser);
    expect(useAuthStore.getState().user?.venueManager).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// venueStore
// ---------------------------------------------------------------------------
const makeVenue = (id: string, name: string): Venue => ({
  id,
  name,
  description: "Test description",
  media: [],
  price: 100,
  maxGuests: 2,
  rating: 4.0,
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
});

describe("venueStore", () => {
  beforeEach(() => {
    useVenueStore.setState({
      venues: [],
      currentVenue: null,
      totalCount: 0,
      isLoading: false,
      error: null,
    });
  });

  it("starts with empty venues and default state", () => {
    const { venues, totalCount, isLoading, error } = useVenueStore.getState();
    expect(venues).toHaveLength(0);
    expect(totalCount).toBe(0);
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
  });

  it("setVenues stores venues and defaults totalCount to 0 when not provided", () => {
    const list = [makeVenue("1", "Alpha"), makeVenue("2", "Beta")];
    useVenueStore.getState().setVenues(list);
    const { venues, totalCount } = useVenueStore.getState();
    expect(venues).toHaveLength(2);
    expect(totalCount).toBe(0);
  });

  it("setVenues stores the explicit totalCount when provided", () => {
    const list = [makeVenue("1", "Alpha")];
    useVenueStore.getState().setVenues(list, 200);
    expect(useVenueStore.getState().totalCount).toBe(200);
  });

  it("setCurrentVenue stores a single venue", () => {
    const venue = makeVenue("abc", "Ocean Suite");
    useVenueStore.getState().setCurrentVenue(venue);
    expect(useVenueStore.getState().currentVenue?.id).toBe("abc");
  });

  it("setCurrentVenue clears the current venue when called with null", () => {
    useVenueStore.getState().setCurrentVenue(makeVenue("1", "Test"));
    useVenueStore.getState().setCurrentVenue(null);
    expect(useVenueStore.getState().currentVenue).toBeNull();
  });

  it("setLoading updates the loading flag", () => {
    useVenueStore.getState().setLoading(true);
    expect(useVenueStore.getState().isLoading).toBe(true);
    useVenueStore.getState().setLoading(false);
    expect(useVenueStore.getState().isLoading).toBe(false);
  });

  it("setError stores the error message", () => {
    useVenueStore.getState().setError("Network failure");
    expect(useVenueStore.getState().error).toBe("Network failure");
  });

  it("setError clears the error when called with null", () => {
    useVenueStore.getState().setError("Some error");
    useVenueStore.getState().setError(null);
    expect(useVenueStore.getState().error).toBeNull();
  });

});

// ---------------------------------------------------------------------------
// favoritesStore
// ---------------------------------------------------------------------------
describe("favoritesStore", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ ids: [] });
  });

  it("toggle adds an id that is not saved", () => {
    useFavoritesStore.getState().toggle("venue-1");
    expect(useFavoritesStore.getState().ids).toEqual(["venue-1"]);
  });

  it("toggle removes an id that is already saved", () => {
    useFavoritesStore.setState({ ids: ["venue-1", "venue-2"] });
    useFavoritesStore.getState().toggle("venue-1");
    expect(useFavoritesStore.getState().ids).toEqual(["venue-2"]);
  });

  it("remove drops an id and stays put when called again", () => {
    // The saved list prunes venues the API reports as 404. toggle cannot do
    // that job: a second call puts the id back, which is what StrictMode's
    // double effect and every retry would trigger.
    useFavoritesStore.setState({ ids: ["venue-1", "venue-2"] });
    useFavoritesStore.getState().remove("venue-1");
    useFavoritesStore.getState().remove("venue-1");
    expect(useFavoritesStore.getState().ids).toEqual(["venue-2"]);
  });

  it("remove leaves the list alone when the id was never saved", () => {
    useFavoritesStore.setState({ ids: ["venue-1"] });
    useFavoritesStore.getState().remove("venue-9");
    expect(useFavoritesStore.getState().ids).toEqual(["venue-1"]);
  });
});
