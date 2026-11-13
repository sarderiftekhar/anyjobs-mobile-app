import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  // Focus springs the icon up and fades the tint pill in (UI thread).
  const progress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, {
      damping: focused ? 11 : 18,
      stiffness: 240,
      mass: 0.7,
      reduceMotion: ReduceMotion.System,
    });
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, progress.value)),
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + 0.1 * progress.value }],
  }));

  return (
    <View className="items-center justify-center rounded-xl px-4 py-1.5">
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, ts.pill, pillStyle]} />
      <Animated.View style={iconStyle}>
        <Ionicons name={name} size={22} color={color} />
      </Animated.View>
    </View>
  );
}

const ts = StyleSheet.create({
  // Matches the previous "rounded-xl bg-primary/10" focus pill.
  pill: {
    borderRadius: 16,
    backgroundColor: "rgba(0, 100, 236, 0.1)",
  },
});

export default function EmployerTabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + (Platform.OS === "android" ? 12 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0064EC",
        tabBarInactiveTintColor: "#B0B0B0",
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          height: 65 + bottomInset,
          paddingBottom: 10 + bottomInset,
          paddingTop: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "grid" : "grid-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "briefcase" : "briefcase-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="applicants"
        options={{
          title: "Applicants",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "people" : "people-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "chatbubble" : "chatbubble-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "business" : "business-outline"} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
