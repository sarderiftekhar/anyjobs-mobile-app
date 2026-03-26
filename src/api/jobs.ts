import apiClient, { publicApiClient } from "./client";
import { transformJob } from "./transformers";
import type { Job, JobFilters } from "../types/job";
import type { PaginatedResponse, ApiResponse } from "../types/api";

/**
 * Transform paginated response — maps raw API job data to our Job type.
 */
function transformPaginatedJobs(response: any): PaginatedResponse<Job> {
  const raw = response.data;
  return {
    success: true,
    data: (raw.data ?? []).map(transformJob),
    meta: {
      current_page: raw.current_page ?? 1,
      last_page: raw.last_page ?? 1,
      per_page: raw.per_page ?? 20,
      total: raw.total ?? 0,
    },
  };
}

// Convert mobile hyphenated values to underscored API values
// Mobile: "full-time" → API validation: "full_time" → Backend converts to DB: "Full Time"
function toApiValue(val: string): string {
  return val.replace(/-/g, "_");
}

// Map mobile filter params to the API's expected param names
function mapFilters(filters: JobFilters): Record<string, any> {
  const params: Record<string, any> = {};
  if (filters.q) params.keywords = filters.q;
  if (filters.location) params.location = filters.location;
  if (filters.job_types?.length) params.job_type = filters.job_types.map(toApiValue);
  if (filters.work_arrangements?.length) params.work_arrangement = filters.work_arrangements.map(toApiValue);
  if (filters.salary_min) params.salary_min = filters.salary_min;
  if (filters.salary_max) params.salary_max = filters.salary_max;
  if (filters.experience_level) params.experience_level = [filters.experience_level.toLowerCase()];
  if (filters.skills?.length) params.skills = filters.skills;
  if (filters.date_posted && filters.date_posted !== "all") {
    const daysMap: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30 };
    params.date_posted = daysMap[filters.date_posted] ?? 365;
  }
  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;
  return params;
}

export const jobsApi = {
  // Public endpoints (no auth required)
  search: (filters: JobFilters) =>
    publicApiClient
      .get("/jobs/search", { params: mapFilters(filters) })
      .then(transformPaginatedJobs),

  getFeatured: () =>
    publicApiClient.get("/jobs/featured").then((r) => ({
      ...r,
      data: { success: true, data: (r.data?.data ?? []).map(transformJob) },
    })),

  getById: (id: number) =>
    publicApiClient.get(`/jobs/${id}`).then((r) => ({
      ...r,
      data: { success: true, data: transformJob(r.data?.data ?? r.data) },
    })),

  getFilterOptions: () =>
    publicApiClient.get<ApiResponse>("/jobs/filter-options"),

  // Authenticated endpoints
  searchAuth: (filters: JobFilters) =>
    apiClient
      .get("/jobs/search", { params: mapFilters(filters) })
      .then(transformPaginatedJobs),

  getSaved: () =>
    apiClient.get("/jobs/saved").then((r) => ({
      ...r,
      data: { success: true, data: (r.data?.data ?? []).map(transformJob) },
    })),

  save: (jobId: number) =>
    apiClient.post<ApiResponse>(`/jobs/${jobId}/save`),

  unsave: (jobId: number) =>
    apiClient.delete<ApiResponse>(`/jobs/${jobId}/unsave`),
};
