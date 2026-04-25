import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../src/stores/authStore";
import { Card, LoadingSpinner } from "../../../src/components/ui";
import { adminStatsApi, adminMonitorApi } from "../../../src/api/admin";
import type { SystemStats } from "../../../src/types/admin";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const statsQuery = useQuery({
    queryKey: ["admin", "system-stats"],
    queryFn: async () => {
      const res = await adminStatsApi.get();
      return (res.data.data ?? {}) as Partial<SystemStats>;
    },
  });

  const onlineQuery = useQuery({
    queryKey: ["admin", "online-users-count"],
    queryFn: async () => {
      const res = await adminMonitorApi.onlineUsersCount();
      return res.data.data?.count ?? 0;
    },
    refetchInterval: 30_000,
  });

  const isLoading = statsQuery.isLoading || onlineQuery.isLoading;
  const stats = statsQuery.data;

  const metrics = [
    {
      label: "Total Users",
      value: stats?.users_total ?? 0,
      icon: "people-outline" as const,
      color: "#0064EC",
    },
    {
      label: "Online Now",
      value: onlineQuery.data ?? stats?.online_users ?? 0,
      icon: "pulse-outline" as const,
      color: "#22C55E",
    },
    {
      label: "Active Jobs",
      value: (stats as any)?.jobs_active ?? 0,
      icon: "briefcase-outline" as const,
      color: "#3B82F6",
    },
    {
      label: "New 24h",
      value: stats?.new_signups_24h ?? 0,
      icon: "trending-up-outline" as const,
      color: "#EAB308",
    },
  ];

  const refetchAll = () => {
    statsQuery.refetch();
    onlineQuery.refetch();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 32 }}
      refreshControl={
        <RefreshControl
          refreshing={statsQuery.isRefetching || onlineQuery.isRefetching}
          onRefresh={refetchAll}
          tintColor="#0064EC"
        />
      }
    >
      <View className="flex-row items-center justify-between px-4 pt-4">
        <View>
          <Text className="text-xl font-bold text-ink">
            Admin, {user?.first_name ?? "there"}
          </Text>
          <Text className="text-sm text-ink-muted">System overview</Text>
        </View>
        <Ionicons name="shield-checkmark-outline" size={24} color="#0064EC" />
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading stats..." />
      ) : (
        <View className="flex-row flex-wrap px-4 pt-4">
          {metrics.map((m) => (
            <View key={m.label} className="w-1/2 p-1.5">
              <Card className="items-center py-5">
                <View
                  className="mb-2 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: m.color + "20" }}
                >
                  <Ionicons name={m.icon} size={20} color={m.color} />
                </View>
                <Text className="text-2xl font-bold text-ink">{m.value}</Text>
                <Text className="text-xs text-ink-muted">{m.label}</Text>
              </Card>
            </View>
          ))}
        </View>
      )}

      {(statsQuery.error || onlineQuery.error) && (
        <View className="mx-4 mt-6">
          <Card>
            <Text className="text-sm text-ink-muted">
              Some stats could not be loaded. Pull down to retry.
            </Text>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}
