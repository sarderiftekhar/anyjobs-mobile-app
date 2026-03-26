import { View, Text } from "react-native";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "gray";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  success: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  danger: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  info: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  gray: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
};

export function Badge({ text, variant = "primary", size = "sm" }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View
      className={`rounded-full border ${styles.bg} ${styles.border} ${
        size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1"
      }`}
    >
      <Text
        className={`font-medium ${styles.text} ${
          size === "sm" ? "text-[11px]" : "text-xs"
        }`}
      >
        {text}
      </Text>
    </View>
  );
}
