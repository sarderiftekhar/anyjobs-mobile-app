import { useEffect, useRef } from "react";
import { View, Animated, type ViewProps } from "react-native";
import { shadows } from "../../theme/shadows";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "flat" | "elevated";
  animated?: boolean;
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
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? 15 : 0)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, delay]);

  const shadowStyle =
    variant === "elevated"
      ? shadows.cardHover
      : variant === "default"
        ? shadows.card
        : undefined;

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        shadowStyle,
        style,
      ]}
    >
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
