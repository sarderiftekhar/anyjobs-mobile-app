import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  icon,
  isPassword,
  className,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? "border-danger"
    : focused
      ? "border-primary"
      : "border-border";

  return (
    <View className={`mb-4 ${className ?? ""}`}>
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-ink">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-xl border bg-surface px-4 py-3.5 min-h-[52px] ${borderClass}`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.primary.DEFAULT : colors.ink.muted}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className="flex-1 text-base text-ink"
          placeholderTextColor={colors.ink.muted}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.ink.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="mt-1.5 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-ink-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
