import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  profileApi,
  type UpdateProfilePayload,
  type ExperiencePayload,
  type EducationPayload,
  type BasicInfoPayload,
  type ProfessionalPayload,
  type LocationPayload,
  type PreferencesPayload,
  type PrivacyPayload,
  type NotificationPrefsPayload,
} from "../api/profile";
import type {
  LanguageEntry,
  CertificationEntry,
  ReferenceEntry,
} from "../types/user";
import { useAuthStore } from "../stores/authStore";

/** Generic helper: run a profile mutation, then refresh the cached user. */
function useProfileSection<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: fn,
    onSuccess: () => refreshUser(),
  });
}

export const useUpdateBasicInfo = () =>
  useProfileSection((d: BasicInfoPayload) => profileApi.updateBasicInfo(d));
export const useUpdateProfessional = () =>
  useProfileSection((d: ProfessionalPayload) => profileApi.updateProfessional(d));
export const useUpdateContactInfo = () =>
  useProfileSection((d: { phone?: string; mobile?: string; website?: string }) =>
    profileApi.updateContact(d),
  );
export const useUpdateLocation = () =>
  useProfileSection((d: LocationPayload) => profileApi.updateLocation(d));
export const useUpdatePreferences = () =>
  useProfileSection((d: PreferencesPayload) => profileApi.updatePreferences(d));
export const useUpdatePrivacy = () =>
  useProfileSection((d: PrivacyPayload) => profileApi.updatePrivacy(d));
export const useUpdateNotificationPreferences = () =>
  useProfileSection((d: NotificationPrefsPayload) =>
    profileApi.updateNotificationPreferences(d),
  );
export const useUpdateCertifications = () =>
  useProfileSection((d: CertificationEntry[]) => profileApi.updateCertifications(d));
export const useUpdateLanguages = () =>
  useProfileSection((d: LanguageEntry[]) => profileApi.updateLanguages(d));
export const useUpdateReferences = () =>
  useProfileSection((d: ReferenceEntry[]) => profileApi.updateReferences(d));

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
