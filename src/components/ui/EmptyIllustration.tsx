import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface EmptyIllustrationProps {
  icon?: keyof typeof Ionicons.glyphMap;
  // Optional small icons that float around the main disc.
  satellites?: (keyof typeof Ionicons.glyphMap)[];
  size?: number;
}

const DEFAULT_SATELLITES: (keyof typeof Ionicons.glyphMap)[] = [
  "sparkles",
  "star",
  "checkmark-circle",
  "ellipse",
];

// Branded illustration for empty states.
// Layered concentric brand-tinted discs with a centered icon, plus floating
// satellite icons that drift in/out for life. Renders in pure RN — no SVG asset.
export function EmptyIllustration({
  icon = "search",
  satellites = DEFAULT_SATELLITES,
  size = 160,
}: EmptyIllustrationProps) {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const inner = size * 0.62;
  const radius = size / 2 - 8;

  const satellitePositions = [
    { angle: -45, dx: -1, dy: -1 },
    { angle: 30, dx: 1, dy: -1 },
    { angle: 110, dx: 1, dy: 1 },
    { angle: 200, dx: -1, dy: 1 },
  ];

  return (
    <View style={[s.wrapper, { width: size, height: size }]}>
      {/* Outer halo */}
      <View
        style={[
          s.disc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primary.light,
          },
        ]}
      />
      {/* Mid halo */}
      <View
        style={[
          s.disc,
          {
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: (size * 0.82) / 2,
            backgroundColor: "rgba(0,100,236,0.12)",
          },
        ]}
      />
      {/* Inner brand disc with icon */}
      <View
        style={[
          s.disc,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: colors.primary.DEFAULT,
            shadowColor: colors.primary.DEFAULT,
            shadowOpacity: 0.3,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          },
        ]}
      >
        <Ionicons name={icon} size={inner * 0.4} color="#FFFFFF" />
      </View>

      {/* Satellites — floating accent icons */}
      {satellitePositions.map((pos, i) => (
        <Satellite
          key={i}
          float={float}
          radius={radius}
          angle={pos.angle}
          drift={pos}
          icon={satellites[i % satellites.length]}
          delay={i * 200}
        />
      ))}
    </View>
  );
}

function Satellite({
  float,
  radius,
  angle,
  drift,
  icon,
  delay,
}: {
  float: Animated.SharedValue<number>;
  radius: number;
  angle: number;
  drift: { dx: number; dy: number };
  icon: keyof typeof Ionicons.glyphMap;
  delay: number;
}) {
  const rad = (angle * Math.PI) / 180;
  const baseX = Math.cos(rad) * radius;
  const baseY = Math.sin(rad) * radius;

  const style = useAnimatedStyle(() => {
    "worklet";
    const t = float.value;
    return {
      transform: [
        { translateX: baseX + drift.dx * 4 * t },
        { translateY: baseY + drift.dy * 4 * t },
        { scale: 0.92 + 0.16 * t },
      ],
      opacity: 0.55 + 0.45 * t,
    };
  });

  return (
    <Animated.View style={[s.satellite, style]}>
      <Ionicons name={icon} size={14} color={colors.primary.DEFAULT} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  disc: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  satellite: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A2540",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
