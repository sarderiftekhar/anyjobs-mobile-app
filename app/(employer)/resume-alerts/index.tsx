import { View, Text, FlatList, TouchableOpacity, Alert, Switch, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeAlertsApi } from "../../../src/api/resumeAlerts";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingSpinner,
} from "../../../src/components/ui";
import type { ResumeAlert } from "../../../src/types/resumeAlert";

export default function ResumeAlertsScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["resume-alerts"],
    queryFn: () => resumeAlertsApi.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: (alert: ResumeAlert) => resumeAlertsApi.toggle(alert.id, alert),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume-alerts"] }),
    onError: () => Alert.alert("Error", "Could not update alert."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resumeAlertsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume-alerts"] }),
    onError: () => Alert.alert("Error", "Could not delete alert."),
  });

  const confirmDelete = (alert: ResumeAlert) => {
    Alert.alert(
      "Delete alert?",
      `This will permanently remove "${alert.alert_name}".`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(alert.id),
        },
      ]
    );
  };

  const alerts = data ?? [];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border bg-white px-4 py-3">
        <TouchableOpacity
          className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-background"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#1A2230" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-ink">
          Resume Alerts
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(employer)/resume-alerts/create")}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary"
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading alerts..." />
      ) : isError ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load alerts"
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : alerts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <EmptyState
            icon="notifications-off-outline"
            title="No resume alerts yet"
            description="Set up alerts to get notified when candidates matching your criteria become available."
            actionTitle="Create Alert"
            onAction={() => router.push("/(employer)/resume-alerts/create")}
          />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(a) => a.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#0064EC"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="mb-3"
              onPress={() =>
                router.push(`/(employer)/resume-alerts/${item.id}`)
              }
            >
              <Card>
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-ink">
                      {item.alert_name}
                    </Text>
                    {item.job_title ? (
                      <Text className="text-sm text-ink-muted">
                        {item.job_title}
                      </Text>
                    ) : null}
                    <View className="mt-2 flex-row flex-wrap gap-1.5">
                      <Badge
                        text={frequencyLabel(item.email_frequency)}
                        variant="info"
                      />
                      {item.location ? (
                        <Badge text={item.location} variant="gray" />
                      ) : null}
                      {item.experience_level ? (
                        <Badge
                          text={item.experience_level}
                          variant="gray"
                        />
                      ) : null}
                    </View>
                  </View>
                  <Switch
                    value={item.is_active}
                    onValueChange={() => toggleMutation.mutate(item)}
                    trackColor={{ false: "#E5E7EB", true: "#0064EC" }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() =>
                      router.push(
                        `/(employer)/resume-alerts/matches/${item.id}`
                      )
                    }
                  >
                    <Ionicons name="people-outline" size={14} color="#0064EC" />
                    <Text className="ml-1 text-xs font-semibold text-primary">
                      {item.matches_count ?? 0} matches
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/(employer)/resume-alerts/${item.id}`)
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#0064EC"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(item)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <Button
              title="Create New Alert"
              variant="outline"
              className="mt-2"
              icon={<Ionicons name="add" size={16} color="#0064EC" />}
              onPress={() => router.push("/(employer)/resume-alerts/create")}
            />
          }
        />
      )}
    </View>
  );
}

function frequencyLabel(f: string) {
  switch (f) {
    case "instant":
      return "Instant";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    default:
      return f;
  }
}
