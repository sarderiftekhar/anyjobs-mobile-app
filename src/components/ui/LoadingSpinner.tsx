import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "../../theme/colors";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-8"}`}
    >
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      {message && (
        <Text className="mt-3 text-sm text-ink-muted">{message}</Text>
      )}
    </View>
  );
}
