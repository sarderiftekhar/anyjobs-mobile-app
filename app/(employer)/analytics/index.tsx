import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { analyticsApi } from "../../../src/api/analytics";
import { Card, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import type { DashboardAnalytics, TimeSeriesPoint } from "../../../src/types/analytics";

type Range = "7d" | "30d" | "90d";

function StatTile({
  icon,
  label,
  value,
  suffix,
  changePct,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  suffix?: string;
  changePct?: number;
  color: string;
}) {
  const up = (changePct ?? 0) >= 0;
  return (
    <Card className="flex-1" variant="default">
      <View className="flex-row items-center justify-between">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: color + "1A" }}
        >
          <Ionicons name={icon} size={16} color={color} />
        </View>
        {changePct !== undefined && (
          <View className="flex-row items-center">
            <Ionicons
              name={up ? "arrow-up" : "arrow-down"}
              size={12}
              color={up ? "#16A34A" : "#DC2626"}
            />
            <Text className={`ml-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-danger"}`}>
              {Math.abs(changePct).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text className="mt-3 text-2xl font-bold text-ink">
        {value}
        {suffix}
      </Text>
      <Text className="text-xs text-ink-muted">{label}</Text>
    </Card>
  );
}

function BarChart({ data, color = "#0064EC" }: { data: TimeSeriesPoint[]; color?: string }) {
  if (!data || data.length === 0) {
    return (
      <View className="h-32 items-center justify-center">
        <Text className="text-xs text-ink-muted">No data for this range</Text>
      </View>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View className="mt-2">
      <View className="h-32 flex-row items-end gap-1">
        {data.map((p, i) => {
          const h = Math.max(4, (p.value / max) * 120);
          return (
            <View key={p.date + i} className="flex-1 items-center">
              <View
                style={{ height: h, backgroundColor: color, width: "100%", borderRadius: 3, opacity: 0.8 }}
              />
            </View>
          );
        })}
      </View>
      <View className="mt-1 flex-row justify-between">
        <Text className="text-[10px] text-ink-muted">
          {data[0] ? new Date(data[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
        </Text>
        <Text className="text-[10px] text-ink-muted">
          {data[data.length - 1]
            ? new Date(data[data.length - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : ""}
        </Text>
      </View>
    </View>
  );
}

export default function AnalyticsDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<Range>("30d");

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["employer", "analytics", "dashboard", range],
    queryFn: () => analyticsApi.getDashboard({ range }).then((r) => r.data.data!),
    retry: false,
  });

  const notAvailable = !!error && !data;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">Analytics</Text>
      </View>

      {/* Range tabs */}
      <View className="flex-row gap-2 px-4 py-3">
        {(["7d", "30d", "90d"] as Range[]).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            className={`rounded-full px-4 py-1.5 ${
              range === r ? "bg-primary" : "bg-white border border-border"
            }`}
          >
            <Text className={`text-xs font-medium ${range === r ? "text-white" : "text-ink-muted"}`}>
              Last {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading analytics..." />
      ) : notAvailable ? (
        <EmptyState
          icon="analytics-outline"
          title="Analytics Unavailable"
          description="We couldn't load your analytics. Please check back soon."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#0064EC" />
          }
        >
          <DashboardBody data={data!} />
        </ScrollView>
      )}
    </View>
  );
}

function DashboardBody({ data }: { data: DashboardAnalytics }) {
  const { overview, applications_over_time, views_over_time, top_jobs } = data;

  return (
    <>
      {/* Overview tiles */}
      <View className="flex-row gap-3">
        <StatTile
          icon="eye-outline"
          label="Total Views"
          value={overview.total_views.toLocaleString()}
          changePct={overview.views_change_pct}
          color="#0064EC"
        />
        <StatTile
          icon="document-text-outline"
          label="Applications"
          value={overview.total_applications.toLocaleString()}
          changePct={overview.applications_change_pct}
          color="#059669"
        />
      </View>
      <View className="mt-3 flex-row gap-3">
        <StatTile
          icon="trending-up-outline"
          label="Conversion"
          value={overview.conversion_rate.toFixed(1)}
          suffix="%"
          color="#D97706"
        />
        <StatTile
          icon="briefcase-outline"
          label="Active Jobs"
          value={overview.active_jobs}
          color="#7C3AED"
        />
      </View>

      {/* Applications chart */}
      <Card className="mt-4">
        <Text className="text-sm font-semibold text-ink">Applications Over Time</Text>
        <BarChart data={applications_over_time} color="#059669" />
      </Card>

      {/* Views chart */}
      <Card className="mt-4">
        <Text className="text-sm font-semibold text-ink">Job Views Over Time</Text>
        <BarChart data={views_over_time} color="#0064EC" />
      </Card>

      {/* Top jobs */}
      <Card className="mt-4">
        <Text className="text-sm font-semibold text-ink">Top Performing Jobs</Text>
        {top_jobs.length === 0 ? (
          <Text className="mt-2 text-xs text-ink-muted">No job data yet.</Text>
        ) : (
          <View className="mt-2">
            {top_jobs.slice(0, 5).map((job) => (
              <TouchableOpacity
                key={job.id}
                className="flex-row items-center justify-between border-b border-border py-3 last:border-b-0"
                onPress={() => router.push(`/(employer)/analytics/job/${job.id}`)}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-medium text-ink" numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-muted">
                    {job.views} views · {job.applications} applications
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-bold text-primary">
                    {job.conversion_rate.toFixed(1)}%
                  </Text>
                  <Text className="text-[10px] text-ink-muted">conv.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    </>
  );
}
