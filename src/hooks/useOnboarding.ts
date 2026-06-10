import { useMutation, useQuery } from "@tanstack/react-query";
import { onboardingApi } from "../api/onboarding";
import { useAuthStore } from "../stores/authStore";
import type { OnboardingPayload } from "../types/profileExtras";

export function useOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: ["candidate", "onboarding", "status"],
    queryFn: onboardingApi.status,
    enabled,
    retry: 0,
  });
}

export function useCompleteOnboarding() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: (payload: OnboardingPayload) => onboardingApi.complete(payload),
    onSuccess: () => refreshUser(),
  });
}
