import apiClient from "./client";
import type { ApiResponse } from "../types/api";

/**
 * Employer notes on a candidate (the website's candidate notebook,
 * Professional plan and up). Without the plan the backend answers
 * 403 upgrade_required, which the app shows as "Not included in your plan".
 */

export interface CandidateNote {
  id: number;
  body: string;
  author: { id: number; name: string };
  created_at: string;
  can_delete: boolean;
  /**
   * "candidate" notes are the notebook's; "application" notes come from an
   * application's notes (read-only here). The two kinds have separate id
   * sequences, so key lists on kind + id.
   */
  kind: "candidate" | "application";
}

export const candidateNotesApi = {
  list: (candidateId: number) =>
    apiClient
      .get<ApiResponse<{ notes: CandidateNote[] }>>(`/employer/candidates/${candidateId}/notes`)
      .then((r) => r.data.data?.notes ?? []),

  add: (candidateId: number, body: string) =>
    apiClient
      .post<ApiResponse<CandidateNote>>(`/employer/candidates/${candidateId}/notes`, { body })
      .then((r) => r.data.data!),

  remove: (noteId: number) => apiClient.delete<ApiResponse>(`/employer/candidate-notes/${noteId}`),
};
