import Constants from "expo-constants";
import { Platform } from "react-native";

// Laragon serves anyjobs.test via virtual host on port 80
const LOCAL_IP = "192.168.1.43";

const ENV = {
  development: {
    // Web (PC browser) can resolve anyjobs.test directly
    // Mobile devices on same WiFi use IP + Host header
    API_URL:
      Platform.OS === "web"
        ? "http://anyjobs.test/api"
        : `http://${LOCAL_IP}/api`,
    API_HOST: Platform.OS === "web" ? null : "anyjobs.test",
  },
  production: {
    API_URL: "https://api.anyjobs.com/api",
    API_HOST: null,
  },
};

const getEnvVars = () => {
  const isDev = __DEV__;
  return isDev ? ENV.development : ENV.production;
};

const envVars = getEnvVars();

export const config = {
  API_BASE_URL: envVars.API_URL,
  API_MOBILE_URL: `${envVars.API_URL}/v1/mobile`,
  API_PUBLIC_URL: `${envVars.API_URL}/v1`,
  API_HOST: envVars.API_HOST,
  APP_VERSION: Constants.expoConfig?.version ?? "1.0.0",
  APP_NAME: "AnyJobs",
  TOKEN_KEY: "anyjobs_auth_token",
  USER_KEY: "anyjobs_user",
} as const;
