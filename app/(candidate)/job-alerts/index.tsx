import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import { ScreenHeader, ToggleRow } from "../../../src/components/form";
import { useJobAlerts, useToggleJobAlert, useDeleteJobAlert } from "../../../src/hooks/useJobAlerts";
import type { JobAlert } from "../../../src/types/profileExtras";

const labelize = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function summary(a: JobAlert): string {
  const parts: string[] = [];
  if (a.keywords) parts.push(a.keywords);
  if (a.location) parts.push(a.location);
  if (a.job_types?.length) parts.push(a.job_types.map(labelize).join(", "));
  return parts.join(" · ") || "All matching jobs";
}

export default function JobAlertsScreen() {
  const insets = useSafeAreaInsets();
  const { data: alerts, isLoading } = useJobAlerts();
  const toggle = useToggleJobAlert();
  const remove = useDeleteJobAlert();

  const confirmDelete = (a: JobAlert) =>
    Alert.alert("Delete alert", `Delete "${a.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(a.id) },
    ]);

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Job Alerts"
          right={
            <TouchableOpacity onPress={() => router.push("/(candidate)/job-alerts/new")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="add-circle" size={26} color="#0064EC" />
            </TouchableOpacity>
          }
        />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading alerts..." />
      ) : !alerts || alerts.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          satellites={["search-outline", "briefcase-outline"]}
          title="No job alerts yet"
          description="Create an alert and we'll notify you when matching jobs are posted."
          actionTitle="Create alert"
          onAction={() => router.push("/(candidate)/job-alerts/new")}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          {alerts.map((a) => (
            <Card key={a.id} className="mb-3" animated={false}>
              <TouchableOpacity onPress={() => router.push(`/(candidate)/job-alerts/${a.id}`)}>
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-base font-semibold text-ink" numberOfLines={1}>{a.name}</Text>
                  <Badge text={labelize(a.frequency)} variant="info" />
                </View>
                <Text className="mt-1 text-sm text-ink-muted" numberOfLines={2}>{summary(a)}</Text>
              </TouchableOpacity>
              <View className="mt-2 border-t border-gray-100 pt-1">
                <ToggleRow label="Active" value={a.is_active} onValueChange={() => toggle.mutate(a.id)} />
              </View>
              <View className="mt-1 flex-row">
                <TouchableOpacity className="mr-5 flex-row items-center" onPress={() => router.push(`/(candidate)/job-alerts/${a.id}`)}>
                  <Ionicons name="create-outline" size={16} color="#3A4F64" />
                  <Text className="ml-1 text-sm text-ink-soft">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center" onPress={() => confirmDelete(a)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text className="ml-1 text-sm text-danger">Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
