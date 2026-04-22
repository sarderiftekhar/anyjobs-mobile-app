import type { UserType } from "./user";

// --- Admin users ---

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  user_type: UserType;
  email_verified: boolean;
  is_locked?: boolean;
  is_hidden?: boolean;
  last_login_at?: string | null;
  created_at: string;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface AdminUserDetail extends AdminUser {
  updated_at?: string;
  login_count?: number;
  notes?: string | null;
}

export interface UserFilters {
  q?: string;
  role?: UserType | "all";
  verified?: "verified" | "unverified" | "all";
  locked?: "locked" | "unlocked" | "all";
  page?: number;
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  user_type: UserType;
  email_verified?: boolean;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  user_type?: UserType;
  phone?: string;
}

// --- Tickets ---

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketSource = "candidate" | "employer" | "visitor";

export interface SupportTicket {
  id: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  requester_name: string;
  requester_email: string;
  created_at: string;
  updated_at: string;
  unread_replies?: number;
  last_message_preview?: string;
}

export interface TicketReply {
  id: number;
  ticket_id: number;
  author_name: string;
  author_type: "admin" | "user" | "visitor";
  body: string;
  created_at: string;
}

export interface TicketDetail extends SupportTicket {
  body: string;
  replies: TicketReply[];
}

export interface VisitorMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  resolved_at?: string | null;
}

// --- Monitor ---

export interface OnlineUser {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
  last_activity: string;
  ip?: string;
}

export interface HiddenUser extends AdminUser {
  hidden_at?: string;
  hide_reason?: string | null;
}

// --- Stats ---

export interface SystemStats {
  users_total: number;
  online_users: number;
  open_tickets: number;
  new_signups_24h: number;
  jobs_total?: number;
  applications_total?: number;
}

// --- Progress ---

export interface ProgressTask {
  id: number;
  section_id: number;
  title: string;
  status: "todo" | "in_progress" | "done";
  progress_percent: number;
  updated_at: string;
}

export interface ProgressSection {
  id: number;
  title: string;
  description?: string;
  progress_percent: number;
  tasks?: ProgressTask[];
}

export interface ProgressSnapshot {
  id: number;
  label: string;
  overall_percent: number;
  created_at: string;
}
