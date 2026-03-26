import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "document-text-outline",
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name={icon} size={64} color="#D1D5DB" />
      <Text className="mt-4 text-center text-lg font-semibold text-text-primary">
        {title}
      </Text>
      {description && (
        <Text className="mt-2 text-center text-sm text-text-secondary">
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} className="mt-6" />
      )}
    </View>
  );
}
