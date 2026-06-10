import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "../types/api";
import type { ActivityItem } from "../types/profileExtras";

export const activitiesApi = {
  list: (params?: { type?: string; important_only?: boolean; page?: number }) =>
    apiClient
      .get<PaginatedResponse<ActivityItem>>("/candidate/activities", { params })
      .then((r) => r.data),

  recent: () =>
    apiClient
      .get<ApiResponse<ActivityItem[]>>("/candidate/activities/recent")
      .then((r) => r.data.data ?? []),
};
