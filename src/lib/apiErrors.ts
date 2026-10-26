import { Alert } from "react-native";

/**
 * The backend answers 403 `{ upgrade_required: true, feature }` when a feature
 * isn't in the user's plan, e.g. AI cover letters below Plus.
 *
 * Plans are sold on the website only, never in the app. Apple rejects apps
 * that point users at buying elsewhere (Guidelines 3.1.1 / 3.1.3), so the app
 * says what's unavailable but doesn't name plans or say "upgrade" — which is
 * why the server's web-oriented `message` isn't shown here.
 */
export function isUpgradeRequired(err: any): boolean {
  return err?.response?.status === 403 && !!err?.response?.data?.upgrade_required;
}

/** Neutral, purchase-free copy for an upgrade-required error. */
export function planLimitMessage(err: any): string {
  switch (err?.response?.data?.feature) {
    case "saved_cover_letters":
      return "Your plan lets you keep 2 saved cover letters. Delete one to save another.";
    case "active_jobs":
      return "You've reached the number of live jobs your plan allows. Pause or close a job to publish this one.";
    default:
      return "This feature isn't included in your current plan.";
  }
}

/** Shows the plan message if `err` is an upgrade-required error; returns whether it did. */
export function alertIfUpgradeRequired(err: any): boolean {
  if (!isUpgradeRequired(err)) return false;
  Alert.alert("Not included in your plan", planLimitMessage(err));
  return true;
}

/** Laravel 422 errors flattened to `field => first message`. */
export function validationErrors(err: any): Record<string, string> {
  const errors = err?.response?.status === 422 ? err.response.data?.errors : null;
  if (!errors || typeof errors !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    out[key] = Array.isArray(value) ? String(value[0]) : String(value);
  }
  return out;
}
