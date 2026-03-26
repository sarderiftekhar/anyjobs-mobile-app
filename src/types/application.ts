import type { Job } from "./job";

export type ApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "interviewed"
  | "offered"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: number;
  job_id: number;
  job: Job;
  status: ApplicationStatus;
  match_score?: number;
  cover_letter?: string;
  applied_at: string;
  updated_at: string;
  status_history: StatusChange[];
}

export interface StatusChange {
  status: ApplicationStatus;
  changed_at: string;
  note?: string;
}
