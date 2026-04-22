// Candidate-extras API client.
//
// Dedicated mobile endpoints don't yet exist for interviews, job alerts, support
// tickets, recommendations, custom questions, or email verification — so several
// of these calls fall through to the Laravel web/candidate routes using the
// absolute API host (via publicApiClient's baseURL) plus the Sanctum bearer
// token. The backend sees a JSON `Accept` header and returns JSON.
//
// If a first-class /v1/mobile endpoint is added later, swap the `apiClient`
// path and drop the absolute URL — the call-site shape stays the same.

import apiClient, { publicApiClient } from "./client";
import { config } from "../constants/config";
import { storage } from "../lib/storage";
import type { ApiResponse, PaginatedResponse } from "../types/api";
import type {
  Interview,
  RecommendedJob,
  JobAlert,
  JobAlertPayload,
  SupportTicket,
  SupportTicketDetail,
  CreateTicketPayload,
  CustomQuestion,
  EmailVerificationStatus,
} from "../types/candidate";

// Candidate web endpoints live under http(s)://host/candidate/... (not /api).
// Build an absolute URL against the same host as config.API_BASE_URL but
// without the `/api` suffix.
const WEB_BASE = config.API_BASE_URL.replace(/\/api\/?$/, "");

async function authedHeaders(): Promise<Record<string, string>> {
  const token = await storage.get(config.TOKEN_KEY);
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (config.API_HOST) headers.Host = config.API_HOST;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Thin helper for hitting candidate web routes with JSON + auth token. */
async function webGet<T = any>(path: string, params?: Record<string, any>): Promise<T> {
  const headers = await authedHeaders();
  const res = await publicApiClient.get<T>(`${WEB_BASE}${path}`, {
    headers,
    params,
  });
  return res.data;
}

async function webPost<T = any>(path: string, body?: any): Promise<T> {
  const headers = await authedHeaders();
  const res = await publicApiClient.post<T>(`${WEB_BASE}${path}`, body ?? {}, {
    headers,
  });
  return res.data;
}

async function webPut<T = any>(path: string, body?: any): Promise<T> {
  const headers = await authedHeaders();
  const res = await publicApiClient.put<T>(`${WEB_BASE}${path}`, body ?? {}, {
    headers,
  });
  return res.data;
}

async function webDelete<T = any>(path: string): Promise<T> {
  const headers = await authedHeaders();
  const res = await publicApiClient.delete<T>(`${WEB_BASE}${path}`, { headers });
  return res.data;
}

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
  };
}

function normaliseAlert(raw: any): JobAlert {
  return {
    id: Number(raw.id),
    name: raw.name ?? raw.title ?? "Alert",
    keywords: raw.keywords ?? raw.search_keywords,
    location: raw.location,
    job_type: raw.job_type,
    work_arrangement: raw.work_arrangement,
    salary_min: raw.salary_min,
    salary_max: raw.salary_max,
    frequency: (raw.frequency ?? "daily") as JobAlert["frequency"],
    is_active: raw.is_active ?? raw.active ?? true,
    last_sent_at: raw.last_sent_at,
    created_at: raw.created_at,
  };
}

function normaliseTicket(raw: any): SupportTicket {
  return {
    id: Number(raw.id),
    subject: raw.subject ?? raw.title ?? "(no subject)",
    category: raw.category,
    priority: (raw.priority ?? "medium") as SupportTicket["priority"],
    status: (raw.status ?? "open") as SupportTicket["status"],
    last_message_preview: raw.last_message_preview ?? raw.latest_message?.body,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    unread_count: raw.unread_count ?? 0,
  };
}

// ---- API surface ----

