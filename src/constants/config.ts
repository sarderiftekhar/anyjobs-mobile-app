import Constants from "expo-constants";

// Resolve API base URL with this precedence:
//   1. EXPO_PUBLIC_API_URL (injected by EAS profile env in eas.json) — used for
//      preview/production APKs to point at the right backend per build profile.
//   2. Dev fallback to https://dev.any-jobs.com (same default used in Expo Go).
//   3. Prod fallback to https://api.any-jobs.com when bundled as a release without env.
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

const FALLBACK_API_URL = __DEV__
  ? "https://dev.any-jobs.com/api"
  : "https://api.any-jobs.com/api";

const API_URL = ENV_API_URL ?? FALLBACK_API_URL;

// Public marketing/legal site (separate from the API host).
const WEB_URL = "https://any-jobs.com";

export const config = {
  API_BASE_URL: API_URL,
  API_MOBILE_URL: `${API_URL}/v1/mobile`,
  API_PUBLIC_URL: `${API_URL}/v1`,
  API_HOST: null,
  APP_VERSION: Constants.expoConfig?.version ?? "1.0.0",
  APP_NAME: "AnyJobs",
  TOKEN_KEY: "anyjobs_auth_token",
  USER_KEY: "anyjobs_user",
  // Persisted flag: user has accepted AI processing (App Store Guideline 5.1.2).
  AI_CONSENT_KEY: "anyjobs_ai_consent_v1",

  // Name of the AI vendor we disclose to users in the consent screen.
  AI_PROVIDER: "Anthropic (Claude)",

  // Legal / support destinations surfaced inside the app's Settings menu.
  PRIVACY_POLICY_URL: `${WEB_URL}/privacy-policy`,
  TERMS_URL: `${WEB_URL}/terms`,
  HELP_URL: `${WEB_URL}/help`,
  SUPPORT_EMAIL: "support@any-jobs.com",
} as const;
