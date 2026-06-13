import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface ChipInputProps {
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  error?: string;
  /** Max characters per chip (backend caps skills/certs at 100). */
  maxLength?: number;
}

/**
 * Tag/chip input: type a value, press the keyboard return or the add button,
 * and it becomes a removable chip. Used for skills and certifications.
 */
export function ChipInput({
  label,
  placeholder = "Type and press enter",
  value,
  onChange,
  hint,
  error,
  maxLength = 100,
}: ChipInputProps) {
  const [text, setText] = useState("");

  const add = () => {
    const v = text.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setText("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-ink">{label}</Text>
      )}
      <View
        className={`flex-row items-center rounded-xl border bg-surface px-4 py-2.5 min-h-[52px] ${
          error ? "border-danger" : "border-border"
        }`}
      >
        <TextInput
          className="flex-1 text-base text-ink"
          placeholder={placeholder}
          placeholderTextColor={colors.ink.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          returnKeyType="done"
          blurOnSubmit={false}
          maxLength={maxLength}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={add} hitSlop={8} className="ml-2">
          <Ionicons name="add-circle" size={24} color={colors.primary.DEFAULT} />
        </TouchableOpacity>
      </View>

      {value.length > 0 && (
        <View className="mt-2 flex-row flex-wrap gap-2">
          {value.map((item) => (
            <TouchableOpacity
              key={item}
              className="flex-row items-center rounded-full bg-primary-light px-3 py-1.5"
              onPress={() => remove(item)}
            >
              <Text className="text-sm font-medium text-primary">{item}</Text>
              <Ionicons
                name="close"
                size={15}
                color={colors.primary.DEFAULT}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? (
        <Text className="mt-1.5 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-ink-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
