import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-white p-8">
        <Text className="text-xl font-bold text-ink">
          Page Not Found
        </Text>
        <Link href="/(auth)/welcome" className="mt-4">
          <Text className="text-base font-medium text-primary">Go Home</Text>
        </Link>
      </View>
    </>
  );
}
