import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile";
import { useAuthStore } from "../stores/authStore";
import type { CvUpload } from "../types/user";

const CVS_KEY = ["profile", "cvs"] as const;

export function useCvs() {
  return useQuery({
    queryKey: CVS_KEY,
    queryFn: async () => {
      const res = await profileApi.listCvs();
      return res.data.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUploadCv() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await profileApi.uploadCv(formData);
      return res.data.data as CvUpload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CVS_KEY });
      refreshUser();
    },
  });
}

export function useSetPrimaryCv() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (id: number) => profileApi.setPrimaryCv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CVS_KEY });
      refreshUser();
    },
  });
}

export function useDeleteCv() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (id: number) => profileApi.deleteCv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CVS_KEY });
      refreshUser();
    },
  });
}
