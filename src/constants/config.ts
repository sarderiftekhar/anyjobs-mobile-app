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

export const config = {
  API_BASE_URL: API_URL,
  API_MOBILE_URL: `${API_URL}/v1/mobile`,
  API_PUBLIC_URL: `${API_URL}/v1`,
  API_HOST: null,
  APP_VERSION: Constants.expoConfig?.version ?? "1.0.0",
  APP_NAME: "AnyJobs",
  TOKEN_KEY: "anyjobs_auth_token",
  USER_KEY: "anyjobs_user",
} as const;
