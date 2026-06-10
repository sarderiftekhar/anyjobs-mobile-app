import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { ProfileAnalysis } from "../types/profileExtras";

export const insightsApi = {
  // Analytics dashboard (shape is loose — rendered defensively in the UI).
  get: () => apiClient.get<ApiResponse<any>>("/profile/insights").then((r) => r.data.data),

  refresh: () =>
    apiClient.post<ApiResponse<any>>("/profile/insights/refresh").then((r) => r.data.data),
};

export const analysisApi = {
  get: () =>
    apiClient.get<ApiResponse<ProfileAnalysis | null>>("/profile/analysis").then((r) => r.data.data),

  generate: () =>
    apiClient.post<ApiResponse<ProfileAnalysis>>("/profile/analysis/generate").then((r) => r.data),

  confirm: () => apiClient.post<ApiResponse>("/profile/analysis/confirm").then((r) => r.data),

  regenerate: () =>
    apiClient.post<ApiResponse<ProfileAnalysis>>("/profile/analysis/regenerate").then((r) => r.data),

  checkRegeneration: () =>
    apiClient.get<ApiResponse<any>>("/profile/analysis/check-regeneration").then((r) => r.data.data),
};
