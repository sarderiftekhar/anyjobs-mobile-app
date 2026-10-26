import type { ApplyRoute, Job, ScreeningQuestion } from "../types/job";

/**
 * Transform raw API job data to the Job type the app expects.
 * The Laravel API returns a different shape than our TypeScript types.
 */
export function transformJob(raw: any): Job {
  return {
    id: raw.id,
    title: raw.title ?? "",
    company: {
      id: raw.user_id ?? 0,
      name: raw.company_name ?? raw.companyData?.name ?? "Unknown",
      logo_url: raw.company_logo ?? raw.companyData?.logo ?? null,
      industry: raw.companyData?.industry ?? null,
      size: raw.companyData?.size ?? null,
      website: raw.companyData?.website ?? null,
    },
    location: raw.location ?? [raw.location_city, raw.location_state, raw.location_country].filter(Boolean).join(", ") ?? "",
    country: raw.country?.name ?? raw.location_country,
    state: raw.stateProvince?.name ?? raw.location_state,
    city: raw.city?.name ?? raw.location_city,
    job_type: parseJobTypes(raw.job_type) as Job["job_type"],
    work_arrangement: parseWorkArrangement(raw.work_arrangement) as Job["work_arrangement"],
    salary: parseSalary(raw),
    description: raw.description ?? "",
    requirements: parseListField(raw.requirements),
    responsibilities: parseListField(raw.responsibilities),
    benefits: parseListField(raw.benefits),
    skills: [
      ...(raw.skills_required ?? []),
      ...(raw.skills_preferred ?? []),
      ...(raw.skills?.map?.((s: any) => (typeof s === "string" ? s : s.name)) ?? []),
    ],
    experience_level: raw.experience_level ?? null,
    status: raw.status === "published" ? "active" : raw.status,
    is_featured: !!raw.is_featured,
    is_urgent: !!raw.is_urgent,
    application_deadline: raw.application_deadline,
    posted_at: raw.published_at ?? raw.created_at,
    is_saved: raw.is_saved ?? false,
    has_applied: raw.has_applied ?? false,
    screening_questions: Array.isArray(raw.screening_questions)
      ? raw.screening_questions.map(parseScreeningQuestion)
      : undefined,
    apply_route: parseApplyRoute(raw),
  };
}

function parseScreeningQuestion(q: any): ScreeningQuestion {
  return {
    id: String(q.id),
    label: q.label ?? q.question ?? "",
    type: q.type ?? "long_text",
    required: !!q.required,
    options: Array.isArray(q.options) ? q.options.map(String) : [],
  };
}

// Same precedence as ApplyAction on the web job page (candidate/jobs/show.tsx).
function parseApplyRoute(raw: any): ApplyRoute {
  if (raw.is_hot_hiring && raw.posting_type === "image") {
    if (raw.hot_hiring_application_method === "email" && raw.hot_hiring_application_email) {
      return { kind: "email", email: raw.hot_hiring_application_email };
    }
    if (raw.hot_hiring_application_method === "url" && raw.hot_hiring_application_url) {
      return { kind: "external", url: raw.hot_hiring_application_url };
    }
    return { kind: "instructions", instructions: raw.hot_hiring_application_instructions ?? null };
  }
  if (raw.application_method === "email" && raw.application_email) {
    return { kind: "email", email: raw.application_email };
  }
  if (raw.application_method === "external" && raw.application_url) {
    return { kind: "external", url: raw.application_url };
  }
  return { kind: "in_app" };
}

function parseJobTypes(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  // "Full Time" -> ["full-time"]
  return [String(value).toLowerCase().replace(/\s+/g, "-")];
}

function parseWorkArrangement(value: any): string {
  if (!value) return "on-site";
  return String(value).toLowerCase().replace(/[\s_]+/g, "-");
}

function parseSalary(raw: any): Job["salary"] | undefined {
  if (!raw.salary_min && !raw.salary_max) return undefined;
  return {
    min: parseFloat(raw.salary_min) || 0,
    max: parseFloat(raw.salary_max) || 0,
    currency: raw.salary_currency ?? "GBP",
    period: (raw.salary_type ?? "yearly") as "yearly" | "monthly" | "hourly",
  };
}

function parseListField(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    // Try to parse bullet points or newline-separated items
    return value
      .split(/[\n•\u2022]/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }
  return [];
}
