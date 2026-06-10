import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { User } from "../types/user";
import type { OnboardingStatus, OnboardingPayload } from "../types/profileExtras";

export const onboardingApi = {
  status: () =>
    apiClient
      .get<ApiResponse<OnboardingStatus>>("/candidate/onboarding/status")
      .then((r) => r.data.data!),

  complete: (payload: OnboardingPayload) =>
    apiClient
      .post<ApiResponse<User>>("/candidate/onboarding/complete", payload)
      .then((r) => r.data),
};
