import { useQuery } from "@tanstack/react-query";
import { careerToolsApi } from "../api/careerTools";
import { activitiesApi } from "../api/activities";

export function useCourses() {
  return useQuery({ queryKey: ["candidate", "courses"], queryFn: careerToolsApi.courses });
}

export function useCareerPath() {
  return useQuery({ queryKey: ["candidate", "career-path"], queryFn: careerToolsApi.careerPath });
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
