import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";

export default function EmployerLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Role guard — a candidate/admin deep-linked here would otherwise see
  // employer UI (API calls still fail server-side, but the shell renders).
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
    } else if (user?.user_type === "admin") {
      router.replace("/(admin)/(tabs)");
    } else if (user?.user_type !== "employer") {
      router.replace("/(candidate)/(tabs)");
    }
  }, [user?.user_type, isAuthenticated, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/create" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="applicant/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="chat/[conversationId]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
