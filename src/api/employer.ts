import apiClient from "./client";
import type { Job, JobStatus } from "../types/job";
import type { ApiResponse, PaginatedResponse } from "../types/api";

// ---- Types ----

export interface DashboardMetrics {
  active_jobs: number;
  total_applicants: number;
  new_today: number;
  interviews_this_week: number;
  recent_applications: RecentApplicant[];
  upcoming_interviews: UpcomingInterview[];
}

export interface RecentApplicant {
  id: number;
  candidate_name: string;
  candidate_avatar?: string;
  job_title: string;
  match_score: number;
  applied_at: string;
}

export interface UpcomingInterview {
  id: number;
  candidate_name: string;
  job_title: string;
  scheduled_at: string;
  type: "video" | "phone" | "in-person";
}

export interface EmployerJob extends Job {
  views_count: number;
  applications_count: number;
  shortlisted_count: number;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  job_type: string[];
  work_arrangement: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  experience_level?: string;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  application_deadline?: string;
  is_featured?: boolean;
  is_urgent?: boolean;
  status?: "draft" | "active";
}

export interface Applicant {
  id: number;
  application_id: number;
  candidate: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    title?: string;
    location?: string;
    skills: string[];
    experience_years?: number;
  };
  job_id: number;
  job_title: string;
  status: string;
  match_score: number;
  applied_at: string;
  cover_letter?: string;
  cv_url?: string;
}

export interface CompanyProfile {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  location?: string;
  founded_year?: number;
  benefits?: string[];
  values?: string[];
}

// ---- API ----

export const employerApi = {
  // Dashboard
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardMetrics>>("/employer/dashboard"),

  // Jobs
  getJobs: (params?: { status?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<EmployerJob>>("/employer/jobs", { params }),

  getJobById: (id: number) =>
    apiClient.get<ApiResponse<EmployerJob>>(`/employer/jobs/${id}`),

  createJob: (data: CreateJobPayload) =>
    apiClient.post<ApiResponse<Job>>("/employer/jobs", data),

  updateJob: (id: number, data: Partial<CreateJobPayload>) =>
    apiClient.put<ApiResponse<Job>>(`/employer/jobs/${id}`, data),

  updateJobStatus: (id: number, status: JobStatus) =>
    apiClient.patch<ApiResponse>(`/employer/jobs/${id}/status`, { status }),

  deleteJob: (id: number) =>
    apiClient.delete<ApiResponse>(`/employer/jobs/${id}`),

  // Applicants
  getApplicants: (params?: { job_id?: number; status?: string; sort?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<Applicant>>("/employer/applicants", { params }),

  getApplicantById: (id: number) =>
    apiClient.get<ApiResponse<Applicant>>(`/employer/applicants/${id}`),

  updateApplicantStatus: (id: number, status: string, note?: string) =>
    apiClient.patch<ApiResponse>(`/employer/applicants/${id}/status`, { status, note }),

  rateApplicant: (id: number, rating: number) =>
    apiClient.patch<ApiResponse>(`/employer/applicants/${id}/rate`, { rating }),

  // Company profile
  getCompanyProfile: () =>
    apiClient.get<ApiResponse<CompanyProfile>>("/employer/company"),

  updateCompanyProfile: (data: Partial<CompanyProfile>) =>
    apiClient.put<ApiResponse<CompanyProfile>>("/employer/company", data),

  updateCompanyLogo: (formData: FormData) =>
    apiClient.post<ApiResponse<{ logo_url: string }>>("/employer/company/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
