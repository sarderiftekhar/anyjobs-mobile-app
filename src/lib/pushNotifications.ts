import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import apiClient from "../api/client";
import { storage } from "./storage";

const STORED_TOKEN_KEY = "anyjobs_push_token";

// Expo Go on Android dropped remote-push support in SDK 53+. Only a
// development build / standalone APK can get a real push token there.
// iOS Expo Go still works via the generic Expo project ID.
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    if (__DEV__) console.log("[push] skipped: not a physical device");
    return null;
  }

  if (isExpoGo && Platform.OS === "android") {
    if (__DEV__) {
      console.log(
        "[push] skipped: Expo Go on Android cannot get a push token in SDK 53+. Use a dev build (eas build --profile development).",
      );
    }
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    const { status: requested } = await Notifications.requestPermissionsAsync();
    status = requested;
  }
  if (status !== "granted") {
    if (__DEV__) console.log("[push] permission denied");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#0064EC",
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResponse.data;
  } catch (err) {
    if (__DEV__) console.warn("[push] getExpoPushTokenAsync failed", err);
    return null;
  }
}

export async function registerPushToken(): Promise<void> {
  const token = await getExpoPushToken();
  if (!token) return;

  try {
    await apiClient.post("/device/register-push-token", {
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
    });
    await storage.set(STORED_TOKEN_KEY, token);
  } catch (err) {
    if (__DEV__) console.warn("[push] registration API call failed", err);
  }
}

export async function unregisterPushToken(): Promise<void> {
  const token = await storage.get(STORED_TOKEN_KEY);
  if (!token) return;

  try {
    await apiClient.delete("/device/remove-push-token", { data: { token } });
  } catch {
    // ignore — server-side cleanup is best-effort
  } finally {
    await storage.remove(STORED_TOKEN_KEY);
  }
}
