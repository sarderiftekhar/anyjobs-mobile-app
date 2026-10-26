import Constants from "expo-constants";

// Resolve API base URL with this precedence:
//   1. EXPO_PUBLIC_API_URL (injected by EAS profile env in eas.json) — used for
//      preview/production APKs to point at the right backend per build profile.
//   2. Dev fallback to https://dev.continentjobs.com (same default used in Expo Go).
//   3. Prod fallback to https://api.continentjobs.com when bundled as a release without env.
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

const FALLBACK_API_URL = __DEV__
  ? "https://dev.continentjobs.com/api"
  : "https://api.continentjobs.com/api";

const API_URL = ENV_API_URL ?? FALLBACK_API_URL;

// Public marketing/legal site (separate from the API host).
const WEB_URL = "https://continentjobs.com";

export const config = {
  API_BASE_URL: API_URL,
  API_MOBILE_URL: `${API_URL}/v1/mobile`,
  API_PUBLIC_URL: `${API_URL}/v1`,
  API_HOST: null,
  APP_VERSION: Constants.expoConfig?.version ?? "1.0.0",
  APP_NAME: "ContinentJobs",
  TOKEN_KEY: "continentjobs_auth_token",
  USER_KEY: "continentjobs_user",
  // Persisted flag: user has accepted AI processing (App Store Guideline 5.1.2).
  // v2: v1 consent named the wrong vendor, so everyone is asked again.
  AI_CONSENT_KEY: "continentjobs_ai_consent_v2",

  // AI vendors disclosed in the consent screen. Keep in step with the backend:
  // generation goes through OpenRouter (config/ai.php, LaravelOpenRouterService)
  // and application matching through TypeSafe (CandidateJobFitService).
  AI_GENERATION_PROVIDER: "Google Gemini, accessed through OpenRouter",
  AI_MATCHING_PROVIDER: "TypeSafe",

  // Legal / support destinations surfaced inside the app's Settings menu.
  PRIVACY_POLICY_URL: `${WEB_URL}/privacy-policy`,
  TERMS_URL: `${WEB_URL}/terms`,
  SUPPORT_EMAIL: "support@continentjobs.com",
} as const;
