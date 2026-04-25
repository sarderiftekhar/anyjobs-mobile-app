import { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet from "@gorhom/bottom-sheet";
import { useAuthStore } from "../../../src/stores/authStore";
import { useJobSearch, useSaveJob, useUnsaveJob } from "../../../src/hooks/useJobs";
import { useUnreadNotificationCount } from "../../../src/hooks/useNotifications";
import { SearchBar, LocationInput } from "../../../src/components/ui";
import { JobCard, FilterModal } from "../../../src/components/job";
import { LoadingSpinner, EmptyState } from "../../../src/components/ui";
import type { Job, JobFilters, WorkArrangement } from "../../../src/types/job";

const QUICK_FILTERS: { label: string; key: string; value: Partial<JobFilters> }[] = [
  { label: "Remote", key: "remote", value: { work_arrangements: ["remote"] } },
  { label: "Full Time", key: "full-time", value: { job_types: ["full-time"] } },
  { label: "Part Time", key: "part-time", value: { job_types: ["part-time"] } },
  { label: "Contract", key: "contract", value: { job_types: ["contract"] } },
];

export default function JobFeedScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const filterSheetRef = useRef<BottomSheet>(null) as React.RefObject<BottomSheet>;

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filters, setFilters] = useState<JobFilters>({});
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // Combine search + filters
  const queryFilters = useMemo<JobFilters>(
    () => ({
      ...filters,
      q: searchQuery || undefined,
      location: locationQuery || undefined,
      per_page: 15,
    }),
    [filters, searchQuery, locationQuery]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useJobSearch(queryFilters);

  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();
  const { data: unreadCount } = useUnreadNotificationCount();

  const jobs = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const handleSaveToggle = useCallback(
    (jobId: number, isSaved: boolean) => {
      if (isSaved) unsaveJob.mutate(jobId);
      else saveJob.mutate(jobId);
    },
    [saveJob, unsaveJob]
  );

  const handleQuickFilter = (key: string, value: Partial<JobFilters>) => {
    if (activeQuickFilter === key) {
      setActiveQuickFilter(null);
      setFilters({});
    } else {
      setActiveQuickFilter(key);
      setFilters(value);
    }
  };

  const handleApplyFilters = (newFilters: JobFilters) => {
    setFilters(newFilters);
    setActiveQuickFilter(null);
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#0064EC" />
      </View>
    );
  };

  return (
    <View style={[hs.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={hs.header}>
        <View style={hs.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={hs.subtitle}>Welcome back</Text>
            <Text style={hs.name}>{user?.first_name ?? "there"}</Text>
          </View>
          <TouchableOpacity
            style={hs.notifBtn}
            onPress={() => router.push("/(candidate)/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color="#1A2230" />
            {(unreadCount ?? 0) > 0 && (
              <View style={hs.notifBadge}>
                <Text style={hs.notifBadgeText}>
                  {unreadCount! > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ marginTop: 20 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search jobs, skills, companies..."
            onFilterPress={() => filterSheetRef.current?.expand()}
          />
        </View>

        {/* Location — zIndex higher than chips so dropdown overlaps them */}
        <View style={{ marginTop: 10, zIndex: 100, position: "relative" }}>
          <LocationInput
            value={locationQuery}
            onSelect={setLocationQuery}
            placeholder="City, region, or country..."
            compact
          />
        </View>

        {/* Quick filter chips — lower zIndex so location dropdown appears above */}
        <View style={[hs.chipsRow, { zIndex: 1, position: "relative" }]}>
          {QUICK_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                hs.chip,
                activeQuickFilter === f.key ? hs.chipActive : hs.chipInactive,
              ]}
              onPress={() => handleQuickFilter(f.key, f.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  hs.chipText,
                  activeQuickFilter === f.key ? hs.chipTextActive : hs.chipTextInactive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section header */}
      <View style={hs.sectionHeader}>
        <Text style={hs.sectionTitle}>
          {searchQuery ? "Search Results" : "Recommended for you"}
        </Text>
        {jobs.length > 0 && (
          <Text style={hs.jobCount}>
            {data?.pages[0]?.meta.total ?? 0} jobs
          </Text>
        )}
      </View>

      {/* Job list */}
      {isLoading ? (
        <LoadingSpinner message="Finding jobs..." fullScreen />
      ) : isError ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong"
          description="We couldn't load jobs. Please try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Jobs Found"
          description="Try adjusting your search or filters to find more opportunities."
          actionTitle="Clear Filters"
          onAction={() => {
            setFilters({});
            setSearchQuery("");
            setLocationQuery("");
            setActiveQuickFilter(null);
          }}
        />
      ) : (
        <FlatList
          data={jobs}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onSaveToggle={handleSaveToggle}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "#F6F8FB" }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#0064EC"
            />
          }
        />
      )}

      {/* Filter modal */}
      <FilterModal
        bottomSheetRef={filterSheetRef}
        filters={queryFilters}
        onApply={handleApplyFilters}
        resultCount={data?.pages[0]?.meta.total}
      />
    </View>
  );
}

import { StyleSheet } from "react-native";

const hs = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1000,
    position: "relative",
    overflow: "visible",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A2230",
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: "#0064EC",
  },
  chipInactive: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipTextInactive: {
    color: "#6B7F94",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 18,
    backgroundColor: "#F6F8FB",
    zIndex: 1,
    position: "relative",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A2230",
  },
  jobCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0064EC",
  },
});
