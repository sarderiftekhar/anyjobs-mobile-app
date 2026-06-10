import apiClient from "./client";
import type { Application } from "../types/application";
import type { ApiResponse, PaginatedResponse } from "../types/api";

export interface ApplyPayload {
  job_id: number;
  cv_id?: number;
  cover_letter?: string;
  answers?: Record<string, string>;
}

export interface ApplicationConversation {
  conversation_id: number;
  job_title: string | null;
  messages: {
    id: number;
    conversation_id: number;
    sender_id: number;
    text: string;
    type: string;
    read: boolean;
    sent_at: string;
  }[];
}

export const applicationsApi = {
  list: (params?: { status?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<Application>>("/applications", { params }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Application>>(`/applications/${id}`),

  apply: (data: ApplyPayload) =>
    apiClient.post<ApiResponse<Application>>("/applications", data),

  /**
   * Apply with file uploads (a fresh CV and/or supporting documents). Sends
   * multipart/form-data — `cv` is a picked document, `documents` an array.
   */
  applyWithFiles: (form: FormData) =>
    apiClient.post<ApiResponse<Application>>("/applications", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000,
    }),

  withdraw: (id: number) =>
    apiClient.delete<ApiResponse>(`/applications/${id}`),

  /** Get (or open) the message thread tied to an application. */
  conversation: (id: number) =>
    apiClient
      .get<ApiResponse<ApplicationConversation>>(`/applications/${id}/conversation`)
      .then((r) => r.data.data!),
};
