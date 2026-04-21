import { create } from "zustand";
import { storage } from "../lib/storage";
import { config } from "../constants/config";
import { authApi } from "../api/auth";
import { registerPushToken, unregisterPushToken } from "../lib/pushNotifications";
import type { User } from "../types/user";
import type { LoginPayload, RegisterPayload } from "../api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(data);
      const { user, token } = response.data.data!;

      await storage.set(config.TOKEN_KEY, token);
      await storage.set(config.USER_KEY, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      registerPushToken().catch(() => {});
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Login failed. Please try again.";
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { user, token } = response.data.data!;

      await storage.set(config.TOKEN_KEY, token);
      await storage.set(config.USER_KEY, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      registerPushToken().catch(() => {});
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Registration failed. Please try again.";
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    // Remove push token server-side before clearing auth so the request is authorized
    await unregisterPushToken().catch(() => {});
    try {
      await authApi.logout();
    } catch {
      // Ignore errors during logout
    }
    await storage.remove(config.TOKEN_KEY);
    await storage.remove(config.USER_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  loadStoredAuth: async () => {
    try {
      const token = await storage.get(config.TOKEN_KEY);
      const userJson = await storage.get(config.USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Refresh user data + re-register push token in background
        get().refreshUser();
        registerPushToken().catch(() => {});
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const response = await authApi.getUser();
      const user = response.data.data!;
      await storage.set(config.USER_KEY, JSON.stringify(user));
      set({ user });
    } catch {
      // If refresh fails (401), clear auth
      const token = await storage.get(config.TOKEN_KEY);
      if (!token) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user }),
}));
