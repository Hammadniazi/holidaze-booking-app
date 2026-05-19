export interface MediaItem {
  url: string;
  alt?: string;
}
export interface Booking {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  created: string;
  updated: string;
  venue?: Venue;
  customer?: Profile;
}
export interface VenueMeta {
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
}
export interface VenueLocation {
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  continent: string | null;
  lat: number;
  lng: number;
}
export interface Profile {
  name: string;
  email: string;
  bio?: string;
  avatar?: { url?: string; alt?: string };
  banner?: { url?: string; alt?: string };
  venueManager: boolean;
  _count?: {
    venues: number;
    bookings: number;
  };
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  media: MediaItem[];
  price: number;
  maxGuests: number;
  rating: number;
  created: string;
  updated: string;
  meta: VenueMeta;
  location: VenueLocation;
  owner?: Profile;
  bookings?: Booking[];
  _count?: {
    bookings: number;
  };
}
export interface PaginationMeta {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: PaginationMeta | Record<string, never>;
}
export interface AuthUser extends Profile {
  accessToken: string;
}
