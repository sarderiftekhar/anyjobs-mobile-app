import { Platform, View } from "react-native";
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
  return (
    <View
      className={`items-center justify-center rounded-xl px-4 py-1.5 ${
        focused ? "bg-primary/10" : ""
      }`}
    >
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function EmployerTabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom + (Platform.OS === "android" ? 12 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1E3A8A",
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
