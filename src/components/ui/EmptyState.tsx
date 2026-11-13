import { useMemo } from "react";
import { View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { enterUp } from "../animation/entrance";
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
  // Illustration, then copy, then action — a short cascade on mount only.
  const [enterArt, enterTitle, enterBody, enterAction] = useMemo(
    () => [enterUp(0), enterUp(70), enterUp(120), enterUp(170)],
    []
  );

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Animated.View entering={enterArt}>
        <EmptyIllustration icon={icon} satellites={satellites} />
      </Animated.View>
      <Animated.View entering={enterTitle}>
        <Text className="mt-6 text-center text-xl font-bold text-ink">
          {title}
        </Text>
      </Animated.View>
      {description && (
        <Animated.View entering={enterBody}>
          <Text className="mt-2 max-w-[280px] text-center text-sm leading-5 text-ink-muted">
            {description}
          </Text>
        </Animated.View>
      )}
      {actionTitle && onAction && (
        <Animated.View entering={enterAction}>
          <Button title={actionTitle} onPress={onAction} className="mt-7" />
        </Animated.View>
      )}
    </View>
  );
}
