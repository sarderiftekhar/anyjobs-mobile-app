import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/authStore";
import { Card, Button } from "../../src/components/ui";
import { config } from "../../src/constants/config";

function SettingsRow({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-100 py-3.5"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color="#6B7280" />
        <Text className="ml-3 text-base text-text-primary">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
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
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-text-primary">Settings</Text>
      </View>

      <Text className="px-4 pb-2 pt-4 text-xs font-semibold uppercase text-text-secondary">
        Account
      </Text>
      <Card className="mx-4">
        <SettingsRow icon="mail-outline" title="Email" />
        <SettingsRow icon="lock-closed-outline" title="Change Password" />
        <SettingsRow icon="call-outline" title="Phone Number" />
      </Card>

      <Text className="px-4 pb-2 pt-6 text-xs font-semibold uppercase text-text-secondary">
        Notifications
      </Text>
      <Card className="mx-4">
        <SettingsRow icon="notifications-outline" title="Push Notifications" />
        <SettingsRow icon="mail-outline" title="Email Alerts" />
      </Card>

      <Text className="px-4 pb-2 pt-6 text-xs font-semibold uppercase text-text-secondary">
        Support
      </Text>
      <Card className="mx-4">
        <SettingsRow icon="help-circle-outline" title="Help Center" />
        <SettingsRow icon="chatbox-outline" title="Send Feedback" />
        <SettingsRow icon="document-text-outline" title="Terms of Service" />
        <SettingsRow icon="shield-outline" title="Privacy Policy" />
      </Card>

      <View className="mx-4 mt-8">
        <Button title="Sign Out" variant="danger" onPress={logout} />
      </View>

      <Text className="mt-4 text-center text-xs text-text-secondary">
        App Version {config.APP_VERSION}
      </Text>
    </ScrollView>
  );
}
