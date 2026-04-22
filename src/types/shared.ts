// Shared / public-feature types (categories, faqs, visitor chat, locations, nearby jobs).

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  jobs_count?: number;
  parent_id?: number | null;
  children?: Category[];
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  active?: boolean;
  display_order?: number;
  category?: string | null;
}

export interface LocationSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface PlaceDetails {
  place_id: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  [key: string]: any;
}

// Trending/featured jobs share the same public-job shape from types/job.ts.
// Kept here for discoverability — re-export the Job type as TrendingJob.
export type { Job as TrendingJob, Job as FeaturedJob } from "./job";

export interface NearbyJob {
  id: number;
  title: string;
  company_name?: string;
  slug?: string;
  city?: string;
  state_province?: string;
  country?: string;
  location_display?: string;
  job_type?: string;
  work_arrangement?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  published_at?: string;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
}

export interface VisitorMessage {
  id: number;
  visitor_name: string;
  visitor_email: string;
  message: string;
  attachments?: any;
  created_at?: string;
  updated_at?: string;
  // Admin replies may come back on the same record/thread — varies by backend
  replies?: Array<{
    id: number;
    body?: string;
    message?: string;
    sender?: string;
    created_at?: string;
  }>;
}
