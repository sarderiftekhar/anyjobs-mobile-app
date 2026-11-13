// Candidate-extras API client: interviews and recommendations, both on
// /v1/mobile/candidate/*. (Job alerts have their own client in jobAlerts.ts.)

import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "../types/api";
import type { Interview, RecommendedJob } from "../types/candidate";

// ---- Normalisers ----

function normaliseInterview(raw: any): Interview {
  return {
    id: Number(raw.id),
    job_title: raw.job_title ?? raw.job?.title ?? "Interview",
    company_name:
      raw.company_name ?? raw.company?.name ?? raw.employer?.company_name ?? "",
    company_logo_url: raw.company_logo_url ?? raw.company?.logo_url,
    scheduled_at: raw.scheduled_at ?? raw.starts_at ?? raw.start_time,
    duration_minutes: raw.duration_minutes ?? raw.duration,
    type: (raw.type ?? raw.interview_type ?? "video") as Interview["type"],
    status: (raw.status ?? "scheduled") as Interview["status"],
    location: raw.location,
    meeting_url: raw.meeting_url ?? raw.meeting_link,
    notes: raw.notes,
    application_id: raw.application_id ?? raw.application?.id,
    timezone: raw.timezone,
    slots: Array.isArray(raw.slots) ? raw.slots : [],
  };
}

// ---- API surface ----

export const candidateExtrasApi = {
  // =============== Interviews ===============
  // Backed by /v1/mobile/candidate/interviews/*
  interviews: {
    list: async (): Promise<{ awaiting: Interview[]; upcoming: Interview[]; past: Interview[] }> => {
      const res = await apiClient.get<any>("/candidate/interviews");
      const body = res.data ?? {};
      return {
        // Invitations to pick a time (older APIs don't send this list).
        awaiting: (Array.isArray(body.awaiting) ? body.awaiting : []).map(normaliseInterview),
        upcoming: (Array.isArray(body.upcoming) ? body.upcoming : []).map(normaliseInterview),
        past: (Array.isArray(body.past) ? body.past : []).map(normaliseInterview),
      };
    },
    confirm: (id: number) =>
      apiClient
        .post<ApiResponse>(`/candidate/interviews/${id}/confirm`)
        .then((r) => r.data),
    cancel: (id: number, reason?: string) =>
      apiClient
        .post<ApiResponse>(`/candidate/interviews/${id}/cancel`, { reason })
        .then((r) => r.data),
    reschedule: (id: number, scheduledAt: string, reason?: string) =>
      apiClient
        .post<ApiResponse>(`/candidate/interviews/${id}/reschedule`, {
          scheduled_at: scheduledAt,
          reason,
        })
        .then((r) => r.data),
    /** Book one of the offered times; 409 if it was taken meanwhile. */
    chooseSlot: (id: number, slotId: number) =>
      apiClient
        .post<ApiResponse>(`/candidate/interviews/${id}/slots/${slotId}/choose`)
        .then((r) => r.data),
  },

  // =============== Recommendations ===============
  // Backed by /v1/mobile/candidate/recommendations
  recommendations: async (): Promise<RecommendedJob[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>("/candidate/recommendations");
    const list = res.data?.data ?? [];
    return list.map((raw: any) => ({
      id: Number(raw.id),
      title: raw.title,
      company_name: raw.company_name ?? raw.company?.name ?? "",
      company_logo_url: raw.company_logo_url ?? raw.company?.logo_url,
      location: raw.location,
      salary_label: raw.salary_label ?? raw.salary_range,
      match_score: raw.match_score ?? raw.match_percentage,
      match_reasons: raw.match_reasons ?? [],
      posted_at: raw.posted_at ?? raw.created_at,
    }));
  },
};

export type { PaginatedResponse, ApiResponse };
