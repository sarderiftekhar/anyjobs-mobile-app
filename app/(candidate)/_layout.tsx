import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";

export default function CandidateLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Role guard — mirror of the employer/admin layouts.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
    } else if (user?.user_type === "employer") {
      router.replace("/(employer)/(tabs)");
    } else if (user?.user_type === "admin") {
      router.replace("/(admin)/(tabs)");
    }
  }, [user?.user_type, isAuthenticated, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 250,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
      <Stack.Screen name="job/[id]" />
      <Stack.Screen
        name="apply/[jobId]"
        options={{ animation: "slide_from_bottom", presentation: "modal" }}
      />
      <Stack.Screen name="chat/[conversationId]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen
        name="onboarding"
        options={{ animation: "fade", gestureEnabled: false }}
      />
      <Stack.Screen
        name="cover-letter-ai"
        options={{ animation: "slide_from_bottom", presentation: "modal" }}
      />
    </Stack>
  );
}
