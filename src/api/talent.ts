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

  // Start / open a chat with a candidate — re-uses the mobile messages API.
  startConversation: (candidateId: number, text: string) =>
    apiClient.post<ApiResponse<{ conversation_id: number }>>(
      "/messages/conversations",
      { recipient_id: candidateId, text }
    ),
};
