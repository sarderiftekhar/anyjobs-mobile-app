import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { analyticsApi } from "../../../../src/api/analytics";
import { Badge, Card, EmptyState, LoadingSpinner } from "../../../../src/components/ui";
import type { JobAnalytics, TimeSeriesPoint } from "../../../../src/types/analytics";

type Range = "7d" | "30d" | "90d";

const FUNNEL_COLOR: Record<string, string> = {
  viewed: "#1E3A8A",
  applied: "#059669",
  shortlisted: "#D97706",
  interviewed: "#7C3AED",
  hired: "#16A34A",
  rejected: "#DC2626",
};

function BarChart({ data, color = "#1E3A8A" }: { data: TimeSeriesPoint[]; color?: string }) {
  if (!data || data.length === 0) {
    return (
      <View className="h-28 items-center justify-center">
        <Text className="text-xs text-text-secondary">No data for this range</Text>
      </View>
    );
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View className="mt-2 h-28 flex-row items-end gap-1">
      {data.map((p, i) => {
        const h = Math.max(4, (p.value / max) * 108);
        return (
          <View key={p.date + i} className="flex-1 items-center">
            <View
              style={{
                height: h,
                backgroundColor: color,
                width: "100%",
                borderRadius: 3,
                opacity: 0.8,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default function JobAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = parseInt(id!, 10);
  const [range, setRange] = useState<Range>("30d");

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["employer", "analytics", "job", jobId, range],
    queryFn: () => analyticsApi.getJobAnalytics(jobId, { range }).then((r) => r.data.data!),
    enabled: !!jobId,
    retry: false,
  });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-text-primary">Job Analytics</Text>
      </View>

      <View className="flex-row gap-2 px-4 py-3">
        {(["7d", "30d", "90d"] as Range[]).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            className={`rounded-full px-4 py-1.5 ${
              range === r ? "bg-primary" : "bg-white border border-border"
            }`}
          >
            <Text className={`text-xs font-medium ${range === r ? "text-white" : "text-text-secondary"}`}>
              Last {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading analytics..." />
      ) : !data || error ? (
        <EmptyState
          icon="analytics-outline"
          title="No analytics yet"
          description="This job doesn't have analytics data available."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#1E3A8A" />
          }
        >
          <JobBody data={data} />
        </ScrollView>
      )}
    </View>
  );
}

function JobBody({ data }: { data: JobAnalytics }) {
  return (
    <>
      {/* Title */}
      <Card className="mb-4">
        <Text className="text-base font-semibold text-text-primary">{data.job_title}</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Badge text={data.status} variant="info" />
          <Text className="text-xs text-text-secondary">
            Posted {new Date(data.posted_at).toLocaleDateString()}
          </Text>
        </View>
      </Card>

      {/* Stats grid */}
      <View className="mb-2 flex-row flex-wrap gap-3">
        <StatBox label="Views" value={data.views} color="#1E3A8A" />
        <StatBox label="Applications" value={data.applications} color="#059669" />
        <StatBox label="Shortlisted" value={data.shortlisted} color="#D97706" />
        <StatBox label="Rejected" value={data.rejected} color="#DC2626" />
      </View>
      <Card className="mb-4">
        <Text className="text-xs text-text-secondary">Conversion Rate</Text>
        <Text className="mt-1 text-3xl font-bold text-primary">
          {data.conversion_rate.toFixed(1)}%
        </Text>
        <Text className="text-[11px] text-text-secondary">
          {data.applications} applications from {data.views} views
        </Text>
      </Card>

      {/* Applications chart */}
      <Card className="mb-4">
        <Text className="text-sm font-semibold text-text-primary">Applications Over Time</Text>
        <BarChart data={data.applications_over_time} color="#059669" />
      </Card>

      {/* Views chart */}
      <Card className="mb-4">
        <Text className="text-sm font-semibold text-text-primary">Views Over Time</Text>
        <BarChart data={data.views_over_time} color="#1E3A8A" />
      </Card>

      {/* Sources */}
      <Card className="mb-4">
        <Text className="text-sm font-semibold text-text-primary">Applicant Sources</Text>
        {data.sources.length === 0 ? (
          <Text className="mt-2 text-xs text-text-secondary">No source data yet.</Text>
        ) : (
          <View className="mt-3">
            {data.sources.map((s) => (
              <View key={s.source} className="mb-2">
                <View className="mb-1 flex-row justify-between">
                  <Text className="text-xs font-medium capitalize text-text-primary">
                    {s.source.replace(/_/g, " ")}
                  </Text>
                  <Text className="text-xs text-text-secondary">
                    {s.count} ({s.percentage.toFixed(0)}%)
                  </Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <View
                    style={{
                      width: `${Math.min(100, s.percentage)}%`,
                      height: "100%",
                      backgroundColor: "#1E3A8A",
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Funnel */}
      <Card>
        <Text className="text-sm font-semibold text-text-primary">Hiring Funnel</Text>
        {data.funnel.length === 0 ? (
          <Text className="mt-2 text-xs text-text-secondary">No funnel data yet.</Text>
        ) : (
          <View className="mt-3">
            {data.funnel.map((stage) => {
              const max = Math.max(...data.funnel.map((f) => f.count), 1);
              const pct = (stage.count / max) * 100;
              return (
                <View key={stage.stage} className="mb-2">
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-xs font-medium capitalize text-text-primary">
                      {stage.stage}
                    </Text>
                    <Text className="text-xs text-text-secondary">{stage.count}</Text>
                  </View>
                  <View className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <View
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: FUNNEL_COLOR[stage.stage] ?? "#6B7280",
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="flex-1 min-w-[45%]">
      <Card>
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: color + "1A" }}
        >
          <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: color }} />
        </View>
        <Text className="mt-2 text-xl font-bold text-text-primary">{value.toLocaleString()}</Text>
        <Text className="text-[11px] text-text-secondary">{label}</Text>
      </Card>
    </View>
  );
}
