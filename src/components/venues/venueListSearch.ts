/**
 * The venue list's search, sort, guest and page state, as URL search params.
 *
 * It lived in a memory-only store, so a refresh reset it, a results page could
 * not be shared, and Back did not step through searches. The URL is now the
 * source of truth. Defaults are left out of it, so the plain homepage stays `/`.
 */

/** Combined sort options. One control instead of two, and the labels say what
 *  the user gets rather than naming a field and a direction. */
export const SORT_OPTIONS = [
  { value: "created:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "rating:desc", label: "Top rated" },
  { value: "name:asc", label: "Name: A–Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// Default: top rated. Sorting by created:desc opened the homepage on whatever
// was submitted last, which on a shared API is the newest test row — a rating
// is the only signal in the data that a listing is real.
export const DEFAULT_SORT: SortValue = "rating:desc";

export const GUEST_OPTIONS = [0, 1, 2, 4, 6, 8] as const;

export interface VenueListSearch {
  q?: string;
  sort?: SortValue;
  page?: number;
  /** Client-side refinement; absent = any. The Noroff list endpoint has no
   *  guest filter, so this narrows the fetched page, not the catalogue. */
  guests?: number;
}

const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((o) => o.value));

function positiveInt(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/** Route `validateSearch`: anything malformed or default falls away rather
 *  than erroring, so a hand-edited or stale link still opens the list. */
export function parseVenueListSearch(
  search: Record<string, unknown>,
): VenueListSearch {
  const q = typeof search.q === "string" ? search.q.trim() : "";
  const sort =
    typeof search.sort === "string" &&
    SORT_VALUES.has(search.sort) &&
    search.sort !== DEFAULT_SORT
      ? (search.sort as SortValue)
      : undefined;
  const page = positiveInt(search.page);
  const guests = positiveInt(search.guests);

  return {
    q: q || undefined,
    sort,
    page: page && page > 1 ? page : undefined,
    guests,
  };
}

/* The list's last search, so "All venues" on a detail page returns to the
   results the user came from rather than an unfiltered page 1. Per tab and
   in memory only: a fresh visit should open the plain list. */
let lastListSearch: VenueListSearch = {};

export function rememberListSearch(search: VenueListSearch) {
  lastListSearch = search;
}

export function getLastListSearch(): VenueListSearch {
  return lastListSearch;
}
