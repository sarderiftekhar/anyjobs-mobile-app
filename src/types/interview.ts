// Interview types — mirrors backend \App\Models\Interview
// Status values are the lowercase form used in Interview::STATUS_* constants.

export type InterviewStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type InterviewType = "video" | "phone" | "in-person";

export interface InterviewJob {
  id: number;
  title: string;
  company?: {
    id: number;
    name: string;
    logo_url?: string | null;
  };
}

export interface InterviewCandidate {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string | null;
}

export interface Interview {
  id: number;
  job_id: number;
  candidate_id: number;
  job_application_id: number;
  interviewer_id?: number | null;
  title: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduled_at: string; // ISO datetime
  duration_minutes: number;
  meeting_link?: string | null;
  location?: string | null;
  description?: string | null;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  job?: InterviewJob;
  candidate?: InterviewCandidate;
}

export interface InterviewStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  this_month?: number;
  last_month?: number;
}

export interface SchedulePayload {
  job_application_id: number;
  title: string;
  type: InterviewType;
  scheduled_at: string; // ISO datetime string
  duration: number;     // minutes (15-480)
  meeting_link?: string;
  location?: string;
  description?: string;
  interviewer_id?: number;
}

export interface ReschedulePayload {
  scheduled_at: string;
  notes?: string;
}

export interface CancelPayload {
  reason: string;
}

export type InterviewFilter = "upcoming" | "today" | "past" | "cancelled" | "all";
