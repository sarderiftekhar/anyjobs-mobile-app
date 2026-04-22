import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { ApplicantNote } from "../types/analytics";

/**
 * Applicant workflow API (shortlist, reject, rate, notes).
 *
 * NOTE ON BACKEND:
 * - The mobile route `PATCH /v1/mobile/employer/applicants/{id}/status` exists
 *   (EmployerController@updateApplicantStatus) and is used for shortlist/reject
 *   by sending `status: "shortlisted"` | `"rejected"` | `"applied"`.
 * - Rate and note endpoints DO NOT exist on /v1/mobile yet. Confirmed web routes
 *   (see routes/employer.php):
 *     PATCH /employer/applications/{application}/rate   (ApplicationController@rate)
 *     POST  /employer/applications-center/{application}/shortlist
 *     DELETE /employer/applications-center/{application}/unshortlist
 *   No web "add note" endpoint exists yet — it needs backend implementation.
 * - Mobile endpoints below are the ones this client expects; a backend wrapper
 *   should forward to the existing web controllers.
 */
export const applicantWorkflowApi = {
  // Shortlist via status update (works with existing mobile route).
  shortlist: (id: number) =>
    apiClient.patch<ApiResponse>(`/employer/applicants/${id}/status`, { status: "shortlisted" }),

  unshortlist: (id: number) =>
    apiClient.patch<ApiResponse>(`/employer/applicants/${id}/status`, { status: "applied" }),

  reject: (id: number, reason?: string) =>
    apiClient.patch<ApiResponse>(`/employer/applicants/${id}/status`, {
      status: "rejected",
      note: reason,
    }),

  // Rating — expects PATCH /v1/mobile/employer/applicants/{id}/rate on backend.
  rate: (id: number, rating: number) =>
    apiClient.patch<ApiResponse<{ rating: number }>>(`/employer/applicants/${id}/rate`, { rating }),

  // Notes — expects GET/POST /v1/mobile/employer/applicants/{id}/notes on backend.
  listNotes: (id: number) =>
    apiClient.get<ApiResponse<ApplicantNote[]>>(`/employer/applicants/${id}/notes`),

  addNote: (id: number, body: string) =>
    apiClient.post<ApiResponse<ApplicantNote>>(`/employer/applicants/${id}/notes`, { body }),
};
