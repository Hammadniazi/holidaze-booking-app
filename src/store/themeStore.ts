import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
}
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark:
        typeof window !== "undefined"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : false,

      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        document.documentElement.classList.toggle("dark", next);
      },
      setDark: (value: boolean) => {
        set({ isDark: value });
        document.documentElement.classList.toggle("dark", value);
      },
    }),

    {
      name: "holidaze_theme",
      // Re-apply the dark class after localStorage rehydrates on page refresh,
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle("dark", state.isDark);
        }
      },
    },
  ),
);
