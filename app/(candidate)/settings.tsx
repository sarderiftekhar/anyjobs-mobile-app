import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/authStore";
import { Card, Button } from "../../src/components/ui";
import { config } from "../../src/constants/config";
import { authApi } from "../../src/api/auth";
import { openExternalUrl, openSupportEmail } from "../../src/lib/openExternal";
import { DeleteAccountModal } from "../../src/components/account/DeleteAccountModal";

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-100 py-3.5"
      style={{ minHeight: 48 }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-1 flex-row items-center">
        <Ionicons name={icon} size={20} color="#6B7F94" />
        <View className="ml-3 flex-1">
          <Text className="text-base text-ink">{title}</Text>
          {subtitle ? (
            <Text className="text-xs text-ink-muted" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleChangePassword = () => {
    const email = user?.email;
    if (!email) {
      router.push("/(auth)/forgot-password");
      return;
    }
    Alert.alert(
      "Change Password",
      `We'll email a password reset link to ${email}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send link",
          onPress: async () => {
            try {
              await authApi.forgotPassword(email);
              Alert.alert(
                "Check your email",
                "We've sent you a link to reset your password.",
              );
            } catch {
              Alert.alert(
                "Couldn't send link",
                "Please try again in a moment.",
              );
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
        Account
      </Text>
      <Card className="mx-4">
        <SettingsRow
          icon="mail-outline"
          title="Email"
          subtitle={user?.email}
        />
        <SettingsRow
          icon="lock-closed-outline"
          title="Change Password"
          onPress={handleChangePassword}
        />
      </Card>

      <Text className="px-4 pb-2 pt-6 text-xs font-semibold uppercase text-ink-muted">
        Notifications
      </Text>
      <Card className="mx-4">
        <SettingsRow
          icon="notifications-outline"
          title="Notification Preferences"
          onPress={() => router.push("/(candidate)/settings/notifications")}
        />
      </Card>

      <Text className="px-4 pb-2 pt-6 text-xs font-semibold uppercase text-ink-muted">
        Privacy & Preferences
      </Text>
      <Card className="mx-4">
        <SettingsRow
          icon="shield-checkmark-outline"
          title="Privacy"
          onPress={() => router.push("/(candidate)/profile/edit/privacy")}
        />
        <SettingsRow
          icon="options-outline"
          title="Job Preferences"
          onPress={() => router.push("/(candidate)/profile/edit/preferences")}
        />
      </Card>

      <Text className="px-4 pb-2 pt-6 text-xs font-semibold uppercase text-ink-muted">
        Support & Legal
      </Text>
      <Card className="mx-4">
        <SettingsRow
          icon="help-circle-outline"
          title="Contact Support"
          onPress={() => openSupportEmail(config.SUPPORT_EMAIL, "ContinentJobs app help")}
        />
        <SettingsRow
          icon="chatbox-outline"
          title="Send Feedback"
          onPress={() =>
            openSupportEmail(config.SUPPORT_EMAIL, "ContinentJobs app feedback")
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
        onPress={() => setDeleteOpen(true)}
      >
        <Text className="text-sm font-semibold text-red-600">Delete Account</Text>
      </TouchableOpacity>

      <Text className="mt-4 text-center text-xs text-ink-muted">
        App Version {config.APP_VERSION}
      </Text>

      <DeleteAccountModal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        description="This permanently deletes your account, profile, applications and saved jobs. This cannot be undone."
      />
    </ScrollView>
  );
}
