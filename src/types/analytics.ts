// Analytics types for employer dashboards.
// Backend endpoints for these are not yet live on /v1/mobile — see src/api/analytics.ts
// for the exact URLs the client expects. Confirmed web fallback: GET /employer/jobs/{job}/analytics.

export interface DashboardAnalyticsOverview {
  total_views: number;
  total_applications: number;
  conversion_rate: number; // percentage 0-100
  active_jobs: number;
  views_change_pct?: number;
  applications_change_pct?: number;
}

export interface TimeSeriesPoint {
  date: string; // ISO date (YYYY-MM-DD)
  value: number;
}

export interface TopPerformingJob {
  id: number;
  title: string;
  views: number;
  applications: number;
  conversion_rate: number;
}

export interface DashboardAnalytics {
  overview: DashboardAnalyticsOverview;
  applications_over_time: TimeSeriesPoint[];
  views_over_time: TimeSeriesPoint[];
  top_jobs: TopPerformingJob[];
}

export interface ApplicantSource {
  source: string; // e.g. "direct", "search", "referral", "saved_jobs"
  count: number;
  percentage: number;
}

export interface FunnelStage {
  stage: "viewed" | "applied" | "shortlisted" | "interviewed" | "hired" | "rejected";
  count: number;
}

export interface JobAnalytics {
  job_id: number;
  job_title: string;
  status: string;
  posted_at: string;
  views: number;
  unique_views?: number;
  applications: number;
  shortlisted: number;
  rejected: number;
  conversion_rate: number;
  applications_over_time: TimeSeriesPoint[];
  views_over_time: TimeSeriesPoint[];
  sources: ApplicantSource[];
  funnel: FunnelStage[];
}

// Bulk job actions
export type BulkJobAction = "pause" | "resume" | "close" | "delete" | "feature" | "unfeature";

export interface BulkJobActionResult {
  success: boolean;
  affected: number;
  failed: number[];
}

// Applicant workflow
export type ApplicantStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "interviewed"
  | "hired"
  | "withdrawn";

export interface ApplicantNote {
  id: number;
  applicant_id: number;
  body: string;
  author_name: string;
  created_at: string;
}
