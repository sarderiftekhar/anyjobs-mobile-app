import { publicApiClient } from "./client";

export type SuggestionType = "role" | "skill" | "company";

export interface SearchSuggestion {
  key: string;
  label: string;
  sublabel?: string;
  type: SuggestionType;
}

// Mirrors the website's HeroSection autocomplete: fan out to job-titles, skills,
// and companies in parallel, then merge into a single ranked list.
export async function fetchSearchSuggestions(
  q: string,
  signal?: AbortSignal,
): Promise<SearchSuggestion[]> {
  const query = q.trim();
  if (query.length < 2) return [];

  const params = { q: query, limit: 5 };
  const opts = { params, signal };

  const [rolesRes, skillsRes, companiesRes] = await Promise.all([
    publicApiClient.get("/suggestions/job-titles", opts).catch(() => ({ data: [] })),
    publicApiClient.get("/suggestions/skills", opts).catch(() => ({ data: [] })),
    publicApiClient.get("/suggestions/companies", opts).catch(() => ({ data: [] })),
  ]);

  const arr = (v: any) => (Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);

  const roles: SearchSuggestion[] = arr(rolesRes.data).map((r: any) => ({
    key: `role-${r.id}`,
    label: r.name,
    sublabel: r.industry,
    type: "role",
  }));
  const skills: SearchSuggestion[] = arr(skillsRes.data).map((s: any) => ({
    key: `skill-${s.id}`,
    label: s.name,
    sublabel: s.category,
    type: "skill",
  }));
  const companies: SearchSuggestion[] = arr(companiesRes.data).map((c: any) => ({
    key: `company-${c.id}`,
    label: c.name,
    type: "company",
  }));

  return [...roles, ...skills, ...companies].slice(0, 12);
}
