import { Platform } from "react-native";

// Google Sign-In wrapper around @react-native-google-signin/google-signin.
//
// The native module only exists in dev/EAS builds — in Expo Go the require
// throws, so the module is loaded defensively and callers hide the Google
// button when `isGoogleSignInAvailable` is false.
//
// The returned ID token is minted for GOOGLE_WEB_CLIENT_ID (the same web
// OAuth client the backend verifies `aud` against in
// Mobile\AuthController::google), so no extra backend config is needed.
//
// Platform setup (Google Cloud console, same project as the web client):
// - Android: create an "Android" OAuth client with package com.anyjobs.mobile
//   and the EAS build signing SHA-1. No app config needed beyond that.
// - iOS: create an "iOS" OAuth client, then set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
//   and add the plugin to app.json:
//     ["@react-native-google-signin/google-signin",
//      { "iosUrlScheme": "com.googleusercontent.apps.<ios-client-id-prefix>" }]
//   Until then the Google button is hidden on iOS (see availability check).

// Web OAuth client ID (public identifier, not a secret). Matches
// GOOGLE_CLIENT_ID in the backend .env; override per build profile via env.
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  "441305853801-1ksa9cb7vo534667msudeg5m8c7950op.apps.googleusercontent.com";

// iOS OAuth client ID — required on iOS. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
// (and the matching iosUrlScheme plugin entry in app.json) once the iOS
// client exists in the Google Cloud console.
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let GoogleSignin: any = null;
let statusCodes: Record<string, string> = {};
try {
  const mod = require("@react-native-google-signin/google-signin");
  GoogleSignin = mod.GoogleSignin;
  statusCodes = mod.statusCodes ?? {};
} catch {
  // Native module unavailable (Expo Go / web) — feature stays hidden.
}

// On iOS the flow can't complete without an iOS OAuth client + URL scheme,
// so the feature stays hidden there until EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
// is provided. Android only needs the web client ID at runtime.
export const isGoogleSignInAvailable =
  !!GoogleSignin &&
  !!GOOGLE_WEB_CLIENT_ID &&
  (Platform.OS !== "ios" || !!GOOGLE_IOS_CLIENT_ID);

let configured = false;
function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
  });
  configured = true;
}

/**
 * Runs the native Google sign-in flow and returns the Google ID token, or
 * null if the user cancelled. Throws with a user-presentable message on
 * real failures (no Play Services, network, misconfiguration).
 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!isGoogleSignInAvailable) {
    throw new Error("Google sign-in isn't available in this build.");
  }
  ensureConfigured();

  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    const response = await GoogleSignin.signIn();

    // v13+ returns { type: 'success' | 'cancelled', data }.
    if (response?.type === "cancelled") return null;
    const idToken: string | null =
      response?.data?.idToken ?? response?.idToken ?? null;

    if (!idToken) {
      throw new Error("Google didn't return a sign-in token. Please try again.");
    }
    return idToken;
  } catch (err: any) {
    if (
      err?.code === statusCodes.SIGN_IN_CANCELLED ||
      err?.code === statusCodes.IN_PROGRESS
    ) {
      return null;
    }
    if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error(
        "Google Play Services is required for Google sign-in on this device.",
      );
    }
    throw new Error(
      err?.message || "Google sign-in failed. Please try again.",
    );
  }
}

/** Sign out of the Google session so account choice is offered next time. */
export async function signOutOfGoogle(): Promise<void> {
  if (!isGoogleSignInAvailable) return;
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Best-effort — local Google session state only.
  }
}
