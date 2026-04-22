import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type {
  CreateCheckoutResponse,
  CurrentSubscription,
  CustomerPortalResponse,
  Invoice,
  PaymentMethodSummary,
  SubscriptionPlan,
  UsageStats,
} from "../types/billing";

// NOTE: Backend currently exposes subscription routes under the web-auth
// employer prefix: /employer/subscription/{index,packages,purchase,cancel,
// billing-portal,usage}. There is no /v1/mobile/employer/billing group yet.
// The mobile client assumes equivalent JSON endpoints will be added under
// /v1/mobile/employer/billing/*. Stripe hosted checkout URLs are returned
// by `purchase` and opened via Linking.openURL.

export const billingApi = {
  // Current subscription (current plan + renewal + status)
  getSubscription: () =>
    apiClient.get<ApiResponse<CurrentSubscription | null>>(
      "/employer/billing/subscription"
    ),

  // Plan comparison list
  getPlans: () =>
    apiClient.get<ApiResponse<SubscriptionPlan[]>>("/employer/billing/plans"),

  // Usage stats (jobs posted vs limit, featured credits, applicants viewed)
  getUsageStats: () =>
    apiClient.get<ApiResponse<UsageStats>>("/employer/billing/usage"),

  // Creates a Stripe hosted checkout session — returns URL to open externally
  createCheckoutSession: (planId: number | string) =>
    apiClient.post<ApiResponse<CreateCheckoutResponse>>(
      "/employer/billing/checkout",
      { plan_id: planId }
    ),

  // Cancel at period end
  cancelSubscription: () =>
    apiClient.post<ApiResponse>("/employer/billing/cancel"),

  // Stripe Customer Portal (manage payment methods, update card, etc.)
  customerPortalUrl: () =>
    apiClient.get<ApiResponse<CustomerPortalResponse>>(
      "/employer/billing/portal"
    ),

  // Invoice history
  getInvoices: () =>
    apiClient.get<ApiResponse<Invoice[]>>("/employer/billing/invoices"),

  // Payment methods on file
  getPaymentMethods: () =>
    apiClient.get<ApiResponse<PaymentMethodSummary[]>>(
      "/employer/billing/payment-methods"
    ),
};
