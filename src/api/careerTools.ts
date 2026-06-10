import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { Course, CareerPath, InterviewPrep } from "../types/profileExtras";

export const careerToolsApi = {
  courses: () =>
    apiClient.get<ApiResponse<Course[]>>("/candidate/courses").then((r) => r.data.data ?? []),

  careerPath: () =>
    apiClient.get<ApiResponse<CareerPath>>("/candidate/career-path").then((r) => r.data.data!),

  interviewPrep: () =>
    apiClient
      .get<ApiResponse<InterviewPrep>>("/candidate/interview-prep")
      .then((r) => r.data.data!),
};
