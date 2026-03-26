import { useEffect, useRef } from "react";
import { View, Animated, type ViewProps, StyleSheet } from "react-native";

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
      ? styles.elevatedShadow
      : variant === "default"
        ? styles.defaultShadow
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
        className={`rounded-2xl bg-white p-4 ${
          variant === "flat" ? "" : "border border-gray-100"
        } ${className ?? ""}`}
        {...props}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  defaultShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  elevatedShadow: {
    shadowColor: "#574BA6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
});
