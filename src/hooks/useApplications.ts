import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi, type ApplyPayload } from "../api/applications";

export function useApplications(status?: string) {
  return useInfiniteQuery({
    queryKey: ["applications", status],
    queryFn: ({ pageParam = 1 }) =>
      applicationsApi.list({ status, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
}

export function useApplicationDetail(id: number) {
  return useQuery({
    queryKey: ["applications", "detail", id],
    queryFn: () => applicationsApi.getById(id).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplyPayload) => applicationsApi.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => applicationsApi.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
