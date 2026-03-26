import { Stack } from "expo-router";

export default function CandidateLayout() {
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
    </Stack>
  );
}
