import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, OrbitHalo } from "../../src/components/ui";

const TAGLINES = [
  "Connect with top employers and discover opportunities that match your skills",
  "Your next career move is just a tap away",
  "Thousands of jobs across every industry, updated daily",
  "Let recruiters come to you — build a profile that stands out",
  "Apply in seconds with your saved CV",
  "Track every application, interview, and offer in one place",
  "Remote, hybrid, on-site — filter to find the right fit",
  "Join a community where ambition meets opportunity",
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="items-center px-8 pt-20">
        <Image
          source={require("../../assets/anyjobs-logo.png")}
          style={{ width: 200, height: 80 }}
          resizeMode="contain"
        />
        <Text className="mt-6 text-center text-3xl font-bold text-text-primary">
          Find Your Dream Job
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="items-center justify-center">
          <View style={{ position: "absolute" }}>
            <OrbitHalo radius={120} iconSize={40} />
          </View>
          <View className="max-w-[220px] rounded-2xl bg-white/90 px-3 py-2">
            <Animated.Text
              key={taglineIndex}
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
              className="text-center text-sm text-text-secondary"
            >
              {TAGLINES[taglineIndex]}
            </Animated.Text>
          </View>
        </View>
      </View>

      <View
        className="px-6"
        style={{ paddingBottom: insets.bottom + 40 }}
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
