import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type {
  GenerateJobDescriptionPayload,
  GenerateJobDescriptionResult,
  JobTemplate,
  MatchJobResult,
} from "../types/ai";

/**
 * AI API client.
 *
 * Endpoints are mounted under /v1/mobile/ai/* so apiClient (baseURL=/v1/mobile)
 * can call them with relative paths. Some are not yet implemented on the
 * backend — see src/types/ai.ts for confirmed vs fallback status.
 *
 * Callers should handle failures gracefully (these features are enhancements,
 * not core flows).
 */
export const aiApi = {
  // 1. Generate a full job posting from a short free-text prompt.
  //    Backend: POST /v1/mobile/ai/generate-job-description  (FALLBACK — wraps AutoSuggestionController::generateJobDescription)
  generateJobDescription: (payload: GenerateJobDescriptionPayload) =>
    apiClient.post<ApiResponse<GenerateJobDescriptionResult>>(
      "/ai/generate-job-description",
      payload,
    ),

  // 2. List pre-built + AI-generated job templates.
  //    Backend: GET /v1/mobile/ai/job-templates  (FALLBACK)
  listTemplates: (params?: { category?: string }) =>
    apiClient.get<ApiResponse<JobTemplate[]>>("/ai/job-templates", { params }),

  // 2b. Generate a new template on the fly (persisted server-side optionally).
  //     Backend: POST /v1/mobile/ai/job-templates/generate  (FALLBACK — wraps AutoSuggestionController::generateJobTemplates)
  generateTemplate: (payload: { prompt: string; category?: string }) =>
    apiClient.post<ApiResponse<JobTemplate>>(
      "/ai/job-templates/generate",
      payload,
    ),

  // 3. Score a candidate <-> job match using the logged-in candidate's profile/CV.
  //    Backend: POST /v1/mobile/ai/match-job  (STUB backend handler exists at /v1/ai/job-matching)
  matchJob: (jobId: number) =>
    apiClient.post<ApiResponse<MatchJobResult>>("/ai/match-job", {
      job_id: jobId,
    }),
};
