import { authApi } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, AuthUser } from "@/types";
import { useCallback } from "react";
import { toast } from "sonner";

export function useAuth() {
  const { user, setAuth, token } = useAuthStore();
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
  return {
    user,
    login,
    token,
  };
}
