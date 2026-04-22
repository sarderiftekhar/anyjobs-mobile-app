import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { resumeAlertsApi } from "../../../../src/api/resumeAlerts";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  LoadingSpinner,
} from "../../../../src/components/ui";
import type { TalentListItem } from "../../../../src/types/talent";

export default function ResumeAlertMatchesScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alertId = Number(id);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["employer", "resume-alerts", "matches", alertId],
    queryFn: () => resumeAlertsApi.getMatches(alertId),
    enabled: Number.isFinite(alertId),
  });

  const matches = data ?? [];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center border-b border-border bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-text-primary">Matching candidates</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : matches.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No matches yet"
          description="No candidate profiles match this alert right now. New matches will appear as candidates update their profiles."
        />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#1E3A8A"
            />
          }
          renderItem={({ item }) => <MatchRow item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

function MatchRow({ item }: { item: TalentListItem }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(employer)/talent/${item.id}`)}
    >
      <Card>
        <View className="flex-row items-center">
          <Avatar name={item.name} uri={item.avatar ?? undefined} size="md" />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text
                className="flex-1 text-sm font-semibold text-text-primary"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {item.open_to_work ? (
                <Badge text="Open" variant="success" />
              ) : null}
            </View>
            <Text className="text-xs text-text-secondary" numberOfLines={1}>
              {item.professional_title || "Candidate"}
            </Text>
            {item.location ? (
              <View className="mt-1 flex-row items-center">
                <Ionicons name="location-outline" size={11} color="#6B7280" />
                <Text className="ml-1 text-[11px] text-text-secondary">
                  {item.location}
                </Text>
              </View>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
