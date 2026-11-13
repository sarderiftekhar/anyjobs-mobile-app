import apiClient from "./client";
import type {
  TalentProfile,
  TalentSearchFilters,
  TalentSearchResponse,
} from "../types/talent";
import type { ApiResponse } from "../types/api";

// Mobile talent endpoints — registered in Laravel under
// /v1/mobile/employer/talent/* (Sanctum + employer middleware).

export const talentApi = {
  search: (filters: TalentSearchFilters) =>
    apiClient
      .post<TalentSearchResponse>("/employer/talent/search", {
        keywords: filters.keywords,
        skills: filters.skills,
        experience_levels: filters.experience_levels,
        industries: filters.industries,
        location: filters.location,
        salary_min: filters.salary_min,
        salary_max: filters.salary_max,
        available: filters.available,
        per_page: filters.per_page ?? 20,
        page: filters.page ?? 1,
      })
      .then((r) => r.data),

  getById: (candidateId: number) =>
    apiClient
      .get<{ success: boolean; candidate: TalentProfile }>(
        `/employer/talent/${candidateId}`
      )
      .then((r) => r.data),

  // Open (or reuse) a conversation with the candidate, optionally sending a
  // first message. Same rules as the website's Browse Talent "Message"
  // (applicants always; others need the Professional plan and the candidate's
  // consent). Errors: 403 upgrade_required / blocked, 422 not accepting.
  startConversation: (candidateId: number, text?: string) =>
    apiClient.post<ApiResponse<{ conversation_id: number }>>(
      `/employer/talent/${candidateId}/message`,
      text ? { text } : {}
    ),
};
