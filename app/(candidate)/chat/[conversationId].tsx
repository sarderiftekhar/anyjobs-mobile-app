import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../src/components/ui";
import { ChatScreenComponent } from "../../../src/components/messaging";

export default function CandidateChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const id = parseInt(conversationId!, 10);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Avatar name="Employer" size="sm" />
        <View className="ml-2 flex-1">
          <Text className="text-sm font-semibold text-ink">Conversation</Text>
          <Text className="text-xs text-success">Online</Text>
        </View>
      </View>

      <ChatScreenComponent conversationId={id} />
    </View>
  );
}
