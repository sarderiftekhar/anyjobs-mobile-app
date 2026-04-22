import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "../api/billing";

const BILLING_KEY = ["employer", "billing"] as const;

export function useSubscription() {
  return useQuery({
    queryKey: [...BILLING_KEY, "subscription"],
    queryFn: () => billingApi.getSubscription().then((r) => r.data.data ?? null),
  });
}

export function usePlans() {
  return useQuery({
    queryKey: [...BILLING_KEY, "plans"],
    queryFn: () => billingApi.getPlans().then((r) => r.data.data ?? []),
  });
}

export function useUsageStats() {
  return useQuery({
    queryKey: [...BILLING_KEY, "usage"],
    queryFn: () => billingApi.getUsageStats().then((r) => r.data.data!),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (planId: number | string) =>
      billingApi.createCheckoutSession(planId).then((r) => r.data.data!),
  });
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: () => billingApi.customerPortalUrl().then((r) => r.data.data!),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices"],
    queryFn: () => billingApi.getInvoices().then((r) => r.data.data ?? []),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: [...BILLING_KEY, "payment-methods"],
    queryFn: () => billingApi.getPaymentMethods().then((r) => r.data.data ?? []),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => billingApi.cancelSubscription(),
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLING_KEY }),
  });
}
