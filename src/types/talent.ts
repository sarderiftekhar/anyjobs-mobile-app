export interface TalentListItem {
  id: number;
  name: string;
  avatar?: string | null;
  professional_title: string;
  current_company?: string;
  years_experience?: number | string;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  salary_currency?: string;
  location?: string;
  open_to_work?: boolean;
  skills: string[];
  education?: {
    degree?: string;
    institution?: string;
  } | null;
  has_cv?: boolean;
  match_score?: number;
}

export interface TalentExperience {
  job_title: string;
  company_name: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string;
}

export interface TalentEducation {
  degree?: string;
  field_of_study?: string;
  institution?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
}

export interface TalentSkill {
  name: string;
  proficiency_level?: string;
}

export interface TalentCertification {
  name: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
}

export interface TalentLanguage {
  language: string;
  proficiency_level?: string;
}

export interface TalentProfile {
  id: number;
  name: string;
  email?: string;
  avatar?: string | null;
  profile: {
    professional_title?: string;
    professional_summary?: string;
    current_company?: string;
    current_position?: string;
    years_experience?: number;
    industry?: string;
    employment_status?: string;
    phone?: string;
    city?: string;
    country?: string;
    expected_salary_min?: number | null;
    expected_salary_max?: number | null;
    willing_to_relocate?: boolean;
    open_to_work?: boolean;
    available_from?: string | null;
  };
  skills: TalentSkill[];
  education: TalentEducation[];
  experience: TalentExperience[];
  certifications: TalentCertification[];
  languages: TalentLanguage[];
  has_cv: boolean;
}

export interface TalentSearchFilters {
  keywords?: string;
  skills?: string[];
  experience_levels?: string[];
  location?: string;
  available?: boolean;
  industries?: string[];
  job_categories?: string[];
  salary_min?: number;
  salary_max?: number;
  page?: number;
  per_page?: number;
}

export interface TalentSearchResponse {
  success: boolean;
  candidates: TalentListItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
