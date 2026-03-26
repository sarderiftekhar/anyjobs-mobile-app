export type NotificationType =
  | "application_update"
  | "new_message"
  | "interview_scheduled"
  | "job_recommendation"
  | "profile_view"
  | "system";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}
