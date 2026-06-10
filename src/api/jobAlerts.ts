import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { JobAlert, JobAlertPayload } from "../types/profileExtras";

const BASE = "/candidate/job-alerts";

export const jobAlertsApi = {
  list: () => apiClient.get<ApiResponse<JobAlert[]>>(BASE).then((r) => r.data.data ?? []),

  create: (payload: JobAlertPayload) =>
    apiClient.post<ApiResponse<JobAlert>>(BASE, payload).then((r) => r.data.data!),

  update: (id: number, payload: Partial<JobAlertPayload>) =>
    apiClient.put<ApiResponse<JobAlert>>(`${BASE}/${id}`, payload).then((r) => r.data.data!),

  remove: (id: number) => apiClient.delete<ApiResponse>(`${BASE}/${id}`).then((r) => r.data),

  toggle: (id: number) =>
    apiClient.post<ApiResponse<JobAlert>>(`${BASE}/${id}/toggle`).then((r) => r.data.data!),
};
