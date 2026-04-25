import { useState, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEmployerJobs, useUpdateJobStatus, useDeleteJob } from "../../../src/hooks/useEmployer";
import { Card, Badge, Button, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import type { EmployerJob } from "../../../src/api/employer";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "paused", label: "Paused" },
  { key: "closed", label: "Closed" },
];

const STATUS_BADGE: Record<string, "success" | "warning" | "gray" | "danger" | "info"> = {
  active: "success", draft: "warning", paused: "info", closed: "gray", expired: "danger",
};

function EmployerJobCard({ job }: { job: EmployerJob }) {
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();

  const handleStatusAction = (status: string) => {
    updateStatus.mutate({ id: job.id, status });
  };

  const handleDelete = () => {
    Alert.alert("Delete Job", `Delete "${job.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteJob.mutate(job.id) },
    ]);
  };

  return (
    <Card className="mb-3">
      <Text className="text-base font-semibold text-ink" numberOfLines={1}>
        {job.title}
      </Text>
      <Text className="text-sm text-ink-muted">
        {job.location} · {job.work_arrangement}
      </Text>

      <View className="mt-2 flex-row items-center gap-2">
        <Badge text={job.status} variant={STATUS_BADGE[job.status] ?? "gray"} />
        <Text className="text-xs text-ink-muted">
          Posted {new Date(job.posted_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Analytics */}
      <View className="mt-3 flex-row gap-4">
        <View className="flex-row items-center">
          <Ionicons name="eye-outline" size={14} color="#6B7F94" />
          <Text className="ml-1 text-xs text-ink-muted">{job.views_count} views</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="document-text-outline" size={14} color="#6B7F94" />
          <Text className="ml-1 text-xs text-ink-muted">{job.applications_count} applicants</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="star-outline" size={14} color="#6B7F94" />
          <Text className="ml-1 text-xs text-ink-muted">{job.shortlisted_count} shortlisted</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="mt-3 flex-row gap-2">
        <Button title="Edit" variant="outline" size="sm" className="flex-1" onPress={() => {}} />
        {job.status === "draft" && (
          <Button title="Publish" size="sm" className="flex-1" onPress={() => handleStatusAction("active")} />
        )}
        {job.status === "active" && (
          <Button title="Pause" variant="secondary" size="sm" className="flex-1" onPress={() => handleStatusAction("paused")} />
        )}
        {job.status === "paused" && (
          <Button title="Resume" size="sm" className="flex-1" onPress={() => handleStatusAction("active")} />
        )}
        <TouchableOpacity className="items-center justify-center px-2" onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function EmployerJobsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");

  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEmployerJobs(statusFilter);

  const jobs = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-2xl font-bold text-ink">My Jobs</Text>
        <Button
          title="New"
          size="sm"
          icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
          onPress={() => router.push("/(employer)/job/create")}
        />
      </View>

      {/* Status tabs */}
      <View className="border-b border-border">
        <FlatList
          horizontal
          data={STATUS_TABS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4, paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`rounded-full px-4 py-2 ${
                activeTab === item.key ? "bg-primary" : "bg-white border border-border"
              }`}
              onPress={() => setActiveTab(item.key)}
            >
              <Text className={`text-sm font-medium ${activeTab === item.key ? "text-white" : "text-ink-muted"}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="No Jobs Posted"
          description="Create your first job posting to start finding talent."
          actionTitle="Post a Job"
          onAction={() => router.push("/(employer)/job/create")}
        />
      ) : (
        <FlatList
          data={jobs}
          renderItem={({ item }) => <EmployerJobCard job={item as EmployerJob} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color="#0064EC" /> : null}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#0064EC" />}
        />
      )}
    </View>
  );
}
