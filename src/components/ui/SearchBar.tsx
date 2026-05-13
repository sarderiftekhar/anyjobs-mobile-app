import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import {
  fetchSearchSuggestions,
  type SearchSuggestion,
} from "../../api/suggestions";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  // When provided, the SearchBar fetches and shows job/skill/company
  // suggestions as the user types, and calls this when one is picked.
  onSelectSuggestion?: (label: string, suggestion: SearchSuggestion) => void;
}

const TYPE_META: Record<
  SearchSuggestion["type"],
  { icon: keyof typeof Ionicons.glyphMap; tint: string; label: string }
> = {
  role: { icon: "briefcase", tint: colors.primary.DEFAULT, label: "Role" },
  skill: { icon: "sparkles", tint: "#7C3AED", label: "Skill" },
  company: { icon: "business", tint: "#0EA5E9", label: "Company" },
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onFilterPress,
  onSelectSuggestion,
}: SearchBarProps) {
  const suggestEnabled = !!onSelectSuggestion;
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!suggestEnabled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      try {
        const results = await fetchSearchSuggestions(q, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          if (results.length > 0) setShowDropdown(true);
        }
      } catch {
        // ignored — suggestion failures shouldn't disrupt typing
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, suggestEnabled]);

  const handleSelect = (item: SearchSuggestion) => {
    setShowDropdown(false);
    setSuggestions([]);
    onChangeText(item.label);
    onSelectSuggestion?.(item.label, item);
  };

  const handleClear = () => {
    onChangeText("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <View style={s.wrapper}>
      <View style={s.row}>
        <View style={[s.inputWrap, focused && { borderColor: colors.primary.DEFAULT }]}>
          <Ionicons name="search-outline" size={20} color={colors.ink.muted} />
          <TextInput
            style={s.input}
            placeholder={placeholder}
            placeholderTextColor={colors.ink.muted}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => {
              setFocused(true);
              if (suggestEnabled && suggestions.length > 0) setShowDropdown(true);
            }}
            onBlur={() => {
              setFocused(false);
              setTimeout(() => setShowDropdown(false), 200);
            }}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {isLoading && (
            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
          )}
          {value.length > 0 && !isLoading && (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.borderStrong} />
            </TouchableOpacity>
          )}
        </View>
        {onFilterPress && (
          <TouchableOpacity style={s.filterBtn} onPress={onFilterPress} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {suggestEnabled && showDropdown && suggestions.length > 0 && (
        <View style={s.dropdown}>
          {suggestions.map((item, index) => {
            const meta = TYPE_META[item.type];
            return (
              <TouchableOpacity
                key={item.key}
                style={[s.suggestionItem, index > 0 && s.suggestionBorder]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.6}
              >
                <View style={[s.suggestionIcon, { backgroundColor: `${meta.tint}1A` }]}>
                  <Ionicons name={meta.icon} size={14} color={meta.tint} />
                </View>
                <View style={s.suggestionText}>
                  <Text style={s.mainText} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {item.sublabel ? (
                    <Text style={s.secondaryText} numberOfLines={1}>
                      {item.sublabel}
                    </Text>
                  ) : null}
                </View>
                <Text style={[s.typeTag, { color: meta.tint }]}>{meta.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 1000,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink.DEFAULT,
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    // align under the input only (don't overlap the filter button)
    right: 62,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(10,37,64,0.12)",
      },
      default: {
        shadowColor: colors.brand.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
    zIndex: 9999,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
  },
  mainText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink.DEFAULT,
  },
  secondaryText: {
    fontSize: 12,
    color: colors.ink.muted,
    marginTop: 1,
  },
  typeTag: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
