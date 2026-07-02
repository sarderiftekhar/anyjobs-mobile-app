import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { Slot, router, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/stores/authStore";
import { useConsentStore } from "../src/stores/consentStore";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { AiConsentModal } from "../src/components/ai/AiConsentModal";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function AuthRedirect() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const seg = segments as string[];
    const inAuthGroup = seg[0] === "(auth)";
    const inPublicGroup = seg[0] === "(public)";
    const inOnboarding = seg[0] === "(candidate)" && seg[1] === "onboarding";
    const isCandidate = user?.user_type !== "employer";
    const needsOnboarding = isCandidate && !!user?.needs_onboarding;

    if (!isAuthenticated && !inAuthGroup && !inPublicGroup) {
      // Not logged in and not on auth/public screen -> go to welcome
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in but on auth screen -> go to appropriate destination
      if (user?.user_type === "employer") {
        router.replace("/(employer)/(tabs)");
      } else if (needsOnboarding) {
        router.replace("/(candidate)/onboarding");
      } else {
        router.replace("/(candidate)/(tabs)");
      }
    } else if (isAuthenticated && needsOnboarding && !inOnboarding && !inAuthGroup && !inPublicGroup) {
      // First-time candidate anywhere in the app -> finish onboarding first
      router.replace("/(candidate)/onboarding");
    }
  }, [isAuthenticated, isLoading, segments, user?.needs_onboarding, user?.user_type]);

  return <Slot />;
}

/**
 * Shows the one-time AI consent sheet once the user is authenticated and we've
 * loaded their stored consent flag (App Store Guideline 5.1.2). Declining
 * dismisses it for the session — individual AI screens re-prompt via
 * AiConsentGuard, so consent is asked again right before any AI use.
 */
function AiConsentGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const aiConsented = useConsentStore((s) => s.aiConsented);
  const acceptAiConsent = useConsentStore((s) => s.acceptAiConsent);
  const [dismissed, setDismissed] = useState(false);

  const show = isAuthenticated && aiConsented === false && !dismissed;

  return (
    <AiConsentModal
      visible={show}
      onAccept={acceptAiConsent}
      onDecline={() => setDismissed(true)}
    />
  );
}

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const loadConsent = useConsentStore((s) => s.loadConsent);

  const [fontsLoaded] = useFonts({
    "Satoshi-Variable": require("../assets/fonts/Satoshi-Variable.ttf"),
  });

  useEffect(() => {
    loadStoredAuth();
    loadConsent();
  }, []);

  // React Native has no "window focus" — wire AppState into React Query's
  // focusManager so polling (chat, unread counts) pauses while the app is
  // backgrounded and data refetches when it returns to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => sub.remove();
  }, []);

  // Navigate when the user taps a push notification (warm and cold start).
  useEffect(() => {
    const navigate = (response: Notifications.NotificationResponse) => {
      const { isAuthenticated, user } = useAuthStore.getState();
      // Cold-start taps can land before stored auth loads; skip rather than
      // bounce through the welcome screen.
      if (!isAuthenticated || user?.user_type === "admin") return;
      const data = (response.notification.request.content.data ?? {}) as Record<
        string,
        unknown
      >;
      const base =
        user?.user_type === "employer" ? "/(employer)" : "/(candidate)";
      if (data.conversation_id) {
        router.push(`${base}/chat/${data.conversation_id}` as never);
      } else {
        router.push(`${base}/notifications` as never);
      }
    };

    const sub = Notifications.addNotificationResponseReceivedListener(navigate);
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) navigate(response);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthRedirect />
            <AiConsentGate />
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
