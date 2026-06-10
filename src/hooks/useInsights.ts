import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insightsApi, analysisApi } from "../api/insights";

export function useInsights() {
  return useQuery({
    queryKey: ["profile", "insights"],
    queryFn: insightsApi.get,
    retry: 0,
  });
}

export function useProfileAnalysis() {
  return useQuery({
    queryKey: ["profile", "analysis"],
    queryFn: analysisApi.get,
    retry: 0,
  });
}

export function useGenerateAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => analysisApi.generate(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", "analysis"] }),
  });
}

export function useConfirmAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => analysisApi.confirm(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", "analysis"] }),
  });
}

export function useRegenerateAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => analysisApi.regenerate(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", "analysis"] }),
  });
}
