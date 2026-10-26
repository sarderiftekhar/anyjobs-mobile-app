export type JobType = "full-time" | "part-time" | "contract" | "internship" | "temporary";
export type WorkArrangement = "remote" | "hybrid" | "on-site";
export type JobStatus = "active" | "draft" | "paused" | "closed" | "expired";

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: "yearly" | "monthly" | "hourly";
}

export interface Company {
  id: number;
  name: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  website?: string;
}

export interface Job {
  id: number;
  title: string;
  company: Company;
  location: string;
  country?: string;
  state?: string;
  city?: string;
  job_type: JobType[];
  work_arrangement: WorkArrangement;
  salary?: SalaryRange;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills: string[];
  experience_level?: string;
  status: JobStatus;
  is_featured: boolean;
  is_urgent: boolean;
  application_deadline?: string;
  posted_at: string;
  is_saved?: boolean;
  has_applied?: boolean;
  /** Only on job detail; answered on apply, keyed by `id`. */
  screening_questions?: ScreeningQuestion[];
  /** How the employer takes applications (job detail only). */
  apply_route?: ApplyRoute;
}

export type ScreeningQuestionType =
  | "short_text"
  | "long_text"
  | "yes_no"
  | "single_choice"
  | "multi_choice"
  | "number";

export interface ScreeningQuestion {
  id: string;
  label: string;
  type: ScreeningQuestionType;
  required: boolean;
  options: string[];
}

export type ScreeningAnswer = string | string[];

/**
 * Mirrors the web job page's ApplyAction: in-app form, the employer's inbox,
 * the company's site, or written instructions (image-only Hot Hiring posts).
 */
export type ApplyRoute =
  | { kind: "in_app" }
  | { kind: "email"; email: string }
  | { kind: "external"; url: string }
  | { kind: "instructions"; instructions: string | null };

export interface JobFilters {
  q?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  location_radius?: number;
  job_types?: JobType[];
  work_arrangements?: WorkArrangement[];
  salary_min?: number;
  salary_max?: number;
  experience_level?: string;
  industry?: string;
  skills?: string[];
  date_posted?: "24h" | "7d" | "30d" | "all";
  sort_by?: "relevance" | "date" | "salary_high" | "salary_low";
  page?: number;
  per_page?: number;
}
