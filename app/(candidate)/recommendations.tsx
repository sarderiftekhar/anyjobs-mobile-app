import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { candidateExtrasApi } from "../../src/api/candidateExtras";
import { Card, Badge, EmptyState, LoadingSpinner } from "../../src/components/ui";
import type { RecommendedJob } from "../../src/types/candidate";

function scoreBadgeVariant(score?: number): "success" | "info" | "warning" | "gray" {
  if (score == null) return "gray";
  if (score >= 80) return "success";
  if (score >= 60) return "info";
  if (score >= 40) return "warning";
  return "gray";
}

function RecommendationCard({ job }: { job: RecommendedJob }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/(candidate)/job/${job.id}`)}
    >
      <Card className="mb-3">
        <View className="flex-row items-start">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-primary-light">
            <Text className="text-sm font-bold text-primary">
              {(job.company_name || "?").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
              {job.title}
            </Text>
            <Text className="text-sm text-text-secondary" numberOfLines={1}>
              {job.company_name}
            </Text>
          </View>
          {job.match_score != null && (
            <Badge text={`${job.match_score}% match`} variant={scoreBadgeVariant(job.match_score)} />
          )}
        </View>

        <View className="mt-3 gap-1">
          {job.location && (
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text className="ml-1.5 text-xs text-text-secondary">{job.location}</Text>
            </View>
          )}
          {job.salary_label && (
            <View className="flex-row items-center">
              <Ionicons name="cash-outline" size={14} color="#6B7280" />
              <Text className="ml-1.5 text-xs text-text-secondary">{job.salary_label}</Text>
            </View>
          )}
          {job.posted_at && (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="ml-1.5 text-xs text-text-secondary">
                Posted {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
              </Text>
            </View>
          )}
        </View>

        {job.match_reasons && job.match_reasons.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-1.5">
            {job.match_reasons.slice(0, 3).map((reason, i) => (
              <Badge key={`${job.id}-reason-${i}`} text={reason} variant="primary" />
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["candidate", "recommendations"],
    queryFn: () => candidateExtrasApi.recommendations(),
  });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">Recommended for you</Text>
          <Text className="text-xs text-text-secondary">
            Jobs matched to your profile, skills and preferences
          </Text>
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Finding matches..." />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="sparkles-outline"
          title="No recommendations yet"
          description="Complete your profile and skills to get personalized job matches."
          actionTitle="Update profile"
          onAction={() => router.push("/(candidate)/(tabs)/profile")}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <RecommendationCard job={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#1E3A8A"
            />
          }
        />
      )}
    </View>
  );
}
