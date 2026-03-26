import { useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSavedJobs, useUnsaveJob } from "../../../src/hooks/useJobs";
import { JobCard } from "../../../src/components/job";
import { EmptyState, LoadingSpinner } from "../../../src/components/ui";

export default function SavedJobsScreen() {
  const insets = useSafeAreaInsets();
  const { data: savedJobs, isLoading, refetch, isRefetching } = useSavedJobs();
  const unsaveJob = useUnsaveJob();

  const handleUnsave = useCallback(
    (jobId: number) => {
      unsaveJob.mutate(jobId);
    },
    [unsaveJob]
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-2xl font-bold text-text-primary">Saved Jobs</Text>
        {savedJobs && savedJobs.length > 0 && (
          <Text className="text-sm text-text-secondary">{savedJobs.length} saved</Text>
        )}
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading saved jobs..." />
      ) : !savedJobs || savedJobs.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No Saved Jobs"
          description="Save jobs you're interested in to review them later."
          actionTitle="Browse Jobs"
        />
      ) : (
        <FlatList
          data={savedJobs}
          renderItem={({ item }) => (
            <JobCard
              job={{ ...item, is_saved: true }}
              onSaveToggle={(id) => handleUnsave(id)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#574BA6"
            />
          }
        />
      )}
    </View>
  );
}
