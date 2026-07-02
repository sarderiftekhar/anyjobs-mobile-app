import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "../constants/config";
import { storage } from "../lib/storage";

// Common headers — includes Host header for Laragon virtual host routing
const commonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
if (config.API_HOST) {
  commonHeaders["Host"] = config.API_HOST;
}

const apiClient = axios.create({
  baseURL: config.API_MOBILE_URL,
  timeout: 15000,
  headers: commonHeaders,
});

// Public API client (for endpoints that don't need auth)
export const publicApiClient = axios.create({
  baseURL: config.API_PUBLIC_URL,
  timeout: 15000,
  headers: commonHeaders,
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    const token = await storage.get(config.TOKEN_KEY);
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log(`[API] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored auth
      await storage.remove(config.TOKEN_KEY);
      await storage.remove(config.USER_KEY);

      // Also reset the in-memory auth state so AuthRedirect sends the user
      // back to the welcome screen. Without this the UI stays half
      // authenticated (isAuthenticated=true, token gone) and every screen
      // just spins on failing requests until an app restart.
      // Lazy require: authStore -> authApi -> client would be an import cycle.
      try {
        const { useAuthStore } = require("../stores/authStore");
        if (useAuthStore.getState().isAuthenticated) {
          useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        // Store unavailable (e.g. module init order) — storage is already
        // cleared, so the next cold start lands on the welcome screen.
      }
    }

    if (__DEV__) {
      // console.warn (not .error) — real errors are re-thrown below and
      // surfaced in UI by callers. Using .error here triggers RN LogBox's
      // red banner even for transient/expected failures (timeouts, 401 on
      // refresh), which is noisy in dev.
      console.warn(
        `[API Error] ${error.response?.status ?? "network"} ${error.config?.url ?? ""}`,
        error.response?.data ?? error.message,
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
