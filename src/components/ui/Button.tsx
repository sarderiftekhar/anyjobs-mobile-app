import { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  View,
  type TouchableOpacityProps,
} from "react-native";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-primary-light",
  outline: "bg-transparent border border-primary/30",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-primary",
  outline: "text-primary",
  ghost: "text-primary",
  danger: "text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2.5 px-4 min-h-[36px]",
  md: "py-3 px-5 min-h-[44px]",
  lg: "py-4 px-6 min-h-[52px]",
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const showBrandShadow = variant === "primary" && !isDisabled;

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, showBrandShadow && shadows.brand, style]}
    >
      <TouchableOpacity
        className={`flex-row items-center justify-center rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
        disabled={isDisabled}
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" || variant === "danger" ? "#fff" : colors.primary.DEFAULT}
          />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text
              className={`font-semibold ${variantTextStyles[variant]} ${sizeTextStyles[size]}`}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
