import { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, OrbitHalo } from "../../src/components/ui";
import { colors } from "../../src/theme/colors";
import { config } from "../../src/constants/config";
import { openExternalUrl } from "../../src/lib/openExternal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const submitSearch = () => {
    Keyboard.dismiss();
    const q = query.trim();
    router.push(q ? `/(public)/jobs?q=${encodeURIComponent(q)}` : "/(public)/jobs");
  };

  // Halo radius scales with viewport — leave room at the edges so icons don't clip
  const haloRadius = Math.min(140, SCREEN_WIDTH * 0.33);

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

      {/* Header — logo + heading */}
      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={s.headerWrap}>
        <View style={s.headerInner}>
          <Image
            source={require("../../assets/anyjobs-logo.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <Text className="mt-4 text-center text-3xl font-bold text-ink leading-[1.1]">
            Find your <Text className="text-primary">dream job</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Orbit halo with search input centered inside */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center justify-center">
          <View style={{ position: "absolute" }}>
            <OrbitHalo radius={haloRadius} iconSize={Math.min(44, haloRadius * 0.32)} />
          </View>

          {/* Search card — sits where the tagline used to */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={s.searchCard}
          >
            <View style={s.searchWrap}>
              <Ionicons name="search-outline" size={18} color={colors.ink.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={submitSearch}
                returnKeyType="search"
                placeholder="Search jobs, companies…"
                placeholderTextColor={colors.ink.muted}
                style={s.searchInput}
              />
              <TouchableOpacity
                onPress={submitSearch}
                activeOpacity={0.85}
                style={s.searchBtn}
                hitSlop={6}
              >
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={submitSearch} hitSlop={6}>
              <Text className="mt-2.5 text-center text-[11px] font-medium text-primary">
                Browse all jobs without signing up →
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* CTAs */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(300)}
        style={{ paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}
      >
        <View style={s.ctaInner}>
          <Button
            title="Get Started"
            variant="primary"
            size="md"
            className="mb-2.5"
            onPress={() => router.push("/(auth)/register")}
          />
          <Button
            title="I already have an account"
            variant="outline"
            size="md"
            onPress={() => router.push("/(auth)/login")}
          />
          <Text className="mt-3.5 text-center text-[11px] text-ink-muted">
            By continuing, you agree to our{" "}
            <Text
              className="font-semibold text-primary"
              onPress={() => openExternalUrl(config.TERMS_URL)}
              suppressHighlighting
            >
              Terms
            </Text>{" "}
            and{" "}
            <Text
              className="font-semibold text-primary"
              onPress={() => openExternalUrl(config.PRIVACY_POLICY_URL)}
              suppressHighlighting
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
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
  headerWrap: {
    width: "100%",
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  headerInner: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 52,
    alignSelf: "center",
  },
  searchCard: {
    width: 260,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    shadowColor: colors.brand.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.ink.DEFAULT,
    paddingVertical: 6,
  },
  searchBtn: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaInner: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
});
