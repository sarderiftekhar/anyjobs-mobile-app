/**
 * AI feature types — mobile client contracts for AI endpoints.
 *
 * Backend status (see `routes/api.php` and `routes/candidate.php`):
 *  - CONFIRMED (shipped under mobile prefix): POST /v1/mobile/ai/generate-cover-letter
 *  - PARTIAL (exists under /v1/, NOT /v1/mobile, via AutoSuggestionController):
 *      POST /v1/suggestions/job-description/generate
 *      POST /v1/suggestions/job-templates/generate
 *  - STUB (placeholder handlers that only echo fake data — not real AI yet):
 *      POST /v1/ai/resume-parsing
 *      POST /v1/ai/job-matching
 *  - FALLBACK (expected but not yet implemented on backend):
 *      POST /v1/mobile/ai/generate-job-description
 *      GET  /v1/mobile/ai/job-templates
 *      POST /v1/mobile/ai/job-templates/generate
 *      POST /v1/mobile/ai/parse-job-image
 *      POST /v1/mobile/ai/match-job
 *      POST /v1/mobile/ai/parse-resume
 *
 * The client (`src/api/ai.ts`) targets the mobile-prefixed endpoints because
 * that is the one apiClient is configured for; backend team should expose
 * these as thin wrappers over the existing controllers.
 */

export interface GenerateJobDescriptionPayload {
  prompt: string;
  title?: string;
  location?: string;
  work_arrangement?: string;
}

export interface GenerateJobDescriptionResult {
  title: string;
  description: string;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
}

export interface JobTemplate {
  id: number | string;
  title: string;
  description: string;
  category?: string;
  is_ai_generated?: boolean;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  experience_level?: string;
  work_arrangement?: string;
  job_type?: string[];
}

export interface ParseJobImageResult {
  title?: string;
  description?: string;
  location?: string;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  confidence?: number;
}

export interface MatchJobResult {
  score: number;
  reasoning: string;
  strengths?: string[];
  gaps?: string[];
  missing_skills?: string[];
}

export interface ParseResumeResult {
  title?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experiences?: Array<{
    title: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
  }>;
  educations?: Array<{
    school: string;
    degree?: string;
    field?: string;
    start_date?: string;
    end_date?: string;
  }>;
}
