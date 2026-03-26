import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employerApi, type CreateJobPayload } from "../api/employer";

// ---- Dashboard ----

export function useEmployerDashboard() {
  return useQuery({
    queryKey: ["employer", "dashboard"],
    queryFn: () => employerApi.getDashboard().then((r) => r.data.data!),
  });
}

// ---- Jobs ----

export function useEmployerJobs(status?: string) {
  return useInfiniteQuery({
    queryKey: ["employer", "jobs", status],
    queryFn: ({ pageParam = 1 }) =>
      employerApi.getJobs({ status, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
}

export function useEmployerJobDetail(id: number) {
  return useQuery({
    queryKey: ["employer", "jobs", "detail", id],
    queryFn: () => employerApi.getJobById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobPayload) => employerApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateJobPayload> }) =>
      employerApi.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      employerApi.updateJobStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employerApi.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
}

// ---- Applicants ----

export function useApplicants(params?: { job_id?: number; status?: string; sort?: string }) {
  return useInfiniteQuery({
    queryKey: ["employer", "applicants", params],
    queryFn: ({ pageParam = 1 }) =>
      employerApi.getApplicants({ ...params, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
}

export function useApplicantDetail(id: number) {
  return useQuery({
    queryKey: ["employer", "applicants", "detail", id],
    queryFn: () => employerApi.getApplicantById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useUpdateApplicantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: string; note?: string }) =>
      employerApi.updateApplicantStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "applicants"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
}

export function useRateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: number; rating: number }) =>
      employerApi.rateApplicant(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "applicants"] });
    },
  });
}

// ---- Company Profile ----

export function useCompanyProfile() {
  return useQuery({
    queryKey: ["employer", "company"],
    queryFn: () => employerApi.getCompanyProfile().then((r) => r.data.data!),
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => employerApi.updateCompanyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "company"] });
    },
  });
}
