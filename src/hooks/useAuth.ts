import { authApi } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, AuthUser } from "@/types";
import { useCallback } from "react";
import { toast } from "sonner";

export function useAuth() {
  const { user, setAuth, token, clearAuth } = useAuthStore();
  const login = useCallback(
    async (email: string, password: string) => {
      const res = (await authApi.login({
        email,
        password,
      })) as ApiResponse<AuthUser>;
      setAuth(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      return res.data;
    },
    [setAuth],
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      bio?: string;
      venueManager?: boolean;
      avatar?: { url?: string; alt?: string };
    }) => {
      await authApi.register(data);
      toast.success("Account created successfully! Please log in.");
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
    toast.success("Logged out successfully.");
  }, [clearAuth]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isVenueManager: !!user?.venueManager,
    login,
    register,
    logout,
  };
}
