export type AlertFrequency = "instant" | "daily" | "weekly";
export type AlertExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

export interface ResumeAlert {
  id: number;
  alert_name: string;
  job_title?: string | null;
  skills?: string[] | null;
  location?: string | null;
  experience_level?: AlertExperienceLevel | null;
  email_frequency: AlertFrequency;
  is_active: boolean;
  matches_count?: number;
  created_at: string;
}

export interface ResumeAlertPayload {
  alert_name: string;
  job_title?: string | null;
  skills?: string[] | null;
  location?: string | null;
  experience_level?: AlertExperienceLevel | null;
  email_frequency: AlertFrequency;
  is_active?: boolean;
}
