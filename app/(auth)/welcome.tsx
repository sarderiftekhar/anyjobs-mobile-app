import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeIn, FadeOut, FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Button, OrbitHalo } from "../../src/components/ui";
import { colors } from "../../src/theme/colors";

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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Halo radius scales with viewport — compact phones don't get clipped, big screens fill
  const haloRadius = Math.min(140, SCREEN_WIDTH * 0.36);

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Decorative tinted backdrop behind halo */}
      <View pointerEvents="none" style={s.backdropWrap}>
        <LinearGradient
          colors={[colors.primary.light, "rgba(229,240,254,0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={s.backdrop}
        />
      </View>

      {/* Header — logo + display tagline */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(100)}
        className="items-center px-8 pt-12"
      >
        <Image
          source={require("../../assets/anyjobs-logo.png")}
          style={{ width: 168, height: 64 }}
          resizeMode="contain"
        />
        <Text className="mt-7 text-center text-4xl font-bold text-ink leading-[1.1]">
          Find your{"\n"}
          <Text className="text-primary">dream job</Text>
        </Text>
      </Animated.View>

      {/* Halo + rotating tagline */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center justify-center">
          <View style={{ position: "absolute" }}>
            <OrbitHalo radius={haloRadius} iconSize={Math.min(46, haloRadius * 0.34)} />
          </View>

          {/* Tagline pill — compact, brand-tinted border */}
          <View style={s.taglineCard}>
            <Animated.Text
              key={taglineIndex}
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
              className="text-center text-sm font-medium text-ink-soft leading-5"
            >
              {TAGLINES[taglineIndex]}
            </Animated.Text>
          </View>
        </View>
      </View>

      {/* CTAs */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        className="px-6"
        style={{ paddingBottom: insets.bottom + 28 }}
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
        <Text className="mt-5 text-center text-xs text-ink-muted">
          By continuing, you agree to our{" "}
          <Text className="font-semibold text-primary">Terms</Text> and{" "}
          <Text className="font-semibold text-primary">Privacy Policy</Text>.
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  backdropWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
    overflow: "hidden",
  },
  backdrop: {
    flex: 1,
  },
  taglineCard: {
    maxWidth: 240,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: colors.border,
  },
});
