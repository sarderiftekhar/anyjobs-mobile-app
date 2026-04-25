import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/authStore";
import { Button } from "../../src/components/ui";
import { config } from "../../src/constants/config";

export default function EmployerSettingsScreen() {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">Settings</Text>
      </View>

      <View className="mx-4 mt-8">
        <Button title="Sign Out" variant="danger" onPress={logout} />
      </View>

      <Text className="mt-4 text-center text-xs text-ink-muted">
        App Version {config.APP_VERSION}
      </Text>
    </ScrollView>
  );
}
