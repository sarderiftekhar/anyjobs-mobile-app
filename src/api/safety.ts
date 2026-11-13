import apiClient from "./client";
import type { ApiResponse } from "../types/api";

/**
 * Reporting and blocking (Google Play's user-generated-content and
 * AI-generated-content policies). Backend: Mobile reports/blocks endpoints.
 */

export type ReportReason = "spam" | "inappropriate" | "fake" | "harassment" | "other";
export type AiReportReason = "inappropriate" | "offensive" | "inaccurate" | "other";

export interface BlockedUser {
  id: number;
  name: string;
  avatar_url: string | null;
  blocked_at: string;
}

export const safetyApi = {
  reportUser: (userId: number, reason: ReportReason, details?: string) =>
    apiClient.post<ApiResponse>(`/reports/users/${userId}`, { reason, details }),

  reportMessage: (messageId: number, reason: ReportReason, details?: string) =>
    apiClient.post<ApiResponse>(`/reports/messages/${messageId}`, { reason, details }),

  /** `feature` names where the text came from, e.g. "cover_letter". */
  reportAiContent: (feature: string, content: string, reason: AiReportReason, details?: string) =>
    apiClient.post<ApiResponse>("/ai/report", {
      feature,
      content: content.slice(0, 10000),
      reason,
      details,
    }),

  blockedUsers: () =>
    apiClient.get<ApiResponse<BlockedUser[]>>("/blocks").then((r) => r.data.data ?? []),

  block: (userId: number) => apiClient.post<ApiResponse>(`/blocks/${userId}`),

  unblock: (userId: number) => apiClient.delete<ApiResponse>(`/blocks/${userId}`),
};
