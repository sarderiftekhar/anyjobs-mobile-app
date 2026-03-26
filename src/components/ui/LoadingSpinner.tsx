import { View, ActivityIndicator, Text } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-8"}`}
    >
      <ActivityIndicator size="large" color="#574BA6" />
      {message && (
        <Text className="mt-3 text-sm text-text-secondary">{message}</Text>
      )}
    </View>
  );
}
