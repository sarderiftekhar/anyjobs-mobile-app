import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import apiClient from "../api/client";
import { storage } from "./storage";

const STORED_TOKEN_KEY = "anyjobs_push_token";

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
      lightColor: "#1E3A8A",
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
