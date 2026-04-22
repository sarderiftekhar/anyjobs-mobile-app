import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { DashboardAnalytics, JobAnalytics } from "../types/analytics";

/**
 * Analytics API (employer role).
 *
 * NOTE ON BACKEND:
 * - The /v1/mobile namespace does not currently expose analytics endpoints.
 *   Routes expected here (to be added backend-side):
 *     GET /v1/mobile/employer/analytics/dashboard
 *     GET /v1/mobile/employer/jobs/{id}/analytics
 * - The existing web route `GET /employer/jobs/{job}/analytics`
 *   (see routes/employer.php, JobController@analytics) is the authoritative
 *   data source. A thin mobile wrapper should forward to that controller.
 * - Until the mobile routes exist, these calls 404 — UI handles that
 *   gracefully by showing an empty state.
 */
export const analyticsApi = {
  getDashboard: (params?: { range?: "7d" | "30d" | "90d" }) =>
    apiClient.get<ApiResponse<DashboardAnalytics>>("/employer/analytics/dashboard", { params }),

  getJobAnalytics: (jobId: number, params?: { range?: "7d" | "30d" | "90d" }) =>
    apiClient.get<ApiResponse<JobAnalytics>>(`/employer/jobs/${jobId}/analytics`, { params }),
};
