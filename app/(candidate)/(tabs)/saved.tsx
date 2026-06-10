import { useCallback, useState } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSavedJobs, useUnsaveJob } from "../../../src/hooks/useJobs";
import { JobCard } from "../../../src/components/job";
import { EmptyState, LoadingSpinner, Button } from "../../../src/components/ui";
import { jobsApi } from "../../../src/api/jobs";

export default function SavedJobsScreen() {
  const insets = useSafeAreaInsets();
  const { data: savedJobs, isLoading, refetch, isRefetching } = useSavedJobs();
  const unsaveJob = useUnsaveJob();

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const handleUnsave = useCallback((jobId: number) => unsaveJob.mutate(jobId), [unsaveJob]);

  const toggleSelect = (id: number) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const exitSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const ids = Array.from(selected);

  const bulkRemove = () => {
    if (!ids.length) return;
    Alert.alert("Remove saved jobs", `Remove ${ids.length} job(s) from saved?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await jobsApi.bulkRemoveSaved(ids);
            await refetch();
            exitSelect();
          } catch {
            Alert.alert("Error", "Couldn't remove those jobs.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const bulkApply = () => {
    if (!ids.length) return;
    Alert.alert("Apply to selected", `Submit applications to ${ids.length} job(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Apply",
        onPress: async () => {
          setBusy(true);
          try {
            const res = await jobsApi.bulkApplySaved(ids);
            const d = res.data.data;
            Alert.alert("Done", `Applied to ${d?.applied ?? 0}. ${d?.skipped ? `${d.skipped} skipped.` : ""}`);
            await refetch();
            exitSelect();
          } catch {
            Alert.alert("Error", "Couldn't apply to those jobs.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-2xl font-bold text-ink">Saved Jobs</Text>
        {savedJobs && savedJobs.length > 0 && (
          selectMode ? (
            <TouchableOpacity onPress={exitSelect}>
              <Text className="text-sm font-semibold text-primary">Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setSelectMode(true)}>
              <Text className="text-sm font-semibold text-primary">Select</Text>
            </TouchableOpacity>
          )
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
          renderItem={({ item }) =>
            selectMode ? (
              <TouchableOpacity
                className="mb-3 flex-row items-center rounded-2xl border border-border bg-surface p-4"
                onPress={() => toggleSelect(item.id)}
              >
                <Ionicons
                  name={selected.has(item.id) ? "checkbox" : "square-outline"}
                  size={22}
                  color={selected.has(item.id) ? "#0064EC" : "#6B7F94"}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-ink" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-sm text-ink-muted" numberOfLines={1}>
                    {(item as any).company?.name ?? (item as any).company_name ?? ""}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <JobCard job={{ ...item, is_saved: true }} onSaveToggle={(id) => handleUnsave(id)} />
            )
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: selectMode ? 120 : 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#0064EC" />
          }
        />
      )}

      {selectMode && (
        <View
          className="absolute inset-x-0 bottom-0 flex-row border-t border-border bg-surface px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="mr-2 flex-1">
            <Button title={`Remove (${ids.length})`} variant="outline" disabled={!ids.length || busy} onPress={bulkRemove} />
          </View>
          <View className="ml-2 flex-1">
            <Button title={`Apply (${ids.length})`} loading={busy} disabled={!ids.length} onPress={bulkApply} />
          </View>
        </View>
      )}
    </View>
  );
}
