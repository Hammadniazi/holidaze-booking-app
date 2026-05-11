import type { AuthUser } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user: AuthUser) => set({ user, token: user.accessToken }),

      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "holidaze_auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
