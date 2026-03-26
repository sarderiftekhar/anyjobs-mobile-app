import { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "../../../src/api/messages";
import { Avatar, EmptyState, LoadingSpinner } from "../../../src/components/ui";
import type { Conversation } from "../../../src/types/message";
import { formatDistanceToNow } from "date-fns";

export default function EmployerMessagesScreen() {
  const insets = useSafeAreaInsets();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: () => messagesApi.getConversations().then((r) => r.data),
  });

  const conversations = useMemo(() => data?.data ?? [], [data]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-2xl font-bold text-text-primary">Messages</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading messages..." />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="chatbubble-outline"
          title="No Messages"
          description="Start conversations with candidates to see them here."
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3"
              onPress={() => router.push(`/(employer)/chat/${item.id}`)}
            >
              <Avatar name={item.participant.name} uri={item.participant.avatar_url} size="md" />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-text-primary" numberOfLines={1}>
                    {item.participant.name}
                  </Text>
                  <Text className="text-[10px] text-text-secondary">
                    {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                  </Text>
                </View>
                {item.job_title && (
                  <Text className="text-xs text-primary" numberOfLines={1}>{item.job_title}</Text>
                )}
                {item.last_message && (
                  <Text className="text-sm text-text-secondary" numberOfLines={1}>
                    {item.last_message.text}
                  </Text>
                )}
              </View>
              {item.unread_count > 0 && (
                <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Text className="text-[10px] font-bold text-white">{item.unread_count}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#574BA6" />}
        />
      )}
    </View>
  );
}
