import { useState, useMemo } from "react";
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApplicants, useUpdateApplicantStatus } from "../../../src/hooks/useEmployer";
import { Avatar, Badge, Button, Card, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import type { Applicant } from "../../../src/api/employer";
import { PressableScale } from "../../../src/components/animation/PressableScale";
import { MAX_ANIMATED_INDEX, staggerDelay } from "../../../src/components/animation/entrance";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "applied", label: "New" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviewed", label: "Interview" },
  { key: "rejected", label: "Rejected" },
];

function ApplicantCard({ applicant, index = 0 }: { applicant: Applicant; index?: number }) {
  const updateStatus = useUpdateApplicantStatus();

  const handleAction = (status: string) => {
    updateStatus.mutate(
      { id: applicant.id, status },
      {
        onError: (err: any) =>
          Alert.alert(
            "Couldn't update applicant",
            err?.response?.data?.message ?? "Please try again.",
          ),
      },
    );
  };

  return (
    <PressableScale
      className="mb-3"
      scaleTo={0.98}
      activeOpacity={0.9}
      onPress={() => router.push(`/(employer)/applicant/${applicant.id}`)}
      accessibilityRole="button"
    >
      <Card animated={index < MAX_ANIMATED_INDEX} delay={staggerDelay(index)}>
        <View className="flex-row items-center">
          <Avatar name={applicant.candidate.name} uri={applicant.candidate.avatar_url} size="lg" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-ink">
              {applicant.candidate.name}
            </Text>
            <Text className="text-sm text-ink-muted" numberOfLines={1}>
              {applicant.candidate.title ?? "Candidate"}
            </Text>
            {applicant.candidate.location && (
              <Text className="text-xs text-ink-muted">{applicant.candidate.location}</Text>
            )}
          </View>
        </View>

        {/* Job + match */}
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-xs text-ink-muted">For: {applicant.job_title}</Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="ml-1 text-sm font-bold text-primary">{applicant.match_score}%</Text>
          </View>
        </View>

        {/* Skills */}
        {applicant.candidate.skills.length > 0 && (
          <View className="mt-2 flex-row flex-wrap gap-1">
            {applicant.candidate.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} text={skill} variant="primary" />
            ))}
          </View>
        )}

        {/* Date */}
        <Text className="mt-2 text-xs text-ink-muted">
          Applied {new Date(applicant.applied_at).toLocaleDateString()}
        </Text>

        {/* Quick actions */}
        <View className="mt-3 flex-row gap-2">
          {applicant.status === "applied" && (
            <>
              <Button title="Shortlist" size="sm" className="flex-1" onPress={() => handleAction("shortlisted")} />
              <Button title="Reject" variant="outline" size="sm" className="flex-1" onPress={() => handleAction("rejected")} />
            </>
          )}
          {applicant.status === "shortlisted" && (
            <Button title="Schedule Interview" size="sm" className="flex-1" onPress={() => handleAction("interviewed")} />
          )}
          <PressableScale
            className="items-center justify-center rounded-md border border-border px-3 py-2"
            onPress={() => router.push(`/(employer)/chat/${applicant.candidate.id}`)}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel="Message candidate"
          >
            <Ionicons name="chatbubble-outline" size={16} color="#0064EC" />
          </PressableScale>
        </View>
      </Card>
    </PressableScale>
  );
}

export default function ApplicantsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("match_score");

  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useApplicants({ status: statusFilter, sort: sortBy });

  const applicants = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 pb-2 pt-4">
        <Text className="text-2xl font-bold text-ink">Applicants</Text>
      </View>

      {/* Tabs */}
      <View className="border-b border-border">
        <FlatList
          horizontal
          data={STATUS_TABS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4, paddingVertical: 8 }}
          renderItem={({ item }) => (
            <PressableScale
              className={`rounded-full px-4 py-2 ${activeTab === item.key ? "bg-primary" : "bg-white border border-border"}`}
              onPress={() => setActiveTab(item.key)}
              scaleTo={0.95}
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === item.key }}
            >
              <Text className={`text-sm font-medium ${activeTab === item.key ? "text-white" : "text-ink-muted"}`}>
                {item.label}
              </Text>
            </PressableScale>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {/* Sort */}
      <View className="flex-row items-center justify-end px-4 py-2">
        <Text className="text-xs text-ink-muted">Sort by: </Text>
        <PressableScale
          onPress={() => setSortBy(sortBy === "match_score" ? "applied_at" : "match_score")}
          activeOpacity={0.6}
          accessibilityRole="button"
        >
          <Text className="text-xs font-medium text-primary">
            {sortBy === "match_score" ? "Match Score" : "Date Applied"}
          </Text>
        </PressableScale>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading applicants..." />
      ) : applicants.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Applicants"
          description="Applicants will appear here once you have active job postings."
        />
      ) : (
        <FlatList
          data={applicants}
          renderItem={({ item, index }) => <ApplicantCard applicant={item} index={index} />}
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
