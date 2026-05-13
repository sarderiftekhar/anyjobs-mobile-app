import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useJobSearchPublic } from "../../src/hooks/useJobs";
import { useDeviceLocation } from "../../src/hooks/useDeviceLocation";
import { JobCard } from "../../src/components/job";
import { LoadingSpinner, EmptyState, Button } from "../../src/components/ui";
import { colors } from "../../src/theme/colors";
import type { Job, JobFilters } from "../../src/types/job";

const QUICK_FILTERS: { label: string; key: string; value: Partial<JobFilters> }[] = [
  { label: "Remote", key: "remote", value: { work_arrangements: ["remote"] } },
  { label: "Full Time", key: "full-time", value: { job_types: ["full-time"] } },
  { label: "Part Time", key: "part-time", value: { job_types: ["part-time"] } },
  { label: "Contract", key: "contract", value: { job_types: ["contract"] } },
];

export default function PublicJobsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; location?: string }>();

  const [searchQuery, setSearchQuery] = useState(params.q ?? "");
  const [appliedQuery, setAppliedQuery] = useState(params.q ?? "");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({});
  const [locationActive, setLocationActive] = useState(true);

  const { location, status: locationStatus, refetch: refetchLocation, clear: clearLocation } =
    useDeviceLocation(true);

  useEffect(() => {
    if (params.q !== undefined) {
      setSearchQuery(params.q);
      setAppliedQuery(params.q);
    }
  }, [params.q]);

  const queryFilters = useMemo<JobFilters>(() => {
    const base: JobFilters = {
      ...filters,
      q: appliedQuery || undefined,
      per_page: 15,
    };
    if (location && locationActive) {
      base.latitude = location.latitude;
      base.longitude = location.longitude;
      base.location_radius = 75; // km
      if (location.city) base.location = location.label;
    }
    return base;
  }, [filters, appliedQuery, location, locationActive]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useJobSearchPublic(queryFilters);

  const jobs = useMemo<Job[]>(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  const submit = () => {
    Keyboard.dismiss();
    setAppliedQuery(searchQuery.trim());
  };

  const handleQuickFilter = (key: string, value: Partial<JobFilters>) => {
    if (activeQuickFilter === key) {
      setActiveQuickFilter(null);
      setFilters((f) => {
        const { work_arrangements, job_types, ...rest } = f;
        return rest;
      });
    } else {
      setActiveQuickFilter(key);
      setFilters((f) => ({ ...f, ...value }));
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(auth)/welcome")
            }
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={24} color="#1A2230" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center rounded-full border border-border bg-surface px-4">
            <Ionicons name="search-outline" size={18} color={colors.ink.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={submit}
              returnKeyType="search"
              placeholder="Search jobs, companies, skills…"
              placeholderTextColor={colors.ink.muted}
              className="ml-2 flex-1 py-2.5 text-sm text-ink"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setAppliedQuery("");
                }}
                hitSlop={6}
              >
                <Ionicons name="close-circle" size={16} color={colors.borderStrong} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Location chip / use-my-location button */}
        <View className="mt-3 flex-row">
          {location && locationActive ? (
            <View className="flex-row items-center rounded-full bg-primary-light px-3 py-1.5">
              <Ionicons name="location" size={13} color={colors.primary.DEFAULT} />
              <Text className="ml-1 text-xs font-semibold text-primary">
                {location.city ? `Near: ${location.label}` : "Near you"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setLocationActive(false);
                  clearLocation();
                }}
                hitSlop={6}
                className="ml-1.5"
              >
                <Ionicons name="close" size={13} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setLocationActive(true);
                refetchLocation();
              }}
              className="flex-row items-center rounded-full border border-primary/30 bg-surface px-3 py-1.5"
            >
              {locationStatus === "requesting" ? (
                <Ionicons name="hourglass-outline" size={13} color={colors.primary.DEFAULT} />
              ) : (
                <Ionicons name="locate-outline" size={13} color={colors.primary.DEFAULT} />
              )}
              <Text className="ml-1 text-xs font-semibold text-primary">
                {locationStatus === "denied"
                  ? "Enable location for nearby jobs"
                  : "Use my location"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick filters */}
        <View className="mt-3 flex-row flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => {
            const active = activeQuickFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => handleQuickFilter(f.key, f.value)}
                className={`rounded-full px-3 py-1.5 ${
                  active ? "bg-primary" : "border border-border bg-surface"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    active ? "text-white" : "text-ink"
                  }`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <View className="flex-1">
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load jobs"
            description="Check your connection and try again."
            actionTitle="Retry"
            onAction={() => refetch()}
          />
        </View>
      ) : jobs.length === 0 ? (
        <View className="flex-1">
          <EmptyState
            icon="briefcase-outline"
            title={appliedQuery ? "No jobs match your search" : "No jobs found"}
            description={
              appliedQuery
                ? "Try different keywords or remove a filter."
                : "Be the first to apply when new jobs go live."
            }
          />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => String(j.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => refetch()}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator className="py-4" color={colors.primary.DEFAULT} />
            ) : null
          }
          renderItem={({ item, index }) => (
            <JobCard
              job={item}
              index={index}
              showApplyButton={false}
              onPress={(id) => router.push(`/(public)/job/${id}`)}
              onSaveToggle={() => router.push("/(auth)/login")}
            />
          )}
        />
      )}

      {/* Sticky CTA — encourage signup */}
      <View
        className="absolute left-0 right-0 px-4"
        style={{ bottom: insets.bottom + 12 }}
      >
        <Button
          title="Sign in to apply & save jobs"
          onPress={() => router.push("/(auth)/login")}
          icon={<Ionicons name="log-in-outline" size={18} color="#fff" />}
        />
      </View>
    </View>
  );
}
