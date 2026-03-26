import { Stack } from "expo-router";

export default function EmployerLayout() {
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
