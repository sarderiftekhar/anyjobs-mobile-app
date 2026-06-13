import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  /** Show a search box inside the picker (default: auto when > 8 options). */
  searchable?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Labeled select field that opens a bottom-sheet modal picker.
 * Optionally searchable — used for long lists (industry, currency).
 */
export function Select({
  label,
  placeholder = "Select...",
  value,
  options,
  onChange,
  error,
  searchable,
  icon,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const showSearch = searchable ?? options.length > 8;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-ink">{label}</Text>
      )}
      <TouchableOpacity
        className={`flex-row items-center rounded-xl border bg-surface px-4 py-3.5 min-h-[52px] ${
          error ? "border-danger" : "border-border"
        }`}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.ink.muted}
            style={{ marginRight: 10 }}
          />
        )}
        <Text
          className={`flex-1 text-base ${selected ? "text-ink" : "text-ink-muted"}`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.ink.muted} />
      </TouchableOpacity>
      {error ? <Text className="mt-1.5 text-xs text-danger">{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={close}
        >
          <View className="mt-auto max-h-[75%] rounded-t-3xl bg-white pt-3">
            <View className="mb-2 h-1.5 w-12 self-center rounded-full bg-border" />
            <View className="flex-row items-center justify-between px-5 pb-2">
              <Text className="text-lg font-semibold text-ink">
                {label ?? "Select"}
              </Text>
              <TouchableOpacity onPress={close} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.ink.DEFAULT} />
              </TouchableOpacity>
            </View>

            {showSearch && (
              <View className="mx-5 mb-2 flex-row items-center rounded-xl border border-border px-3 py-2.5">
                <Ionicons name="search" size={18} color={colors.ink.muted} />
                <TextInput
                  className="ml-2 flex-1 text-base text-ink"
                  placeholder="Search..."
                  placeholderTextColor={colors.ink.muted}
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <FlatList
              data={filtered}
              keyExtractor={(o) => o.value}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    className="flex-row items-center justify-between border-b border-border/60 px-5 py-3.5"
                    onPress={() => {
                      onChange(item.value);
                      close();
                    }}
                  >
                    <Text
                      className={`flex-1 text-base ${active ? "font-semibold text-primary" : "text-ink"}`}
                    >
                      {item.label}
                    </Text>
                    {active && (
                      <Ionicons name="checkmark" size={20} color={colors.primary.DEFAULT} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text className="px-5 py-6 text-center text-sm text-ink-muted">
                  No matches
                </Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
