export interface Profile {
  name: string;
  email: string;
}
export interface ApiResponse<T> {
  data: T;
}
export interface AuthUser extends Profile {
  accessToken: string;
}
export type UserRole = "customer" | "venueManager";
