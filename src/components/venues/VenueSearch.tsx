import { useState } from "react";
import { useVenueStore } from "@/store/venueStore";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function VenueSearch() {
  // Pull search/sort state and setters from the global venue store so that
  // useVenues can react to changes and re-fetch automatically.
  const {
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  } = useVenueStore();

  // `inputValue` is local controlled state for the text input.
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
    setCurrentPage(1);
  };

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value === "") {
      setSearchQuery("");
      setCurrentPage(1);
    }
  };

  // Update sort field in the store and reset pagination so results are
  // consistent with the new sort order from page 1.
  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-(--radius) border border-(--color-border) bg-(--color-card) p-4 shadow-sm">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-muted-foreground)" />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search venues by name..."
            className="flex h-10 w-full rounded-(--radius) border border-(--color-input) bg-(--color-background) pl-9 pr-9 py-2 text-sm placeholder:text-(--color-muted-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)"
            aria-label="Search venues"
          />
          {/* Show the clear button only when there is text in the input */}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted-foreground) hover:text-(--color-foreground)"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Sort controls — only shown when not in search mode */}
      {!searchQuery && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-(--color-muted-foreground)">Sort:</span>
          <select
            value={sortBy}
            onChange={handleSortBy}
            className="h-8 text-xs rounded-(--radius) border border-(--color-input) bg-(--color-background) px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)"
            aria-label="Sort by"
          >
            <option value="created">Date added</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
          <select
            value={sortOrder}
            onChange={handleSortOrder}
            className="h-8 text-xs rounded-(--radius) border border-(--color-input) bg-(--color-background) px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)"
            aria-label="Sort order"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      )}
    </div>
  );
}
