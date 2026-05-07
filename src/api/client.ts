import type { ApiResponse, Venue } from "@/types";

const BASE_URL = "https://v2.api.noroff.dev";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

function getToken(): string | null {
  try {
    const stored = localStorage.getItem("holidaze_auth");
    if (!stored) return null;
    // Zustand persist wraps state as { state: { token, user }, version }
    const parsed = JSON.parse(stored) as {
      state?: { token?: string };
      token?: string;
    };
    return parsed.state?.token ?? parsed.token ?? null;
  } catch {
    return null;
  }
}
interface RequestOptions {
  method?: string;
  body?: unknown;
  requiresAuth?: boolean;
}
export class ApiError extends Error {
  status: number;
  errors?: Array<{ message: string }>;

  constructor(
    status: number,
    message: string,
    errors?: Array<{ message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, requiresAuth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (API_KEY) {
    headers["X-Noroff-API-Key"] = API_KEY;
  }

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.errors?.[0]?.message ?? json?.message ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, message, json?.errors);
  }

  return json as T;
}

// Auth

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    bio?: string;
    venueManager?: boolean;
    avatar?: { url?: string; alt?: string };
  }) =>
    request("/auth/register", {
      method: "POST",
      body: data,
      requiresAuth: false,
    }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login?_holidaze=true", {
      method: "POST",
      body: data,
      requiresAuth: false,
    }),
  createApiKey: () =>
    request("/auth/create-api-key", {
      method: "POST",
      body: { name: "Holidaze App Key" },
    }),
};
//  Venues

export const venuesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    sortOrder?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.sort) query.set("sort", params.sort);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
    return request<ApiResponse<Venue[]>>(
      `/holidaze/venues?_owner=true&${query.toString()}`,
      { requiresAuth: false },
    );
  },

  getOne: (id: string) =>
    request<ApiResponse<Venue>>(
      `/holidaze/venues/${id}?_owner=true&_bookings=true`,
      { requiresAuth: false },
    ),

  search: (query: string) =>
    request<ApiResponse<Venue[]>>(
      `/holidaze/venues/search?q=${encodeURIComponent(query)}&_owner=true`,
      { requiresAuth: false },
    ),
};

// Bookings Api

export const bookingsApi = {
  create: (data: {
    dateFrom: string;
    dateTo: string;
    guests: number;
    venueId: string;
  }) => request("/holidaze/bookings", { method: "POST", body: data }),

  delete: (id: string) =>
    request(`/holidaze/bookings/${id}`, { method: "DELETE" }),

  update: (
    id: string,
    data: { dateFrom?: string; dateTo?: string; guests?: number },
  ) => request(`/holidaze/bookings/${id}`, { method: "PUT", body: data }),
};

//  Profile Api

export const profileApi = {
  getOne: (name: string) =>
    request(`/holidaze/profiles/${name}?_bookings=true&_venues=true`),
  update: (
    name: string,
    data: {
      bio?: string;
      venueManager?: boolean;
      avatar?: { url?: string; alt?: string };
      banner?: { url?: string; alt?: string };
    },
  ) => request(`/holidaze/profiles/${name}`, { method: "PUT", body: data }),
};
