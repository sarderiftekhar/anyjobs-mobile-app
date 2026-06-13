import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/authStore";
import { Card, Button } from "../../src/components/ui";
import { config } from "../../src/constants/config";
import { openExternalUrl, openSupportEmail } from "../../src/lib/openExternal";

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
      style={{ minHeight: 48 }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color="#6B7F94" />
        <Text className="ml-3 text-base text-ink">{title}</Text>
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
  );
}

export default function EmployerSettingsScreen() {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your account, company profile and job postings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
            } catch (err: any) {
              Alert.alert(
                "Couldn't delete account",
                err?.message ?? "Please try again later.",
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">Settings</Text>
      </View>

      <Text className="px-4 pb-2 pt-4 text-xs font-semibold uppercase text-ink-muted">
        Support & Legal
      </Text>
      <Card className="mx-4">
        <SettingsRow
          icon="help-circle-outline"
          title="Help Center"
          onPress={() => openExternalUrl(config.HELP_URL)}
        />
        <SettingsRow
          icon="chatbox-outline"
          title="Send Feedback"
          onPress={() =>
            openSupportEmail(config.SUPPORT_EMAIL, "AnyJobs app feedback")
          }
        />
        <SettingsRow
          icon="document-text-outline"
          title="Terms of Service"
          onPress={() => openExternalUrl(config.TERMS_URL)}
        />
        <SettingsRow
          icon="shield-outline"
          title="Privacy Policy"
          onPress={() => openExternalUrl(config.PRIVACY_POLICY_URL)}
        />
      </Card>

      <View className="mx-4 mt-8">
        <Button title="Sign Out" variant="danger" onPress={logout} />
      </View>

      <TouchableOpacity
        className="mt-4 items-center py-2"
        style={{ minHeight: 44 }}
        onPress={confirmDelete}
        disabled={deleting}
      >
        <Text className="text-sm font-semibold text-red-600">
          {deleting ? "Deleting…" : "Delete Account"}
        </Text>
      </TouchableOpacity>

      <Text className="mt-4 text-center text-xs text-ink-muted">
        App Version {config.APP_VERSION}
      </Text>
    </ScrollView>
  );
}
