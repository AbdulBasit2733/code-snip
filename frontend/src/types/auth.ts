import type { User } from "./User";

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}