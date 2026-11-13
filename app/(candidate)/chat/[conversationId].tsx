import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatScreenComponent } from "../../../src/components/messaging";
import { ChatHeader } from "../../../src/components/messaging/ChatHeader";

export default function CandidateChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const id = parseInt(conversationId!, 10);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ChatHeader conversationId={id} />

      <ChatScreenComponent conversationId={id} />
    </View>
  );
}
