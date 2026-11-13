import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "../../api/messages";
import { Avatar } from "../ui/Avatar";
import { useUserSafety } from "../safety/useUserSafety";

/**
 * Chat header: the other person's name and job, plus Report / Block.
 * Reads the conversation list both Messages tabs already load (same query
 * key), so opening a chat from the inbox costs no extra request.
 */
export function ChatHeader({ conversationId }: { conversationId: number }) {
  const { data } = useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: () => messagesApi.getConversations().then((r) => r.data),
  });
  const conversation = data?.data?.find((c) => c.id === conversationId);
  const participant = conversation?.participant;

  const safety = useUserSafety(participant, {
    // A blocked conversation disappears from the inbox, so leave it.
    onBlocked: () => (router.canGoBack() ? router.back() : undefined),
  });

  return (
    <View className="flex-row items-center border-b border-border px-4 py-3">
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Back"
      >
        <Ionicons name="arrow-back" size={24} color="#1A2230" />
      </TouchableOpacity>
      <View className="ml-3">
        <Avatar name={participant?.name ?? "?"} uri={participant?.avatar_url} size="sm" />
      </View>
      <View className="ml-2 flex-1">
        <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
          {participant?.name ?? "Conversation"}
        </Text>
        {conversation?.job_title ? (
          <Text className="text-xs text-ink-muted" numberOfLines={1}>
            {conversation.job_title}
          </Text>
        ) : null}
      </View>
      {participant ? (
        <TouchableOpacity
          onPress={safety.openMenu}
          className="h-10 w-10 items-center justify-center"
          accessibilityLabel={`Report or block ${participant.name}`}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#1A2230" />
        </TouchableOpacity>
      ) : null}
      {safety.element}
    </View>
  );
}
