import apiClient from "./client";
import type {
  User,
  Experience,
  Education,
  CvUpload,
  LanguageEntry,
  CertificationEntry,
  ReferenceEntry,
} from "../types/user";
import type { ApiResponse } from "../types/api";

export interface BasicInfoPayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  website?: string;
  date_of_birth?: string;
  gender?: string;
}

export interface ProfessionalPayload {
  professional_title?: string;
  professional_summary?: string;
  years_experience?: number;
  current_company?: string;
  current_position?: string;
  industry?: string;
  employment_status?: string;
  current_salary?: number;
  salary_currency?: string;
}

export interface LocationPayload {
  country?: string;
  state_province?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  willing_to_relocate?: boolean;
}

export interface PreferencesPayload {
  preferred_job_types?: string[];
  preferred_work_arrangements?: string[];
  preferred_locations?: string[];
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  expected_salary_currency?: string;
  open_to_work?: boolean;
  open_to_remote?: boolean;
  available_from?: string | null;
}

export interface PrivacyPayload {
  profile_public?: boolean;
  show_contact_info?: boolean;
  show_current_employer?: boolean;
  show_salary_info?: boolean;
  allow_recruiter_contact?: boolean;
}

export interface NotificationPrefsPayload {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  notification_preferences?: string[];
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  title?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface ExperiencePayload {
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface EducationPayload {
  school: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
}

export const profileApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<User>>("/auth/user"),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<ApiResponse<User>>("/profile", data),

  updateAvatar: (formData: FormData) =>
    apiClient.post<ApiResponse<{ avatar_url: string }>>("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000,
    }),

  // Experience
  addExperience: (data: ExperiencePayload) =>
    apiClient.post<ApiResponse<Experience>>("/profile/experiences", data),

  updateExperience: (id: number, data: ExperiencePayload) =>
    apiClient.put<ApiResponse<Experience>>(`/profile/experiences/${id}`, data),

  deleteExperience: (id: number) =>
    apiClient.delete<ApiResponse>(`/profile/experiences/${id}`),

  // Education
  addEducation: (data: EducationPayload) =>
    apiClient.post<ApiResponse<Education>>("/profile/educations", data),

  updateEducation: (id: number, data: EducationPayload) =>
    apiClient.put<ApiResponse<Education>>(`/profile/educations/${id}`, data),

  deleteEducation: (id: number) =>
    apiClient.delete<ApiResponse>(`/profile/educations/${id}`),

  // Skills
  updateSkills: (skillIds: number[]) =>
    apiClient.put<ApiResponse>("/profile/skills", { skill_ids: skillIds }),

  // CV
  listCvs: () =>
    apiClient.get<ApiResponse<CvUpload[]>>("/profile/cvs"),

  uploadCv: (formData: FormData) =>
    apiClient.post<ApiResponse<CvUpload>>("/profile/cv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000,
    }),

  setPrimaryCv: (id: number) =>
    apiClient.patch<ApiResponse<CvUpload>>(`/profile/cv/${id}/primary`),

  deleteCv: (id: number) =>
    apiClient.delete<ApiResponse>(`/profile/cv/${id}`),

  // ---- Granular sections (each returns the refreshed user) ----
  updateBasicInfo: (data: BasicInfoPayload) =>
    apiClient.put<ApiResponse<User>>("/profile/basic-info", data),

  updateProfessional: (data: ProfessionalPayload) =>
    apiClient.put<ApiResponse<User>>("/profile/professional", data),

  updateContact: (data: { phone?: string; mobile?: string; website?: string }) =>
    apiClient.put<ApiResponse<User>>("/profile/contact", data),

  updateLocation: (data: LocationPayload) =>
    apiClient.put<ApiResponse<User>>("/profile/location", data),

  updatePreferences: (data: PreferencesPayload) =>
    apiClient.put<ApiResponse<User>>("/profile/preferences", data),

  updatePrivacy: (data: PrivacyPayload) =>
    apiClient.put<ApiResponse<User>>("/profile/privacy", data),

  updateNotificationPreferences: (data: NotificationPrefsPayload) =>
    apiClient.put<ApiResponse<User>>("/profile/notification-preferences", data),

  // ---- Resume JSON sections ----
  updateCertifications: (certifications: CertificationEntry[]) =>
    apiClient.put<ApiResponse<User>>("/profile/certifications", { certifications }),

  updateLanguages: (languages: LanguageEntry[]) =>
    apiClient.put<ApiResponse<User>>("/profile/languages", { languages }),

  updateReferences: (references: ReferenceEntry[]) =>
    apiClient.put<ApiResponse<User>>("/profile/references", { references }),
};
