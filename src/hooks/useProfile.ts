import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, type UpdateProfilePayload, type ExperiencePayload, type EducationPayload } from "../api/profile";
import { useAuthStore } from "../stores/authStore";

export function useUpdateProfile() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => profileApi.updateProfile(data),
    onSuccess: () => refreshUser(),
  });
}

export function useUpdateAvatar() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (formData: FormData) => profileApi.updateAvatar(formData),
    onSuccess: () => refreshUser(),
  });
}

export function useAddExperience() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (data: ExperiencePayload) => profileApi.addExperience(data),
    onSuccess: () => refreshUser(),
  });
}

export function useUpdateExperience() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExperiencePayload }) =>
      profileApi.updateExperience(id, data),
    onSuccess: () => refreshUser(),
  });
}

export function useDeleteExperience() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (id: number) => profileApi.deleteExperience(id),
    onSuccess: () => refreshUser(),
  });
}

export function useAddEducation() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (data: EducationPayload) => profileApi.addEducation(data),
    onSuccess: () => refreshUser(),
  });
}

export function useDeleteEducation() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (id: number) => profileApi.deleteEducation(id),
    onSuccess: () => refreshUser(),
  });
}

export function useUpdateSkills() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (skillIds: number[]) => profileApi.updateSkills(skillIds),
    onSuccess: () => refreshUser(),
  });
}

// CV hooks have moved to ./useCvs
export { useCvs, useUploadCv, useSetPrimaryCv, useDeleteCv } from "./useCvs";
