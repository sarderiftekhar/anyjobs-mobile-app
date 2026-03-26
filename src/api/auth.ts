import apiClient from "./client";
import type { ApiResponse, AuthResponse } from "../types/api";
import type { User } from "../types/user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type: "candidate" | "employer";
}

export interface GoogleAuthPayload {
  id_token: string;
  user_type?: "candidate" | "employer";
}

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data),

  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data),

  googleAuth: (data: GoogleAuthPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/google", data),

  logout: () => apiClient.post<ApiResponse>("/auth/logout"),

  getUser: () => apiClient.get<ApiResponse<User>>("/auth/user"),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse>("/auth/forgot-password", { email }),

  resendVerification: () =>
    apiClient.post<ApiResponse>("/auth/verify-email/resend"),
};
