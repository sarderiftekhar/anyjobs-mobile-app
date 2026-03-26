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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
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

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (text.length === 0) onSelect("");
      return;
    }

    // Debounce 400ms
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

  // Also trigger search on submit (Enter key)
  const handleSubmit = () => {
    if (query.length >= 2) {
      onSelect(query);
      setShowSuggestions(false);
    }
  };

  return (
    <View style={s.wrapper}>
      <View style={[s.inputRow, compact ? s.inputCompact : s.inputNormal]}>
        <Ionicons name="location-outline" size={compact ? 16 : 18} color="#9CA3AF" />
        <TextInput
          style={[s.input, compact ? s.inputTextCompact : s.inputTextNormal]}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          onBlur={() => {
            // Delay hiding so tap on suggestion registers
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {isLoading && <ActivityIndicator size="small" color="#574BA6" />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions dropdown */}
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
                <Ionicons name="location" size={14} color="#574BA6" />
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
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
  },
  inputCompact: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  inputNormal: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#1F2937",
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
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      },
      default: {
        shadowColor: "#000",
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
    borderTopColor: "#F3F4F6",
  },
  suggestionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F0EEFF",
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
    color: "#1F2937",
  },
  secondaryText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },
});
