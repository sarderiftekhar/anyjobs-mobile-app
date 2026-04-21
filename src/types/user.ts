export type UserType = "candidate" | "employer" | "admin" | "editor" | "agent";

export interface UserProfile {
  title?: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  website?: string;
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
  created_at: string;
  profile?: UserProfile;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  cvs?: CvUpload[];
  primary_cv_id?: number | null;
}
