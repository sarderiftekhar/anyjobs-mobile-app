import { useMemo } from "react";
import { View, type ViewProps } from "react-native";
import Animated from "react-native-reanimated";
import { enterUp } from "../animation/entrance";
import { shadows } from "../../theme/shadows";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "flat" | "elevated";
  /** Fade/rise in when the card mounts (Reanimated entering). Default true. */
  animated?: boolean;
  /** Entrance delay in ms (e.g. for staggering cards in a list). */
  delay?: number;
}

export function Card({
  children,
  variant = "default",
  animated = true,
  delay = 0,
  className,
  style,
  ...props
}: CardProps) {
  // Layout animations only run on mount, so a re-render or refetch never
  // replays them. Memoised so we don't rebuild the animation every render.
  const entering = useMemo(() => (animated ? enterUp(delay) : undefined), [animated, delay]);

  const shadowStyle =
    variant === "elevated"
      ? shadows.cardHover
      : variant === "default"
        ? shadows.card
        : undefined;

  return (
    <Animated.View entering={entering} style={[shadowStyle, style]}>
      <View
        className={`rounded-2xl bg-surface p-4 ${
          variant === "flat" ? "" : "border border-border"
        } ${className ?? ""}`}
        {...props}
      >
        {children}
      </View>
    </Animated.View>
  );
}
