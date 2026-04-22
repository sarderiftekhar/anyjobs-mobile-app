import { publicApiClient } from "./client";
import { transformJob } from "./transformers";
import type { Job } from "../types/job";
import type {
  Category,
  Faq,
  LocationSuggestion,
  NearbyJob,
  PlaceDetails,
  VisitorMessage,
} from "../types/shared";

/**
 * Shared / public API — unauthed endpoints for categories, trending/featured jobs,
 * location autocomplete, nearby jobs, FAQs, and visitor support chat.
 *
 * All endpoints live under `/api/v1/...` and are hit through `publicApiClient`.
 * Backend refs:
 *   - JobCategoryController (routes: GET /categories, /categories/{slug}/jobs)
 *   - JobSearchController   (routes: GET /jobs/trending, /jobs/featured)
 *   - GeolocationController (routes: GET /location/autocomplete, /place-details, /jobs/nearby)
 *   - FaqController         (route:  GET /chat/faqs)
 *   - VisitorMessageController (routes: POST /chat/messages, POST /chat/messages/by-email,
 *                              GET /chat/messages/{id})
 */

// ------------------------------------------------------------
// Categories
// ------------------------------------------------------------

export async function listCategories(): Promise<Category[]> {
  const r = await publicApiClient.get("/categories");
  // backend returns { status: 'success', data: [...] }
  return (r.data?.data ?? []) as Category[];
}

export async function getCategory(
  slug: string,
  params: { page?: number; per_page?: number; location?: string } = {}
): Promise<{ category: Category; jobs: Job[]; meta: { total: number; current_page: number; last_page: number } }> {
  const r = await publicApiClient.get(`/categories/${slug}/jobs`, { params });
  // backend: { status, data: { category, jobs: { data: [...], total, current_page, last_page } } }
  const payload = r.data?.data ?? {};
  const jobsPage = payload.jobs ?? {};
  return {
    category: payload.category,
    jobs: (jobsPage.data ?? []).map(transformJob),
    meta: {
      total: jobsPage.total ?? 0,
      current_page: jobsPage.current_page ?? 1,
      last_page: jobsPage.last_page ?? 1,
    },
  };
}

// ------------------------------------------------------------
// Trending / Featured jobs
// ------------------------------------------------------------

export async function trendingJobs(limit = 10): Promise<Job[]> {
  const r = await publicApiClient.get("/jobs/trending", { params: { limit } });
  // backend returns a plain array of jobs (see JobSearchController::getTrendingJobs)
  const raw = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
  return raw.map(transformJob);
}

export async function featuredJobs(limit = 10): Promise<Job[]> {
  const r = await publicApiClient.get("/jobs/featured", { params: { limit } });
  const raw = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
  return raw.map(transformJob);
}

// ------------------------------------------------------------
// Location autocomplete + place details
// ------------------------------------------------------------

export async function locationAutocomplete(
  input: string,
  opts: { country?: string; types?: string } = {}
): Promise<LocationSuggestion[]> {
  if (!input || input.length < 2) return [];
  const r = await publicApiClient.get("/location/autocomplete", {
    params: { input, ...opts },
  });
  return (r.data?.data ?? []) as LocationSuggestion[];
}

export async function placeDetails(place_id: string): Promise<PlaceDetails | null> {
  const r = await publicApiClient.get("/location/place-details", {
    params: { place_id },
  });
  return (r.data?.data ?? null) as PlaceDetails | null;
}

// ------------------------------------------------------------
// Nearby jobs (geolocation)
// ------------------------------------------------------------

export async function nearbyJobs(
  latitude: number,
  longitude: number,
  opts: { radius?: number; limit?: number } = {}
): Promise<NearbyJob[]> {
  const r = await publicApiClient.get("/location/jobs/nearby", {
    params: { latitude, longitude, radius: opts.radius ?? 50, limit: opts.limit ?? 20 },
  });
  return (r.data?.data ?? []) as NearbyJob[];
}

// ------------------------------------------------------------
// FAQs
// ------------------------------------------------------------

export async function listFaqs(): Promise<Faq[]> {
  const r = await publicApiClient.get("/chat/faqs");
  return (r.data?.data ?? []) as Faq[];
}

// ------------------------------------------------------------
// Visitor / public support chat
// ------------------------------------------------------------

/**
 * Start a new visitor conversation by sending the first message.
 * Returns the created VisitorMessage record (includes `id`).
 */
export async function visitorChatStart(input: {
  visitor_name: string;
  visitor_email: string;
  message: string;
}): Promise<VisitorMessage> {
  const r = await publicApiClient.post("/chat/messages", input);
  return r.data?.data as VisitorMessage;
}

/**
 * Send a follow-up message. Backend currently stores each visitor message
 * as its own record keyed by email; there's no per-conversation append
 * endpoint, so we post a new message on the same email thread.
 */
export async function visitorChatSend(input: {
  visitor_name: string;
  visitor_email: string;
  message: string;
}): Promise<VisitorMessage> {
  const r = await publicApiClient.post("/chat/messages", input);
  return r.data?.data as VisitorMessage;
}

/**
 * Fetch all messages for a visitor by email (chat history).
 */
export async function visitorChatMessages(email: string): Promise<VisitorMessage[]> {
  const r = await publicApiClient.post("/chat/messages/by-email", { email });
  return (r.data?.data ?? []) as VisitorMessage[];
}

export const sharedApi = {
  listCategories,
  getCategory,
  trendingJobs,
  featuredJobs,
  locationAutocomplete,
  placeDetails,
  nearbyJobs,
  listFaqs,
  visitorChatStart,
  visitorChatSend,
  visitorChatMessages,
};
