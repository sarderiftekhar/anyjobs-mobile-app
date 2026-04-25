import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isPast, formatDistanceToNow } from "date-fns";
import { candidateExtrasApi } from "../../src/api/candidateExtras";
import { Card, Badge, Button, EmptyState, LoadingSpinner } from "../../src/components/ui";
import type { Interview } from "../../src/types/candidate";

const TABS: { key: "upcoming" | "past"; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "gray"> = {
  confirmed: "success",
  scheduled: "info",
  rescheduled: "warning",
  completed: "gray",
  cancelled: "danger",
  "no-show": "danger",
};

function InterviewCard({
  interview,
  onConfirm,
  onCancel,
}: {
  interview: Interview;
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
}) {
  const scheduled = interview.scheduled_at ? new Date(interview.scheduled_at) : null;
  const past = scheduled ? isPast(scheduled) : false;

  const handleJoin = async () => {
    if (!interview.meeting_url) return;
    const supported = await Linking.canOpenURL(interview.meeting_url);
    if (supported) Linking.openURL(interview.meeting_url);
    else Alert.alert("Cannot open link", interview.meeting_url);
  };

  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {interview.job_title}
          </Text>
          <Text className="mt-0.5 text-sm text-ink-muted" numberOfLines={1}>
            {interview.company_name}
          </Text>
        </View>
        <Badge
          text={interview.status.replace("-", " ")}
          variant={STATUS_VARIANT[interview.status] ?? "gray"}
        />
      </View>

      <View className="mt-3 gap-1.5">
        {scheduled && (
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={15} color="#6B7F94" />
            <Text className="ml-1.5 text-sm text-ink">
              {format(scheduled, "EEE, MMM d · h:mm a")}
            </Text>
            <Text className="ml-2 text-xs text-ink-muted">
              ({formatDistanceToNow(scheduled, { addSuffix: true })})
            </Text>
          </View>
        )}
        <View className="flex-row items-center">
          <Ionicons
            name={
              interview.type === "video"
                ? "videocam-outline"
                : interview.type === "phone"
                  ? "call-outline"
                  : "location-outline"
            }
            size={15}
            color="#6B7F94"
          />
          <Text className="ml-1.5 text-sm text-ink-muted">
            {interview.type.replace("-", " ")}
            {interview.duration_minutes ? ` · ${interview.duration_minutes} min` : ""}
          </Text>
        </View>
        {interview.location && (
          <View className="flex-row items-center">
            <Ionicons name="pin-outline" size={15} color="#6B7F94" />
            <Text className="ml-1.5 text-sm text-ink-muted" numberOfLines={1}>
              {interview.location}
            </Text>
          </View>
        )}
      </View>

      {!past && (interview.status === "scheduled" || interview.status === "confirmed") && (
        <View className="mt-4 flex-row gap-2">
          {interview.meeting_url && (
            <Button title="Join" size="sm" className="flex-1" onPress={handleJoin} />
          )}
          {interview.status === "scheduled" && onConfirm && (
            <Button
              title="Confirm"
              size="sm"
              variant="outline"
              className="flex-1"
              onPress={() => onConfirm(interview.id)}
            />
          )}
          {onCancel && (
            <Button
              title="Cancel"
              size="sm"
              variant="ghost"
              className="flex-1"
              onPress={() => onCancel(interview.id)}
            />
          )}
        </View>
      )}
    </Card>
  );
}

export default function InterviewsScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["candidate", "interviews"],
    queryFn: () => candidateExtrasApi.interviews.list(),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => candidateExtrasApi.interviews.confirm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "interviews"] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => candidateExtrasApi.interviews.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "interviews"] }),
  });

  const list = useMemo(() => {
    if (!data) return [];
    return tab === "upcoming" ? data.upcoming : data.past;
  }, [data, tab]);

  const handleCancel = (id: number) => {
    Alert.alert("Cancel Interview", "Are you sure you want to cancel?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel Interview",
        style: "destructive",
        onPress: () => cancelMutation.mutate(id),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-background"
        >
          <Ionicons name="arrow-back" size={20} color="#1A2230" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-ink">Interviews</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-border bg-white">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              className="flex-1 items-center py-3"
              onPress={() => setTab(t.key)}
            >
              <Text
                className={`text-sm font-semibold ${active ? "text-primary" : "text-ink-muted"}`}
              >
                {t.label}
              </Text>
              {active && <View className="mt-1 h-0.5 w-16 rounded-full bg-primary" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading interviews..." />
      ) : list.length === 0 ? (
        <EmptyState
          icon={tab === "upcoming" ? "calendar-outline" : "time-outline"}
          title={tab === "upcoming" ? "No Upcoming Interviews" : "No Past Interviews"}
          description={
            tab === "upcoming"
              ? "When an employer schedules an interview, it'll show up here."
              : "Completed and cancelled interviews will appear here."
          }
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <InterviewCard
              interview={item}
              onConfirm={(id) => confirmMutation.mutate(id)}
              onCancel={handleCancel}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#0064EC"
            />
          }
        />
      )}
    </View>
  );
}
