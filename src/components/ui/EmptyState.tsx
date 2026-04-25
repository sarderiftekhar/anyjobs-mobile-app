import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";
import { EmptyIllustration } from "./EmptyIllustration";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  // Optional accent icons that float around the main disc.
  satellites?: (keyof typeof Ionicons.glyphMap)[];
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "document-text-outline",
  satellites,
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <EmptyIllustration icon={icon} satellites={satellites} />
      <Text className="mt-6 text-center text-xl font-bold text-ink">
        {title}
      </Text>
      {description && (
        <Text className="mt-2 max-w-[280px] text-center text-sm leading-5 text-ink-muted">
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} className="mt-7" />
      )}
    </View>
  );
}
