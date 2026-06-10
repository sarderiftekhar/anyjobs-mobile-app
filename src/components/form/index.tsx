import { useState } from "react";
import { View, Text, TouchableOpacity, Switch, TextInput } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

/** Standard sub-screen header: back chevron + title (+ optional right slot). */
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-1 flex-row items-center">
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.ink.DEFAULT} />
        </TouchableOpacity>
        <Text className="ml-4 flex-1 text-lg font-semibold text-ink" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

/** Label + Switch row, with optional helper text. */
export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 py-3.5">
      <View className="flex-1 pr-4">
        <Text className="text-base text-ink">{label}</Text>
        {description && (
          <Text className="mt-0.5 text-xs text-ink-muted">{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D9E6", true: colors.primary.DEFAULT }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export interface ChipOption {
  label: string;
  value: string;
}

/** Wrapping pressable chips for single/multi select. */
export function ChipSelect({
  options,
  value,
  onChange,
  multiple = true,
}: {
  options: (ChipOption | string)[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
}) {
  const opts: ChipOption[] = options.map((o) =>
    typeof o === "string" ? { label: o, value: o } : o,
  );

  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange(multiple ? [...value, v] : [v]);
    }
  };

  return (
    <View className="flex-row flex-wrap">
      {opts.map((o) => {
        const active = value.includes(o.value);
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => toggle(o.value)}
            className={`mb-2 mr-2 rounded-full border px-3.5 py-2 ${
              active ? "border-primary bg-primary/10" : "border-border bg-surface"
            }`}
          >
            <Text
              className={`text-sm font-medium ${active ? "text-primary" : "text-ink-soft"}`}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Free-text tag input — add chips by typing + Enter / the add button. */
export function TagInput({
  value,
  onChange,
  placeholder = "Add and press +",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setText("");
  };

  return (
    <View>
      <View className="flex-row items-center">
        <View className="mr-2 flex-1 flex-row items-center rounded-xl border border-border bg-surface px-4 min-h-[52px]">
          <TextInput
            className="flex-1 text-base text-ink"
            placeholder={placeholder}
            placeholderTextColor={colors.ink.muted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={add}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity
          onPress={add}
          className="h-[52px] w-[52px] items-center justify-center rounded-xl bg-primary"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {value.length > 0 && (
        <View className="mt-3 flex-row flex-wrap">
          {value.map((tag) => (
            <View
              key={tag}
              className="mb-2 mr-2 flex-row items-center rounded-full bg-primary/10 px-3 py-1.5"
            >
              <Text className="mr-1 text-sm font-medium text-primary">{tag}</Text>
              <TouchableOpacity onPress={() => onChange(value.filter((t) => t !== tag))}>
                <Ionicons name="close-circle" size={16} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
