import { useState } from "react";
import { useVenueStore } from "@/store/venueStore";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

/** Combined sort options. One control instead of two, and the labels say what
 *  the user gets rather than naming a field and a direction. */
const SORT_OPTIONS = [
  { value: "created:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "rating:desc", label: "Top rated" },
  { value: "name:asc", label: "Name: A–Z" },
] as const;

const GUEST_OPTIONS = [0, 1, 2, 4, 6, 8] as const;

export function VenueSearch() {
  const {
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    minGuests,
    setMinGuests,
  } = useVenueStore();

  const [inputValue, setInputValue] = useState(searchQuery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
    setCurrentPage(1);
  };

  const clear = () => {
    setInputValue("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split(":");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const fieldCls =
    "w-full bg-transparent text-base sm:text-sm font-medium text-(--color-foreground) " +
    "placeholder:font-normal placeholder:text-(--color-muted-foreground) " +
    "focus:outline-none";
  const labelCls =
    "block text-[11px] font-semibold uppercase tracking-wider text-(--color-muted-foreground)";

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-1 rounded-(--radius-lg) border border-(--color-input)
                 bg-(--color-card) p-2 shadow-(--elev-2)
                 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5"
    >
      {/* Where */}
      <div className="relative min-w-0 flex-[2] rounded-(--radius) px-3.5 py-2 sm:rounded-full sm:hover:bg-(--color-muted)">
        <label htmlFor="venue-search" className={labelCls}>
          Where
        </label>
        <input
          id="venue-search"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (e.target.value === "") {
              setSearchQuery("");
              setCurrentPage(1);
            }
          }}
          placeholder="Search venues"
          className={`${fieldCls} pr-6`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center
                       rounded-full text-(--color-muted-foreground)
                       hover:bg-(--color-muted) hover:text-(--color-foreground)"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="hidden h-9 w-px shrink-0 bg-(--color-border) sm:block" aria-hidden="true" />

      {/* Guests */}
      <div className="min-w-0 flex-1 rounded-(--radius) px-3.5 py-2 sm:rounded-full sm:hover:bg-(--color-muted)">
        <label htmlFor="venue-guests" className={labelCls}>
          Guests
        </label>
        <select
          id="venue-guests"
          value={minGuests}
          onChange={(e) => setMinGuests(Number(e.target.value))}
          className={`${fieldCls} -ml-0.5 cursor-pointer`}
        >
          {GUEST_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n === 0 ? "Any" : `${n}+ guests`}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden h-9 w-px shrink-0 bg-(--color-border) sm:block" aria-hidden="true" />

      {/* Sort */}
      <div className="min-w-0 flex-1 rounded-(--radius) px-3.5 py-2 sm:rounded-full sm:hover:bg-(--color-muted)">
        <label htmlFor="venue-sort" className={labelCls}>
          Sort by
        </label>
        <select
          id="venue-sort"
          value={`${sortBy}:${sortOrder}`}
          onChange={handleSort}
          className={`${fieldCls} -ml-0.5 cursor-pointer`}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" variant="accent" className="shrink-0 sm:rounded-full sm:px-6">
        <Search className="h-4 w-4" aria-hidden="true" />
        Search
      </Button>
    </form>
  );
}
