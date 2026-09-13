import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (id: string) => void;
  /**
   * Idempotent removal, for dropping an id the user did not ask to drop —
   * a venue its host has deleted. `toggle` cannot do this job: called twice
   * it puts the id back, which it duly did under StrictMode's double effect
   * and on every retry.
   */
  remove: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],

      toggle: (id: string) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((i) => i !== id)
            : [...state.ids, id],
        })),

      remove: (id: string) =>
        set((state) => ({ ids: state.ids.filter((i) => i !== id) })),
    }),
    {
      name: "holidaze_favorites",
    },
  ),
);
