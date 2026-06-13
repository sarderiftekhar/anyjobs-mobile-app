import * as WebBrowser from "expo-web-browser";
import { Linking, Alert } from "react-native";

/**
 * Open a URL in an in-app browser (SFSafariViewController / Custom Tab).
 * Falls back to the system browser, and surfaces a friendly error if neither
 * is available rather than throwing.
 */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Couldn't open link", "Please try again later.");
    }
  }
}

/** Open the user's mail composer to a support address. */
export async function openSupportEmail(
  email: string,
  subject = "AnyJobs support",
): Promise<void> {
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error("no mail client");
    await Linking.openURL(url);
  } catch {
    Alert.alert("No mail app found", `You can reach us at ${email}.`);
  }
}