export const candidateExtrasApi = {
  // =============== Interviews ===============
  // Backed by /v1/mobile/candidate/interviews/*
  interviews: {
    list: async (): Promise<{ upcoming: Interview[]; past: Interview[] }> => {
      const res = await apiClient.get<any>("/candidate/interviews");
      const body = res.data ?? {};
      return {
        upcoming: (Array.isArray(body.upcoming) ? body.upcoming : []).map(normaliseInterview),
        past: (Array.isArray(body.past) ? body.past : []).map(normaliseInterview),
      };
    },
    upcoming: async (): Promise<Interview[]> => {
      const res = await apiClient.get<any>("/candidate/interviews");
      const arr = res.data?.upcoming ?? [];
      return (Array.isArray(arr) ? arr : []).map(normaliseInterview);
    },
    confirm: (id: number) =>
      apiClient
        .post<ApiResponse>(`/candidate/interviews/${id}/confirm`)
        .then((r) => r.data),
    cancel: (id: number, reason?: string) =>
      apiClient
        .post<ApiResponse>(`/candidate/interviews/${id}/cancel`, { reason })
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

  // =============== Saved-job alerts ===============
  alerts: {
    list: async (): Promise<JobAlert[]> => {
      const res = await webGet<any>("/candidate/job-alerts", { format: "json" });
      const list = res.data ?? res.alerts ?? res.job_alerts ?? res ?? [];
      return (Array.isArray(list) ? list : []).map(normaliseAlert);
    },
    get: async (id: number): Promise<JobAlert> => {
      const res = await webGet<any>(`/candidate/job-alerts/${id}`, { format: "json" });
      return normaliseAlert(res.data ?? res.alert ?? res);
    },
    create: async (payload: JobAlertPayload): Promise<JobAlert> => {
      const res = await webPost<any>("/candidate/job-alerts", payload);
      return normaliseAlert(res.data ?? res.alert ?? res);
    },
    update: async (id: number, payload: Partial<JobAlertPayload>): Promise<JobAlert> => {
      const res = await webPut<any>(`/candidate/job-alerts/${id}`, payload);
      return normaliseAlert(res.data ?? res.alert ?? res);
    },
    destroy: (id: number) => webDelete(`/candidate/job-alerts/${id}`),
    toggle: (id: number) => webPost(`/candidate/job-alerts/${id}/toggle`),
  },

  // =============== Support tickets ===============
  tickets: {
    list: async (): Promise<SupportTicket[]> => {
      const res = await webGet<any>("/candidate/support", { format: "json" });
      const list = res.data ?? res.tickets ?? res ?? [];
      return (Array.isArray(list) ? list : []).map(normaliseTicket);
    },
    get: async (id: number): Promise<SupportTicketDetail> => {
      const res = await webGet<any>(`/candidate/support/${id}`, { format: "json" });
      const raw = res.data ?? res.ticket ?? res;
      const base = normaliseTicket(raw);
      const messagesRaw = raw.messages ?? res.messages ?? [];
      return {
        ...base,
        description: raw.description ?? raw.body,
        messages: (Array.isArray(messagesRaw) ? messagesRaw : []).map((m: any) => ({
          id: Number(m.id),
          ticket_id: Number(m.ticket_id ?? id),
          sender_type: (m.sender_type ?? (m.is_agent ? "agent" : "candidate")) as
            | "candidate"
            | "agent"
            | "system",
          sender_name: m.sender_name ?? m.user?.name ?? "You",
          body: m.body ?? m.message ?? "",
          created_at: m.created_at,
        })),
      };
    },
    create: async (payload: CreateTicketPayload): Promise<SupportTicket> => {
      const res = await webPost<any>("/candidate/support", payload);
      return normaliseTicket(res.data ?? res.ticket ?? res);
    },
    reply: (id: number, body: string) =>
      webPost(`/candidate/support/${id}/message`, { body, message: body }),
    close: (id: number) => webPost(`/candidate/support/${id}/close`),
  },

  // =============== Custom application questions ===============
  customQuestions: {
    /**
     * Fetch custom questions for a job's application form.
     * Backend exposes these inside the job payload under `application_questions`.
     */
    forJob: async (jobId: number): Promise<CustomQuestion[]> => {
      try {
        const res = await publicApiClient.get(`/jobs/${jobId}`);
        const raw = res.data?.data ?? res.data ?? {};
        const questions =
          raw.application_questions ?? raw.custom_questions ?? raw.questions ?? [];
        if (!Array.isArray(questions)) return [];
        return questions.map((q: any, idx: number) => ({
          id: q.id ?? q.key ?? `q_${idx}`,
          label: q.label ?? q.question ?? q.text ?? `Question ${idx + 1}`,
          type: (q.type ?? "text") as CustomQuestion["type"],
          required: !!(q.required ?? q.is_required),
          help_text: q.help_text ?? q.description,
          options: Array.isArray(q.options) ? q.options : undefined,
        }));
      } catch {
        return [];
      }
    },
  },

  // =============== Email verification ===============
  emailVerification: {
    status: async (): Promise<EmailVerificationStatus> => {
      const res = await apiClient.get<ApiResponse<any>>("/auth/user");
      const user = res.data?.data ?? res.data ?? ({} as any);
      return {
        verified: !!(user.email_verified ?? user.email_verified_at),
        email: user.email,
      };
    },
    /** POST /v1/mobile/auth/verify-email/resend */
    resend: () =>
      apiClient.post<ApiResponse>("/auth/verify-email/resend").then((r) => r.data),
    /**
     * OTP-style verify. Backend may not expose a mobile-native OTP endpoint yet;
     * this calls a speculative /auth/verify-email endpoint. Callers should treat
     * any non-2xx as "still unverified" and fall back to the email link.
     */
    verify: async (code: string): Promise<ApiResponse> => {
      try {
        const res = await apiClient.post<ApiResponse>("/auth/verify-email", { code });
        return res.data;
      } catch (err: any) {
        return {
          success: false,
          message:
            err?.response?.data?.message ??
            "Couldn't verify code. Try the link in your email instead.",
        };
      }
    },
  },
};

export type { PaginatedResponse, ApiResponse };
