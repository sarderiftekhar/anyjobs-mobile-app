import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; px: number }> = {
  sm: { container: "h-8 w-8", text: "text-[10px]", px: 32 },
  md: { container: "h-11 w-11", text: "text-xs", px: 44 },
  lg: { container: "h-14 w-14", text: "text-base", px: 56 },
  xl: { container: "h-20 w-20", text: "text-xl", px: 80 },
};

export function Avatar({ uri, name, size = "md" }: AvatarProps) {
  const s = sizeMap[size];

  if (uri) {
    return (
      <View style={[{ width: s.px, height: s.px, borderRadius: s.px / 2 }, styles.ring]}>
        <Image
          source={{ uri }}
          style={{ width: s.px - 2, height: s.px - 2, borderRadius: (s.px - 2) / 2 }}
          contentFit="cover"
        />
      </View>
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <LinearGradient
      colors={["#574BA6", "#A79AFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: s.px,
        height: s.px,
        borderRadius: s.px / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text className={`font-bold text-white ${s.text}`}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: "#E8E5FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
