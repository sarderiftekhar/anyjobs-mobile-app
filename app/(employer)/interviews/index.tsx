import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card, Badge, LoadingSpinner, EmptyState } from "../../../src/components/ui";
import { useInterviews } from "../../../src/hooks/useInterviews";
import type {
  Interview,
  InterviewFilter,
  InterviewStatus,
} from "../../../src/types/interview";

const FILTERS: { key: InterviewFilter; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "today", label: "Today" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const statusVariant = (s: InterviewStatus) =>
  s === "completed"
    ? ("success" as const)
    : s === "cancelled" || s === "no_show"
      ? ("danger" as const)
      : s === "in_progress"
        ? ("warning" as const)
        : ("info" as const);

const typeIcon = (t: Interview["type"]) =>
  t === "video" ? "videocam-outline" : t === "phone" ? "call-outline" : "location-outline";

export default function InterviewsListScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<InterviewFilter>("upcoming");
  const { data, isLoading, refetch, isRefetching } = useInterviews(filter);

  const interviews = useMemo(() => data ?? [], [data]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border bg-white px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1A2230" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-ink">Interviews</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(employer)/interviews/schedule")}
          className="flex-row items-center rounded-full bg-primary px-3 py-1.5"
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text className="ml-1 text-xs font-semibold text-white">Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        className="bg-white"
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 ${
                active ? "border-primary bg-primary" : "border-border bg-white"
              }`}
            >
              <Text
                className={`text-xs font-medium ${active ? "text-white" : "text-ink-muted"}`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No interviews"
          description={`No ${filter} interviews to show.`}
          actionTitle="Schedule one"
          onAction={() => router.push("/(employer)/interviews/schedule")}
        />
      ) : (
        <FlatList
          data={interviews}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#0064EC" />
          }
          renderItem={({ item }) => <InterviewRow interview={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

function InterviewRow({ interview }: { interview: Interview }) {
  const dt = new Date(interview.scheduled_at);
  const dateLabel = !isNaN(dt.getTime())
    ? dt.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(employer)/interviews/${interview.id}`)}
      activeOpacity={0.85}
    >
      <Card animated={false}>
        <View className="flex-row items-start">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-light">
            <Ionicons name={typeIcon(interview.type) as any} size={18} color="#0064EC" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-sm font-semibold text-ink" numberOfLines={1}>
                {interview.candidate?.name ?? interview.title ?? "Interview"}
              </Text>
              <Badge text={interview.status.replace("_", " ")} variant={statusVariant(interview.status)} />
            </View>
            <Text className="mt-0.5 text-xs text-ink-muted" numberOfLines={1}>
              {interview.job?.title ?? `Job #${interview.job_id}`}
            </Text>
            <View className="mt-2 flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#6B7F94" />
              <Text className="ml-1 text-[11px] text-ink-muted">{dateLabel}</Text>
              <Text className="ml-2 text-[11px] text-ink-muted capitalize">
                · {interview.type}
              </Text>
              {interview.duration_minutes ? (
                <Text className="ml-2 text-[11px] text-ink-muted">
                  · {interview.duration_minutes} min
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
