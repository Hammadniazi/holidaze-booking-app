import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  DEFAULT_SORT,
  GUEST_OPTIONS,
  SORT_OPTIONS,
  type SortValue,
  type VenueListSearch,
} from "./venueListSearch";

interface VenueSearchProps {
  search: VenueListSearch;
}

export function VenueSearch({ search }: VenueSearchProps) {
  const navigate = useNavigate();
  const query = search.q ?? "";

  const [inputValue, setInputValue] = useState(query);
  // Back and Forward change the query under a mounted form. Adjusting state
  // during render (rather than in an effect) keeps the box in step without a
  // flash of the old text, and without remounting away the user's focus.
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setInputValue(query);
  }

  // Every change starts again from page 1. Each one is its own history entry,
  // so Back steps through searches; the page keeps its scroll position.
  const update = (patch: Omit<VenueListSearch, "page">) =>
    void navigate({
      to: "/",
      search: { ...search, ...patch, page: undefined },
      resetScroll: false,
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update({ q: inputValue.trim() || undefined });
  };

  const clear = () => {
    setInputValue("");
    update({ q: undefined });
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortValue;
    update({ sort: value === DEFAULT_SORT ? undefined : value });
  };

  const fieldCls =
    "w-full bg-transparent text-base sm:text-sm font-medium text-(--color-foreground) " +
    "placeholder:font-normal placeholder:text-(--color-muted-foreground) " +
    "focus-visible:outline-none";
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
      <div
        className="relative min-w-0 flex-[2] rounded-(--radius) px-3.5 py-2
                   has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-(--color-ring)
                   sm:rounded-full sm:hover:bg-(--color-muted)"
      >
        <label htmlFor="venue-search" className={labelCls}>
          Where
        </label>
        <input
          id="venue-search"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (e.target.value === "" && query) update({ q: undefined });
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
                       hover:bg-(--color-muted) hover:text-(--color-foreground)
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="hidden h-9 w-px shrink-0 bg-(--color-border) sm:block" aria-hidden="true" />

      {/* Guests */}
      <div
        className="min-w-0 flex-1 rounded-(--radius) px-3.5 py-2
                   has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-(--color-ring)
                   sm:rounded-full sm:hover:bg-(--color-muted)"
      >
        <label htmlFor="venue-guests" className={labelCls}>
          Guests
        </label>
        <select
          id="venue-guests"
          value={search.guests ?? 0}
          onChange={(e) =>
            update({ guests: Number(e.target.value) || undefined })
          }
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
      <div
        className="min-w-0 flex-1 rounded-(--radius) px-3.5 py-2
                   has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-(--color-ring)
                   sm:rounded-full sm:hover:bg-(--color-muted)"
      >
        <label htmlFor="venue-sort" className={labelCls}>
          Sort by
        </label>
        <select
          id="venue-sort"
          value={search.sort ?? DEFAULT_SORT}
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
