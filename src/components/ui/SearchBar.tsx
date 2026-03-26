import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onFilterPress,
}: SearchBarProps) {
  return (
    <View style={s.row}>
      <View style={s.inputWrap}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Ionicons name="close-circle" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>
      {onFilterPress && (
        <TouchableOpacity style={s.filterBtn} onPress={onFilterPress} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={22} color="#574BA6" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
});
