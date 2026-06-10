import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card } from "../../../src/components/ui";
import { ScreenHeader, ToggleRow } from "../../../src/components/form";
import { useAuthStore } from "../../../src/stores/authStore";
import { useUpdateNotificationPreferences } from "../../../src/hooks/useProfile";

const CATEGORIES: { key: string; label: string; description: string }[] = [
  { key: "job_matches", label: "New job matches", description: "Jobs that fit your profile" },
  { key: "application_updates", label: "Application updates", description: "Status changes on your applications" },
  { key: "messages", label: "Messages", description: "New messages from employers" },
  { key: "interview_reminders", label: "Interview reminders", description: "Upcoming interview alerts" },
  { key: "marketing", label: "Tips & news", description: "Product news and career tips" },
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.user?.profile);
  const mutation = useUpdateNotificationPreferences();

  const [email, setEmail] = useState(profile?.email_notifications ?? true);
  const [sms, setSms] = useState(profile?.sms_notifications ?? false);
  const [prefs, setPrefs] = useState<string[]>(profile?.notification_preferences ?? []);

  const toggleCategory = (key: string) =>
    setPrefs((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));

  const onSave = async () => {
    try {
      await mutation.mutateAsync({
        email_notifications: email,
        sms_notifications: sms,
        notification_preferences: prefs,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.response?.data?.message ?? "Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Notifications" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}>
        <Text className="mb-2 text-xs font-semibold uppercase text-ink-muted">Channels</Text>
        <Card className="mb-4" animated={false}>
          <ToggleRow label="Email notifications" value={email} onValueChange={setEmail} />
          <ToggleRow label="SMS notifications" value={sms} onValueChange={setSms} />
        </Card>

        <Text className="mb-2 text-xs font-semibold uppercase text-ink-muted">What to notify me about</Text>
        <Card animated={false}>
          {CATEGORIES.map((c) => (
            <ToggleRow
              key={c.key}
              label={c.label}
              description={c.description}
              value={prefs.includes(c.key)}
              onValueChange={() => toggleCategory(c.key)}
            />
          ))}
        </Card>
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button title="Save" loading={mutation.isPending} onPress={onSave} />
      </View>
    </View>
  );
}
