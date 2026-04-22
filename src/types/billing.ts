export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "inactive";

export interface SubscriptionPlan {
  id: number | string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year" | string;
  description?: string;
  features: string[];
  limits?: {
    jobs?: number;
    featured_credits?: number;
    applicants_views?: number;
  };
  is_current?: boolean;
  is_popular?: boolean;
  stripe_price_id?: string;
}

export interface CurrentSubscription {
  id: number | string;
  plan_id: number | string;
  plan_name: string;
  status: SubscriptionStatus;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  renewal_date?: string;
  price?: number;
  currency?: string;
  interval?: string;
}

export interface UsageStats {
  jobs_posted: number;
  jobs_limit: number | null;
  featured_credits_used: number;
  featured_credits_limit: number | null;
  applicants_viewed: number;
  applicants_viewed_limit: number | null;
}

export interface Invoice {
  id: string | number;
  number?: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void" | "uncollectible" | string;
  created_at: string;
  hosted_url?: string;
  pdf_url?: string;
}

export interface CreateCheckoutResponse {
  checkout_url: string;
  session_id?: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export interface PaymentMethodSummary {
  id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default?: boolean;
}
