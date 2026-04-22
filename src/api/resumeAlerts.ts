import apiClient from "./client";
import type { ResumeAlert, ResumeAlertPayload } from "../types/resumeAlert";
import type { TalentListItem } from "../types/talent";
import type { ApiResponse } from "../types/api";

// Mobile endpoints — /v1/mobile/employer/resume-alerts/*
// Registered in Laravel routes/api.php (Sanctum + employer middleware).

export const resumeAlertsApi = {
  list: () =>
    apiClient
      .get<ApiResponse<ResumeAlert[]>>("/employer/resume-alerts")
      .then((r) => r.data.data ?? []),

  create: (payload: ResumeAlertPayload) =>
    apiClient.post<ApiResponse<ResumeAlert>>("/employer/resume-alerts", payload),

  update: (id: number, payload: ResumeAlertPayload) =>
    apiClient.put<ApiResponse<ResumeAlert>>(`/employer/resume-alerts/${id}`, payload),

  remove: (id: number) =>
    apiClient.delete<ApiResponse>(`/employer/resume-alerts/${id}`),

  toggle: (id: number, _current: ResumeAlert) =>
    apiClient.post<ApiResponse<ResumeAlert>>(`/employer/resume-alerts/${id}/toggle`),

  getMatches: (alertId: number): Promise<TalentListItem[]> =>
    apiClient
      .get<ApiResponse<TalentListItem[]>>(`/employer/resume-alerts/${alertId}/matches`)
      .then((r) => r.data.data ?? []),
};
