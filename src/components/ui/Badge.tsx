import { View, Text } from "react-native";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/10", text: "text-success" },
  warning: { bg: "bg-warning/15", text: "text-warning" },
  danger: { bg: "bg-danger/10", text: "text-danger" },
  info: { bg: "bg-info/10", text: "text-info" },
  neutral: { bg: "bg-background", text: "text-ink-soft" },
};

export function Badge({ text, variant = "primary", size = "sm" }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View
      className={`rounded-full ${styles.bg} ${
        size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1"
      }`}
    >
      <Text
        className={`font-semibold ${styles.text} ${
          size === "sm" ? "text-[11px]" : "text-xs"
        }`}
      >
        {text}
      </Text>
    </View>
  );
}
