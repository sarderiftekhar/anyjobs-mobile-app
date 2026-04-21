import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet } from "react-native";
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
  // Scale lives on a NATIVE-driven node.
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  // Background opacity lives on a SEPARATE JS-driven node so the two drivers
  // never share an animated node (prevents RN's "JS driven animation on node
  // moved to native" error).
  const bgOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1 : 0.85,
      useNativeDriver: true,
      speed: 16,
      bounciness: focused ? 12 : 4,
    }).start();

    Animated.timing(bgOpacity, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={[ts.iconWrap, { transform: [{ scale: scaleAnim }] }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[ts.iconBg, { opacity: bgOpacity }]}
      />
      <Ionicons name={name} size={21} color={color} />
    </Animated.View>
  );
}

export default function CandidateTabLayout() {
  const insets = useSafeAreaInsets();
  // Lift the tab bar above the Android gesture/nav bar. Add a small Android
  // floor because on some devices useSafeAreaInsets returns 0 for the bottom
  // even when system nav is present.
  const bottomInset = insets.bottom + (Platform.OS === "android" ? 12 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1E3A8A",
        tabBarInactiveTintColor: "#B8B8B8",
        tabBarStyle: [
          ts.tabBar,
          {
            height: 72 + bottomInset,
            paddingBottom: 8 + bottomInset,
          },
        ],
        tabBarLabelStyle: ts.tabLabel,
        tabBarItemStyle: ts.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "briefcase" : "briefcase-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: "Applied",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "document-text" : "document-text-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "heart" : "heart-outline"} color={color} focused={focused} />
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
            <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const ts = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tabItem: {
    paddingTop: 4,
  },
  iconWrap: {
    width: 42,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: "#E0E7FF",
  },
});
