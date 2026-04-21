import type { AuthUser } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  isVenueManager: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user: AuthUser) => set({ user, token: user.accessToken }),

      clearAuth: () => set({ user: null, token: null }),

      isVenueManager: () => get().user?.venueManager ?? false,
    }),
    {
      name: "holidaze_auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
