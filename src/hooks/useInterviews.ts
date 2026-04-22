import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewsApi } from "../api/interviews";
import type {
  Interview,
  SchedulePayload,
  ReschedulePayload,
  CancelPayload,
  InterviewFilter,
} from "../types/interview";

const KEY = ["employer", "interviews"] as const;

function unwrap<T>(payload: any, fallback: T): T {
  if (payload == null) return fallback;
  if (Array.isArray(payload)) return payload as unknown as T;
  if (payload.data !== undefined) return payload.data as T;
  return payload as T;
}

export function useInterviews(filter: InterviewFilter = "upcoming") {
  return useQuery({
    queryKey: [...KEY, "list", filter],
    queryFn: async (): Promise<Interview[]> => {
      if (filter === "upcoming") {
        const r = await interviewsApi.upcoming();
        return unwrap<Interview[]>(r.data, []);
      }
      if (filter === "today") {
        const r = await interviewsApi.today();
        return unwrap<Interview[]>(r.data, []);
      }
      const statusParam =
        filter === "cancelled" ? "cancelled" : filter === "past" ? "completed" : undefined;
      const r = await interviewsApi.list({ status: statusParam });
      return unwrap<Interview[]>(r.data, []);
    },
  });
}

export function useInterview(id: number) {
  return useQuery({
    queryKey: [...KEY, "detail", id],
    queryFn: async () => {
      const r = await interviewsApi.get(id);
      return unwrap<Interview>(r.data, {} as Interview);
    },
    enabled: !!id,
  });
}

export function useInterviewStats() {
  return useQuery({
    queryKey: [...KEY, "stats"],
    queryFn: async () => {
      const r = await interviewsApi.stats();
      return unwrap(r.data, {
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
      });
    },
  });
}

export function useSchedulableApplications() {
  return useQuery({
    queryKey: [...KEY, "schedulable-applications"],
    queryFn: async () => {
      const r = await interviewsApi.schedulableApplications();
      return unwrap(r.data, []);
    },
  });
}

export function useScheduleInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchedulePayload) => interviewsApi.schedule(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
}

export function useRescheduleInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReschedulePayload }) =>
      interviewsApi.reschedule(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCancelInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CancelPayload }) =>
      interviewsApi.cancel(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCompleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => interviewsApi.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useStartInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => interviewsApi.start(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
