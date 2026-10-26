import { useQuery } from "@tanstack/react-query";
import { careerToolsApi } from "../api/careerTools";
import { activitiesApi } from "../api/activities";
import { isUpgradeRequired } from "../lib/apiErrors";

export function useCourses() {
  return useQuery({ queryKey: ["candidate", "courses"], queryFn: careerToolsApi.courses });
}

export function useCareerPath() {
  return useQuery({
    queryKey: ["candidate", "career-path"],
    queryFn: careerToolsApi.careerPath,
    // A plan gate (403 upgrade_required) won't change on retry.
    retry: (count, err) => !isUpgradeRequired(err) && count < 2,
  });
}

export function useInterviewPrep() {
  return useQuery({
    queryKey: ["candidate", "interview-prep"],
    queryFn: careerToolsApi.interviewPrep,
  });
}

export function useActivities(params?: { type?: string; important_only?: boolean }) {
  return useQuery({
    queryKey: ["candidate", "activities", params ?? {}],
    queryFn: () => activitiesApi.list(params),
  });
}
