import apiClient from "./client";
import type { Application } from "../types/application";
import type { ApiResponse, PaginatedResponse } from "../types/api";

export interface ApplyPayload {
  job_id: number;
  cv_id?: number;
  cover_letter?: string;
  answers?: Record<string, string>;
}

export const applicationsApi = {
  list: (params?: { status?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<Application>>("/applications", { params }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Application>>(`/applications/${id}`),

  apply: (data: ApplyPayload) =>
    apiClient.post<ApiResponse<Application>>("/applications", data),

  withdraw: (id: number) =>
    apiClient.delete<ApiResponse>(`/applications/${id}`),
};
