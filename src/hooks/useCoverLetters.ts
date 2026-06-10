import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coverLettersApi, type CoverLetterPayload } from "../api/coverLetters";
import { useAuthStore } from "../stores/authStore";

const KEY = ["candidate", "cover-letters"];

export function useCoverLetters() {
  return useQuery({ queryKey: KEY, queryFn: coverLettersApi.list });
}

export function useCreateCoverLetter() {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (payload: CoverLetterPayload) => coverLettersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      refreshUser();
    },
  });
}

export function useUpdateCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CoverLetterPayload> }) =>
      coverLettersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coverLettersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetDefaultCoverLetter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coverLettersApi.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useGenerateCoverLetter() {
  return useMutation({
    mutationFn: ({ jobId, tone }: { jobId: number; tone?: string }) =>
      coverLettersApi.generate(jobId, tone),
  });
}
