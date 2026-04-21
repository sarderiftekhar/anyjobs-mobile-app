import { useState, useRef, useEffect, useMemo } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "../../api/messages";
import { useAuthStore } from "../../stores/authStore";
import { Avatar } from "../ui/Avatar";
import type { Message } from "../../types/message";
import { format } from "date-fns";

interface ChatScreenProps {
  conversationId: number;
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View className={`mb-2 max-w-[80%] ${isOwn ? "self-end" : "self-start"}`}>
      <View
        className={`rounded-2xl px-4 py-2.5 ${
          isOwn ? "rounded-br-sm bg-primary" : "rounded-bl-sm bg-gray-100"
        }`}
      >
        <Text className={`text-sm ${isOwn ? "text-white" : "text-text-primary"}`}>
          {message.text}
        </Text>
      </View>
      <View className={`mt-0.5 flex-row items-center gap-1 ${isOwn ? "justify-end" : ""}`}>
        <Text className="text-[10px] text-text-secondary">
          {format(new Date(message.sent_at), "h:mm a")}
        </Text>
        {isOwn && (
          <Ionicons
            name={message.read ? "checkmark-done" : "checkmark"}
            size={12}
            color={message.read ? "#1E3A8A" : "#9CA3AF"}
          />
        )}
      </View>
    </View>
  );
}

export function ChatScreenComponent({ conversationId }: ChatScreenProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const [text, setText] = useState("");

  const { data } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messagesApi.getMessages(conversationId).then((r) => r.data),
    refetchInterval: 5000, // Poll every 5s for new messages
  });

  const messages = useMemo(() => [...(data?.data ?? [])].reverse(), [data]);

  const sendMessage = useMutation({
    mutationFn: (messageText: string) => messagesApi.sendMessage(conversationId, messageText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage.mutate(trimmed);
    setText("");
  };

  // Mark as read
  useEffect(() => {
    messagesApi.markRead(conversationId).catch(() => {});
  }, [conversationId]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.sender_id === user?.id} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input bar */}
      <View
        className="flex-row items-end border-t border-border bg-white px-3 py-2"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <TouchableOpacity className="mr-2 pb-1.5">
          <Ionicons name="add-circle-outline" size={26} color="#9CA3AF" />
        </TouchableOpacity>
        <View className="flex-1 max-h-[120px] rounded-2xl border border-border bg-gray-50 px-4 py-2">
          <TextInput
            className="text-base text-text-primary"
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            multiline
          />
        </View>
        <TouchableOpacity
          className={`ml-2 h-10 w-10 items-center justify-center rounded-full ${
            text.trim() ? "bg-primary" : "bg-gray-200"
          }`}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={18} color={text.trim() ? "#FFFFFF" : "#9CA3AF"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
