import { Alert, Linking } from "react-native";
import type { Job } from "../types/job";
import { jobsApi } from "../api/jobs";
import { openExternalUrl } from "./openExternal";

/** Button label for the job's apply route, matching the web job page. */
export function applyButtonTitle(job: Job): string {
  switch (job.apply_route?.kind) {
    case "email":
      return "Apply via Email";
    case "external":
      return "Apply on Company Site";
    default:
      return "Apply Now";
  }
}

/**
 * Applies outside the app when the employer takes applications by email or
 * on their own site. Returns false for in-app jobs so the caller opens the
 * apply form.
 */
export async function openOutsideApply(job: Job): Promise<boolean> {
  const route = job.apply_route;
  if (!route || route.kind === "in_app" || route.kind === "instructions") return false;

  jobsApi.recordApplyClick(job.id);

  if (route.kind === "external") {
    await openExternalUrl(route.url);
    return true;
  }

  const url = `mailto:${route.email}?subject=${encodeURIComponent(`Application for ${job.title}`)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("No mail app found", `Send your application to ${route.email}.`);
  }
  return true;
}
