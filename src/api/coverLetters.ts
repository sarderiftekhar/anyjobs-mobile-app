import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { CoverLetter } from "../types/user";

const BASE = "/candidate/cover-letters";

export interface CoverLetterPayload {
  name: string;
  content: string;
  is_default?: boolean;
}

export const coverLettersApi = {
  list: () => apiClient.get<ApiResponse<CoverLetter[]>>(BASE).then((r) => r.data.data ?? []),

  create: (payload: CoverLetterPayload) =>
    apiClient.post<ApiResponse<CoverLetter>>(BASE, payload).then((r) => r.data.data!),

  update: (id: string, payload: Partial<CoverLetterPayload>) =>
    apiClient.put<ApiResponse<CoverLetter>>(`${BASE}/${id}`, payload).then((r) => r.data.data!),

  remove: (id: string) => apiClient.delete<ApiResponse>(`${BASE}/${id}`).then((r) => r.data),

  setDefault: (id: string) =>
    apiClient.post<ApiResponse<CoverLetter>>(`${BASE}/${id}/set-default`).then((r) => r.data.data!),

  generate: (jobId: number, tone?: string) =>
    apiClient
      .post<ApiResponse<{ content: string }>>(`${BASE}/generate`, { job_id: jobId, tone })
      .then((r) => r.data.data?.content ?? ""),
};
