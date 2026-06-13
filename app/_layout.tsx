import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
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
 * loaded their stored consent flag. Gates AI features behind explicit consent
 * (App Store Guideline 5.1.2).
 */
function AiConsentGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const aiConsented = useConsentStore((s) => s.aiConsented);
  const acceptAiConsent = useConsentStore((s) => s.acceptAiConsent);

  const show = isAuthenticated && aiConsented === false;

  return <AiConsentModal visible={show} onAccept={acceptAiConsent} />;
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
