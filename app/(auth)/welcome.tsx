import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={require("../../assets/anyjobs-logo.png")}
          style={{ width: 240, height: 96 }}
          resizeMode="contain"
        />

        <Text className="mt-8 text-center text-3xl font-bold text-text-primary">
          Find Your Dream Job
        </Text>
        <Text className="mt-2 text-center text-base text-text-secondary">
          Connect with top employers and discover opportunities that match your skills
        </Text>
      </View>

      <View
        className="px-6 pb-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          title="Get Started"
          variant="primary"
          size="lg"
          className="mb-3"
          onPress={() => router.push("/(auth)/register")}
        />
        <Button
          title="I already have an account"
          variant="outline"
          size="lg"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </View>
  );
}
