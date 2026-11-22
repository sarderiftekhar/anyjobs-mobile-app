import { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  Keyboard,
} from "react-native";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button, OrbitHalo } from "../../src/components/ui";
import { PressableScale } from "../../src/components/animation/PressableScale";
import { enterUp } from "../../src/components/animation/entrance";
import { colors } from "../../src/theme/colors";
import { config } from "../../src/constants/config";
import { openExternalUrl } from "../../src/lib/openExternal";

const LOGO_ASPECT = 509 / 296; // assets/continentjobs-logo.png

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [query, setQuery] = useState("");
  // On a cold start this screen mounts under the launch intro; enterUp waits
  // for the intro to lift so the cascade is actually seen.
  const [enterHeader, enterSearch, enterCtas] = useMemo(
    () => [enterUp(60), enterUp(140), enterUp(220)],
    []
  );

  const submitSearch = () => {
    Keyboard.dismiss();
    const q = query.trim();
    router.push(q ? `/(public)/jobs?q=${encodeURIComponent(q)}` : "/(public)/jobs");
  };

  // Halo radius scales with viewport (width and height) so icons don't clip and
  // the heading + search + CTAs still fit below it on short phones.
  const haloRadius = Math.min(140, screenWidth * 0.33, screenHeight * 0.16);
  const iconSize = Math.min(40, haloRadius * 0.3);
  const haloBox = haloRadius * 2 + iconSize * 1.4;
  // Logo is the hero: as wide as fits comfortably inside the orbit ring.
  const logoWidth = haloRadius * 1.45;

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

      {/* Hero — logo centred inside the orbit halo, heading + search below */}
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={enterHeader}
          style={[s.haloWrap, { width: haloBox, height: haloBox }]}
        >
          <View style={{ position: "absolute" }}>
            <OrbitHalo radius={haloRadius} iconSize={iconSize} />
          </View>
          <View pointerEvents="none">
            <Image
              source={require("../../assets/continentjobs-logo.png")}
              style={{ width: logoWidth, height: logoWidth / LOGO_ASPECT }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View entering={enterSearch} style={s.searchBlock}>
          <Text className="text-center text-xl font-bold text-ink">
            Find your <Text className="text-primary">dream job</Text>
          </Text>

          <View style={s.searchCard}>
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
              <PressableScale
                onPress={submitSearch}
                activeOpacity={0.85}
                scaleTo={0.9}
                style={s.searchBtn}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Search jobs"
              >
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </PressableScale>
            </View>
            <PressableScale onPress={submitSearch} hitSlop={6} activeOpacity={0.6} accessibilityRole="link">
              <Text className="mt-2.5 text-center text-[11px] font-medium text-primary">
                Browse all jobs without signing up →
              </Text>
            </PressableScale>
          </View>
        </Animated.View>
      </View>

      {/* CTAs */}
      <Animated.View
        entering={enterCtas}
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
  haloWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  searchBlock: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    marginTop: 8,
  },
  searchCard: {
    width: "100%",
    marginTop: 14,
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
