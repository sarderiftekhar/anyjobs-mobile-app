// Types for candidate-specific extras: interviews, alerts, tickets, recommendations, custom questions, email verification.
// These mostly mirror web-endpoint shapes — where the mobile API doesn't yet expose a dedicated resource,
// the client falls through to the closest Laravel web endpoint via absolute URL / publicApiClient.

export type InterviewType = "video" | "phone" | "in-person" | "technical" | "onsite";
export type InterviewStatus =
  | "scheduled"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Interview {
  id: number;
  job_title: string;
  company_name: string;
  company_logo_url?: string;
  scheduled_at: string;
  duration_minutes?: number;
  type: InterviewType;
  status: InterviewStatus;
  location?: string;
  meeting_url?: string;
  notes?: string;
  application_id?: number;
}

export interface RecommendedJob {
  id: number;
  title: string;
  company_name: string;
  company_logo_url?: string;
  location?: string;
  salary_label?: string;
  match_score?: number;
  match_reasons?: string[];
  posted_at?: string;
}

export interface JobAlert {
  id: number;
  name: string;
  keywords?: string;
  location?: string;
  job_type?: string;
  work_arrangement?: string;
  salary_min?: number;
  salary_max?: number;
  frequency: "daily" | "weekly" | "instant";
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
}

export interface JobAlertPayload {
  name: string;
  keywords?: string;
  location?: string;
  job_type?: string;
  work_arrangement?: string;
  salary_min?: number;
  salary_max?: number;
  frequency: "daily" | "weekly" | "instant";
}

export type SupportTicketStatus = "open" | "pending" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: number;
  subject: string;
  category?: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  last_message_preview?: string;
  created_at: string;
  updated_at?: string;
  unread_count?: number;
}

export interface SupportTicketMessage {
  id: number;
  ticket_id: number;
  sender_type: "candidate" | "agent" | "system";
  sender_name: string;
  body: string;
  created_at: string;
}

export interface SupportTicketDetail extends SupportTicket {
  description?: string;
  messages: SupportTicketMessage[];
}

export interface CreateTicketPayload {
  subject: string;
  category?: string;
  priority?: SupportTicketPriority;
  description: string;
}

// --- Custom application questions ---
export type CustomQuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "number"
  | "date"
  | "yes_no";

export interface CustomQuestion {
  id: number | string;
  label: string;
  type: CustomQuestionType;
  required?: boolean;
  help_text?: string;
  options?: string[];
}

export type CustomQuestionAnswerValue = string | string[] | number | boolean;
export type CustomQuestionAnswers = Record<string, CustomQuestionAnswerValue>;

// --- Email verification ---
export interface EmailVerificationStatus {
  verified: boolean;
  email?: string;
  resent_at?: string;
}
