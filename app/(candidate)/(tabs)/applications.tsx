import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApplications } from "../../../src/hooks/useApplications";
import { ApplicationCard } from "../../../src/components/application";
import { EmptyState, LoadingSpinner } from "../../../src/components/ui";
import { applicationsApi } from "../../../src/api/applications";

function MessageButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    try {
      const conv = await applicationsApi.conversation(id);
      router.push(`/(candidate)/chat/${conv.conversation_id}`);
    } catch {
      Alert.alert("Unavailable", "Messaging isn't available for this application yet.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <TouchableOpacity
      onPress={open}
      className="mb-4 -mt-1 flex-row items-center self-start rounded-full bg-primary/10 px-3 py-1.5"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#0064EC" />
      ) : (
        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#0064EC" />
      )}
      <Text className="ml-1.5 text-xs font-semibold text-primary">Message employer</Text>
    </TouchableOpacity>
  );
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "interviewed", label: "Interview" },
  { key: "offered", label: "Offered" },
  { key: "rejected", label: "Rejected" },
];

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");

  const statusFilter = activeTab === "all" ? undefined : activeTab;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useApplications(statusFilter);

  const applications = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const totalCount = data?.pages[0]?.meta.total ?? 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pb-2 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">
            My Applications
          </Text>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={22} color="#1A2230" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status tabs */}
      <View className="border-b border-border">
        <FlatList
          horizontal
          data={STATUS_TABS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`rounded-full px-4 py-2 ${
                activeTab === item.key ? "bg-primary" : "bg-white border border-border"
              }`}
              onPress={() => setActiveTab(item.key)}
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === item.key ? "text-white" : "text-ink-muted"
                }`}
              >
                {item.label}
                {item.key === "all" && totalCount > 0 ? ` (${totalCount})` : ""}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
      </View>

      {/* Application list */}
      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No Applications Yet"
          description={
            activeTab === "all"
              ? "Start applying to jobs and track your progress here."
              : `No ${activeTab} applications found.`
          }
          actionTitle="Browse Jobs"
        />
      ) : (
        <FlatList
          data={applications}
          renderItem={({ item, index }) => (
            <View>
              <ApplicationCard application={item} index={index} />
              <MessageButton id={item.id} />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#0064EC" className="py-4" />
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
