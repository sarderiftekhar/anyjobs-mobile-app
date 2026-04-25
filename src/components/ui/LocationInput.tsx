import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { publicApiClient } from "../../api/client";
import { colors } from "../../theme/colors";

interface LocationSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface LocationInputProps {
  value: string;
  onSelect: (location: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export function LocationInput({
  value,
  onSelect,
  placeholder = "City, region, or country...",
  compact = false,
}: LocationInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await publicApiClient.get("/location/autocomplete", {
        params: { input: text },
      });
      const data = response.data?.data ?? [];
      setSuggestions(data);
      if (data.length > 0) setShowSuggestions(true);
    } catch (err) {
      console.log("[LocationInput] autocomplete error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (text.length === 0) onSelect("");
      return;
    }

    timerRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 400);
  };

  const handleSelect = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.description);
    onSelect(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery("");
    onSelect("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (query.length >= 2) {
      onSelect(query);
      setShowSuggestions(false);
    }
  };

  return (
    <View style={s.wrapper}>
      <View
        style={[
          s.inputRow,
          compact ? s.inputCompact : s.inputNormal,
          focused && { borderColor: colors.primary.DEFAULT },
        ]}
      >
        <Ionicons
          name="location-outline"
          size={compact ? 16 : 18}
          color={focused ? colors.primary.DEFAULT : colors.ink.muted}
        />
        <TextInput
          style={[s.input, compact ? s.inputTextCompact : s.inputTextNormal]}
          placeholder={placeholder}
          placeholderTextColor={colors.ink.muted}
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => {
            setFocused(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {isLoading && <ActivityIndicator size="small" color={colors.primary.DEFAULT} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.borderStrong} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={s.dropdown}>
          {suggestions.slice(0, 5).map((item, index) => (
            <TouchableOpacity
              key={item.place_id}
              style={[s.suggestionItem, index > 0 && s.suggestionBorder]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.6}
            >
              <View style={s.suggestionIcon}>
                <Ionicons name="location" size={14} color={colors.primary.DEFAULT} />
              </View>
              <View style={s.suggestionText}>
                <Text style={s.mainText} numberOfLines={1}>
                  {item.main_text}
                </Text>
                <Text style={s.secondaryText} numberOfLines={1}>
                  {item.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 999,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
  },
  inputCompact: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 52,
  },
  inputNormal: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 56,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: colors.ink.DEFAULT,
    paddingVertical: 0,
  },
  inputTextCompact: {
    fontSize: 15,
  },
  inputTextNormal: {
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
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
    backgroundColor: colors.primary.light,
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
});
