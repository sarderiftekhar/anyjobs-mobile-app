import apiClient from "./client";
import type { User, Experience, Education, CvUpload } from "../types/user";
import type { ApiResponse } from "../types/api";

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
    }),

  setPrimaryCv: (id: number) =>
    apiClient.patch<ApiResponse<CvUpload>>(`/profile/cv/${id}/primary`),

  deleteCv: (id: number) =>
    apiClient.delete<ApiResponse>(`/profile/cv/${id}`),
};
