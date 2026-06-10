// Types for the candidate "long tail" features: job alerts, activities,
// career tools, cover letters, insights, analysis, onboarding.

export type AlertFrequency = "instant" | "daily" | "weekly";

export interface JobAlert {
  id: number;
  name: string;
  keywords?: string | null;
  location?: string | null;
  categories: string[];
  job_types: string[];
  work_arrangements: string[];
  experience_level: string[];
  salary_min?: number | null;
  salary_max?: number | null;
  frequency: AlertFrequency;
  is_active: boolean;
  jobs_found_count: number;
  last_run_at?: string | null;
  created_at?: string | null;
}

export interface JobAlertPayload {
  name: string;
  keywords?: string;
  location?: string;
  categories?: string[];
  job_types?: string[];
  work_arrangements?: string[];
  experience_level?: string[];
  salary_min?: number | null;
  salary_max?: number | null;
  frequency: AlertFrequency;
  is_active?: boolean;
}

export interface ActivityItem {
  id: number;
  type: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_important: boolean;
  metadata?: Record<string, any>;
  date?: string | null;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  duration: string;
  level: string;
  url?: string | null;
}

export interface CareerPath {
  current_title?: string | null;
  years_experience: number;
  stage: string;
  suggested_next_roles: string[];
  recommended_skills: string[];
  tips: string[];
}

export interface InterviewPrep {
  common_questions: string[];
  checklist: { label: string; done: boolean }[];
  tips: string[];
}

export interface ProfileAnalysis {
  id: number;
  expertise_level?: string;
  expertise_level_display?: string;
  primary_specialization?: string;
  career_stage?: string;
  career_stage_display?: string;
  career_trajectory_display?: string;
  years_of_experience_calculated?: number;
  suitable_roles?: any[];
  suitable_industries?: any[];
  recommended_skills?: string[];
  career_growth_suggestions?: string[];
  profile_strengths?: string[];
  improvement_areas?: string[];
  confidence_score?: number;
  confidence_level?: string;
  is_confirmed?: boolean;
  needs_regeneration?: boolean;
  generated_at?: string | null;
}

export interface OnboardingStatus {
  completed: boolean;
  needs_onboarding: boolean;
  profile_completeness: number;
  prefill: {
    first_name?: string | null;
    last_name?: string | null;
    professional_title?: string | null;
    industry?: string | null;
    country?: string | null;
    city?: string | null;
  };
}

export interface OnboardingPayload {
  professional_title: string;
  professional_summary?: string;
  years_experience?: number;
  industry?: string;
  employment_status?: string;
  current_company?: string;
  current_position?: string;
  phone?: string;
  country?: string;
  state_province?: string;
  city?: string;
  skills?: string[];
  languages?: string[];
  preferred_job_types?: string[];
  preferred_work_arrangements?: string[];
  expected_salary_min?: number;
  expected_salary_max?: number;
  expected_salary_currency?: string;
  willing_to_relocate?: boolean;
  open_to_work?: boolean;
  career_goals?: string[];
  allow_recruiter_contact?: boolean;
  profile_public?: boolean;
}
