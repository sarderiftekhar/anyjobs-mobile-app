export type UserType = "candidate" | "employer" | "admin" | "editor" | "agent";

export interface CoverLetter {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at?: string;
}

export interface LanguageEntry {
  name: string;
  proficiency?: string;
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  year?: string;
  credential_id?: string;
  url?: string;
}

export interface ReferenceEntry {
  name: string;
  relationship?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface UserProfile {
  // legacy aliases (mapped from real columns server-side)
  title?: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  website?: string;

  // basic
  first_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  mobile?: string | null;
  social_links?: Record<string, string> | string[] | null;

  // professional
  professional_title?: string | null;
  professional_summary?: string | null;
  years_experience?: number | null;
  current_company?: string | null;
  current_position?: string | null;
  industry?: string | null;
  employment_status?: string | null;
  current_salary?: number | string | null;
  salary_currency?: string | null;

  // location
  country?: string | null;
  state_province?: string | null;
  city?: string | null;
  postal_code?: string | null;
  address?: string | null;
  willing_to_relocate?: boolean;

  // preferences
  preferred_job_types?: string[];
  preferred_work_arrangements?: string[];
  preferred_locations?: string[];
  expected_salary_min?: number | string | null;
  expected_salary_max?: number | string | null;
  expected_salary_currency?: string | null;
  open_to_work?: boolean;
  open_to_remote?: boolean;
  available_from?: string | null;

  // privacy + notifications
  profile_public?: boolean;
  show_contact_info?: boolean;
  show_current_employer?: boolean;
  show_salary_info?: boolean;
  allow_recruiter_contact?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  notification_preferences?: string[];

  // resume JSON sections
  languages?: LanguageEntry[];
  certifications?: CertificationEntry[];
  references?: ReferenceEntry[];
  cover_letters?: CoverLetter[];

  profile_completeness?: number;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field?: string;
  start_date: string;
  end_date?: string;
}

export interface Skill {
  id: number;
  name: string;
  proficiency?: string;
}

export interface CvUpload {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  file_url: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  user_type: UserType;
  email_verified: boolean;
  subscription_tier: string;
  has_google: boolean;
  onboarding_completed?: boolean;
  needs_onboarding?: boolean;
  created_at: string;
  profile?: UserProfile;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  cvs?: CvUpload[];
  primary_cv_id?: number | null;
}
