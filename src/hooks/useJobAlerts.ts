import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobAlertsApi } from "../api/jobAlerts";
import type { JobAlertPayload } from "../types/profileExtras";

const KEY = ["candidate", "job-alerts"];

export function useJobAlerts() {
  return useQuery({ queryKey: KEY, queryFn: jobAlertsApi.list });
}

export function useCreateJobAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobAlertPayload) => jobAlertsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateJobAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<JobAlertPayload> }) =>
      jobAlertsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteJobAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobAlertsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useToggleJobAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobAlertsApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
