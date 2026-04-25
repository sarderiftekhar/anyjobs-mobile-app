import { useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  withDecay,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

export type OrbitItem = {
  icon: IoniconName;
  color?: string;
  bg?: string;
};

type Props = {
  items?: OrbitItem[];
  radius?: number;
  iconSize?: number;
  autoSpin?: boolean;
};

const DEFAULT_ITEMS: OrbitItem[] = [
  { icon: "code-slash-outline" },
  { icon: "color-palette-outline" },
  { icon: "megaphone-outline" },
  { icon: "medkit-outline" },
  { icon: "cash-outline" },
  { icon: "restaurant-outline" },
  { icon: "construct-outline" },
  { icon: "school-outline" },
  { icon: "cart-outline" },
  { icon: "car-outline" },
  { icon: "airplane-outline" },
  { icon: "camera-outline" },
  { icon: "musical-notes-outline" },
  { icon: "briefcase-outline" },
];

function fibonacciSphere(n: number) {
  const points: { x: number; y: number; z: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * goldenAngle;
    points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return points;
}

export function OrbitHalo({
  items = DEFAULT_ITEMS,
  radius = 130,
  iconSize = 40,
  autoSpin = true,
}: Props) {
  const points = useMemo(() => fibonacciSphere(items.length), [items.length]);

  const yaw = useSharedValue(0);
  const pitch = useSharedValue(0);
  const isPanning = useSharedValue(false);

  useFrameCallback(() => {
    "worklet";
    if (autoSpin && !isPanning.value) {
      yaw.value += 0.004;
    }
  });

  const pan = Gesture.Pan()
    .onStart(() => {
      isPanning.value = true;
    })
    .onChange((e) => {
      yaw.value += e.changeX * 0.008;
      const nextPitch = pitch.value + e.changeY * 0.008;
      const limit = Math.PI / 2;
      pitch.value = Math.max(-limit, Math.min(limit, nextPitch));
    })
    .onEnd((e) => {
      isPanning.value = false;
      yaw.value = withDecay({
        velocity: e.velocityX * 0.008,
        deceleration: 0.998,
      });
      pitch.value = withDecay({
        velocity: e.velocityY * 0.008,
        deceleration: 0.998,
        clamp: [-Math.PI / 2, Math.PI / 2],
      });
    });

  const boxSize = radius * 2 + iconSize * 1.4;

  return (
    <GestureDetector gesture={pan}>
      <View
        style={{
          width: boxSize,
          height: boxSize,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {items.map((item, i) => (
          <OrbitIcon
            key={i}
            point={points[i]}
            yaw={yaw}
            pitch={pitch}
            radius={radius}
            size={iconSize}
            item={item}
          />
        ))}
      </View>
    </GestureDetector>
  );
}

type OrbitIconProps = {
  point: { x: number; y: number; z: number };
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  radius: number;
  size: number;
  item: OrbitItem;
};

function OrbitIcon({ point, yaw, pitch, radius, size, item }: OrbitIconProps) {
  const style = useAnimatedStyle(() => {
    "worklet";
    const cy = Math.cos(yaw.value);
    const sy = Math.sin(yaw.value);
    const cp = Math.cos(pitch.value);
    const sp = Math.sin(pitch.value);

    const x1 = point.x * cy + point.z * sy;
    const y1 = point.y;
    const z1 = -point.x * sy + point.z * cy;

    const x2 = x1;
    const y2 = y1 * cp - z1 * sp;
    const z2 = y1 * sp + z1 * cp;

    const depth = (z2 + 1) / 2;
    const scale = 0.55 + depth * 0.5;
    const opacity = 0.35 + depth * 0.65;

    return {
      transform: [
        { translateX: x2 * radius },
        { translateY: y2 * radius },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: item.bg ?? "rgba(0, 100, 236, 0.10)",
        },
        style,
      ]}
    >
      <Ionicons
        name={item.icon}
        size={size * 0.55}
        color={item.color ?? "#0064EC"}
      />
    </Animated.View>
  );
}
