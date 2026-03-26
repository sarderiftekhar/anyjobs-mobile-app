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
    }

    if (__DEV__) {
      console.error(
        `[API Error] ${error.response?.status} ${error.config?.url}`,
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
