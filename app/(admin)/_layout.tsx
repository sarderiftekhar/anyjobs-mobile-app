import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";

export default function AdminLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
    } else if (user?.user_type !== "admin") {
      // Non-admin somehow landed here — route them out.
      if (user?.user_type === "employer") {
        router.replace("/(employer)/(tabs)");
      } else {
        router.replace("/(candidate)/(tabs)");
      }
    }
  }, [user, isAuthenticated, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="users/[id]" options={{ headerShown: true, title: "User" }} />
      <Stack.Screen name="users/create" options={{ headerShown: true, title: "Create User" }} />
      <Stack.Screen name="tickets/[id]" options={{ headerShown: true, title: "Ticket" }} />
      <Stack.Screen name="progress" options={{ headerShown: true, title: "Progress" }} />
    </Stack>
  );
}
