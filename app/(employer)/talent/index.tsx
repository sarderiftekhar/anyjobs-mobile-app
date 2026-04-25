import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { talentApi } from "../../../src/api/talent";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  LoadingSpinner,
  SearchBar,
} from "../../../src/components/ui";
import type { TalentListItem, TalentSearchFilters } from "../../../src/types/talent";

const EXPERIENCE_FILTERS: { key: string; label: string }[] = [
  { key: "entry", label: "Entry" },
  { key: "mid", label: "Mid" },
  { key: "senior", label: "Senior" },
  { key: "lead", label: "Lead" },
  { key: "executive", label: "Exec" },
];

function TalentCard({ candidate }: { candidate: TalentListItem }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/(employer)/talent/${candidate.id}`)}
      className="mb-3"
    >
      <Card>
        <View className="flex-row items-center">
          <Avatar
            name={candidate.name}
            uri={candidate.avatar ?? undefined}
            size="lg"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text
                className="flex-1 text-base font-semibold text-ink"
                numberOfLines={1}
              >
                {candidate.name}
              </Text>
              {candidate.open_to_work && (
                <View className="ml-1 h-2 w-2 rounded-full bg-success" />
              )}
            </View>
            <Text className="text-sm text-ink-muted" numberOfLines={1}>
              {candidate.professional_title}
            </Text>
            {candidate.location ? (
              <View className="mt-0.5 flex-row items-center">
                <Ionicons name="location-outline" size={12} color="#6B7F94" />
                <Text className="ml-1 text-xs text-ink-muted">
                  {candidate.location}
                </Text>
              </View>
            ) : null}
          </View>
          {typeof candidate.match_score === "number" && (
            <View className="items-center">
              <Ionicons name="sparkles" size={14} color="#0064EC" />
              <Text className="text-sm font-bold text-primary">
                {candidate.match_score}%
              </Text>
            </View>
          )}
        </View>

        {candidate.skills?.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-1">
            {candidate.skills.slice(0, 5).map((s) => (
              <Badge key={s} text={s} variant="primary" />
            ))}
          </View>
        )}

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-xs text-ink-muted">
            {candidate.years_experience
              ? `${candidate.years_experience} yrs exp`
              : "Experience: N/A"}
          </Text>
          {candidate.has_cv && (
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={12} color="#0064EC" />
              <Text className="ml-1 text-xs font-medium text-primary">CV</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function TalentListScreen() {
  const insets = useSafeAreaInsets();
  const [keywords, setKeywords] = useState("");
  const [activeExp, setActiveExp] = useState<string | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);

  const filters = useMemo<TalentSearchFilters>(
    () => ({
      keywords: keywords || undefined,
      experience_levels: activeExp ? [activeExp] : undefined,
      available: availableOnly ? true : undefined,
      per_page: 20,
    }),
    [keywords, activeExp, availableOnly]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["talent", filters],
    queryFn: ({ pageParam = 1 }) =>
      talentApi.search({ ...filters, page: pageParam as number }),
    getNextPageParam: (last) =>
      last.pagination.current_page < last.pagination.last_page
        ? last.pagination.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const candidates = useMemo(
    () => data?.pages.flatMap((p) => p.candidates) ?? [],
    [data]
  );
  const total = data?.pages[0]?.pagination.total ?? 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="border-b border-border bg-white px-4 pb-3 pt-3">
        <View className="mb-3 flex-row items-center">
          <TouchableOpacity
            className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-background"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#1A2230" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-bold text-ink">
            Browse Talent
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(employer)/resume-alerts")}
          >
            <Ionicons name="notifications-outline" size={22} color="#0064EC" />
          </TouchableOpacity>
        </View>

        <SearchBar
          value={keywords}
          onChangeText={setKeywords}
          placeholder="Search skills, titles, keywords..."
        />

        {/* Filters row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 10 }}
        >
          <TouchableOpacity
            onPress={() => setAvailableOnly((v) => !v)}
            className={`rounded-full px-3 py-1.5 ${
              availableOnly ? "bg-primary" : "bg-background border border-border"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                availableOnly ? "text-white" : "text-ink-muted"
              }`}
            >
              Available now
            </Text>
          </TouchableOpacity>
          {EXPERIENCE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() =>
                setActiveExp((prev) => (prev === f.key ? null : f.key))
              }
              className={`rounded-full px-3 py-1.5 ${
                activeExp === f.key
                  ? "bg-primary"
                  : "bg-background border border-border"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  activeExp === f.key ? "text-white" : "text-ink-muted"
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-xs text-ink-muted">
          {total > 0 ? `${total} candidates` : ""}
        </Text>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Searching talent..." />
      ) : isError ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load talent"
          description="The talent library could not be reached. Pull to refresh or try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No candidates found"
          description="Try adjusting filters or widening your keyword search."
        />
      ) : (
        <FlatList
          data={candidates}
          renderItem={({ item }) => <TalentCard candidate={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() =>
            hasNextPage && !isFetchingNextPage && fetchNextPage()
          }
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#0064EC" />
            ) : null
          }
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
