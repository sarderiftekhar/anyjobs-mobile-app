import {
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from "react-native";
import { PressableScale } from "../animation/PressableScale";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonRadius = "full" | "xl" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  /** Corner radius. "full" (default) is a pill; "xl"/"lg" are rounded rectangles. */
  radius?: ButtonRadius;
}

const radiusStyles: Record<ButtonRadius, string> = {
  full: "rounded-full",
  xl: "rounded-xl",
  lg: "rounded-lg",
};

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
  radius = "full",
  activeOpacity = 0.85,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const showBrandShadow = variant === "primary" && !isDisabled;

  // Same two-layer shape as before: `style` (and the brand shadow) sit on the
  // outer, scaling pressable; `className` styles the inner surface.
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      activeOpacity={activeOpacity}
      {...(props as Omit<TouchableOpacityProps, "style">)}
      disabled={isDisabled}
      style={[showBrandShadow && shadows.brand, style]}
    >
      <View
        className={`flex-row items-center justify-center ${radiusStyles[radius]} ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
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
      </View>
    </PressableScale>
  );
}
