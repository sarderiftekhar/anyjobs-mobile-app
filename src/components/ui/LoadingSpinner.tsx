import { useMemo } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import Animated from "react-native-reanimated";
import { enterFade } from "../animation/entrance";
import { colors } from "../../theme/colors";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  // A short delay before fading in means quick loads never flash a spinner.
  const entering = useMemo(() => enterFade(120, 240), []);

  return (
    <View
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-8"}`}
    >
      <Animated.View entering={entering} style={{ alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        {message && (
          <Text className="mt-3 text-sm text-ink-muted">{message}</Text>
        )}
      </Animated.View>
    </View>
  );
}
