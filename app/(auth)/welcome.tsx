import { View, Text } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      <View className="flex-1 bg-primary">
        <View className="flex-1 items-center justify-center px-8">
          {/* Logo placeholder */}
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-2xl bg-white/20">
            <Text className="text-4xl font-bold text-white">AJ</Text>
          </View>

          <Text className="mt-4 text-center text-3xl font-bold text-white">
            Find Your Dream Job
          </Text>
          <Text className="mt-2 text-center text-base text-white/80">
            Connect with top employers and discover opportunities that match your skills
          </Text>
        </View>

        <View
          className="px-6 pb-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Button
            title="Get Started"
            variant="secondary"
            size="lg"
            className="mb-3 bg-white"
            onPress={() => router.push("/(auth)/register")}
          />
          <Button
            title="I already have an account"
            variant="ghost"
            size="lg"
            className="border border-white/30"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    </View>
  );
}
