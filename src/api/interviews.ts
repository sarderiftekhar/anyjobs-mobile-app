import apiClient from "./client";
import type {
  Interview,
  InterviewStats,
  SchedulePayload,
  ReschedulePayload,
  CancelPayload,
} from "../types/interview";
import type { ApiResponse, PaginatedResponse } from "../types/api";

// Mobile endpoint base — registered in Laravel routes/api.php under the
// /v1/mobile/employer/interviews prefix (Sanctum + employer middleware).
const BASE = "/employer/interviews";

export interface SchedulableApplication {
  id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string | null;
  job_id: number;
  job_title: string;
  status: string;
}

export const interviewsApi = {
  list: (params?: { status?: string; date_from?: string; date_to?: string; page?: number }) =>
    apiClient.get<ApiResponse<Interview[]> & PaginatedResponse<Interview>>(BASE, { params }),

  get: (id: number) =>
    apiClient.get<ApiResponse<Interview>>(`${BASE}/${id}`),

  upcoming: () =>
    apiClient.get<ApiResponse<Interview[]>>(`${BASE}/upcoming`),

  today: () =>
    apiClient.get<ApiResponse<Interview[]>>(`${BASE}/today`),

  stats: () =>
    apiClient.get<ApiResponse<InterviewStats>>(`${BASE}/statistics`),

  schedulableApplications: () =>
    apiClient.get<ApiResponse<SchedulableApplication[]>>(`${BASE}/schedulable-applications`),

  schedule: (payload: SchedulePayload) =>
    apiClient.post<ApiResponse<Interview>>(BASE, payload),

  reschedule: (id: number, payload: ReschedulePayload) =>
    apiClient.post<ApiResponse<Interview>>(`${BASE}/${id}/reschedule`, payload),

  cancel: (id: number, payload: CancelPayload) =>
    apiClient.post<ApiResponse>(`${BASE}/${id}/cancel`, payload),

  complete: (id: number) =>
    apiClient.post<ApiResponse<Interview>>(`${BASE}/${id}/complete`),

  start: (id: number) =>
    apiClient.post<ApiResponse<Interview>>(`${BASE}/${id}/start`),
};
