import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "../../src/components/ui";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-text-primary">Notifications</Text>
        <TouchableOpacity>
          <Text className="text-sm font-medium text-primary">Mark All</Text>
        </TouchableOpacity>
      </View>
      <EmptyState
        icon="notifications-outline"
        title="No Notifications"
        description="You're all caught up! Notifications will appear here."
      />
    </View>
  );
}
