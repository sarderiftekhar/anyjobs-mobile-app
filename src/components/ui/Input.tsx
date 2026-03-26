import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  icon,
  isPassword,
  className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`mb-4 ${className ?? ""}`}>
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-text-primary">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-md border bg-white px-3 py-3 ${
          error ? "border-danger" : "border-border"
        }`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color="#6B7280"
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          className="flex-1 text-base text-text-primary"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      )}
    </View>
  );
}
