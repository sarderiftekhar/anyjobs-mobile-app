import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "../api/jobs";
import type { JobFilters, Job } from "../types/job";

export function useJobSearch(filters: JobFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["jobs", "search", filters],
    queryFn: ({ pageParam = 1 }) =>
      jobsApi.searchAuth({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    enabled,
  });
}

export function useJobSearchPublic(filters: JobFilters) {
  return useInfiniteQuery({
    queryKey: ["jobs", "search-public", filters],
    queryFn: ({ pageParam = 1 }) =>
      jobsApi.search({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
}

export function useJobDetail(id: number) {
  return useQuery({
    queryKey: ["jobs", "detail", id],
    queryFn: () => jobsApi.getById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useFeaturedJobs() {
  return useQuery({
    queryKey: ["jobs", "featured"],
    queryFn: () => jobsApi.getFeatured().then((r) => r.data.data ?? []),
  });
}

export function useSavedJobs() {
  return useQuery({
    queryKey: ["jobs", "saved"],
    queryFn: () => jobsApi.getSaved().then((r) => r.data.data ?? []),
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: number) => jobsApi.save(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "saved"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", "search"] });
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: number) => jobsApi.unsave(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "saved"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", "search"] });
    },
  });
}
