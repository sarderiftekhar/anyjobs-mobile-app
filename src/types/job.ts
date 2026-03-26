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
}

export interface JobFilters {
  q?: string;
  location?: string;
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
