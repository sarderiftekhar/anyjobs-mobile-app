import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ScreeningAnswer, ScreeningQuestion } from "../../types/job";

interface Props {
  question: ScreeningQuestion;
  value: ScreeningAnswer | undefined;
  onChange: (value: ScreeningAnswer) => void;
  error?: string;
}

function Choice({
  label,
  selected,
  multi,
  onPress,
}: {
  label: string;
  selected: boolean;
  multi?: boolean;
  onPress: () => void;
}) {
  const icon = multi
    ? selected ? "checkbox" : "square-outline"
    : selected ? "radio-button-on" : "radio-button-off";
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`mt-2 flex-row items-center rounded-xl border px-4 ${
        selected ? "border-primary bg-primary-light" : "border-border bg-white"
      }`}
      style={{ minHeight: 48 }}
    >
      <Ionicons name={icon} size={20} color={selected ? "#0064EC" : "#9CA3AF"} />
      <Text className="ml-3 flex-1 text-sm text-ink">{label}</Text>
    </TouchableOpacity>
  );
}

/** One employer screening question, rendered for its type (ScreeningService::TYPES). */
export function ScreeningQuestionField({ question, value, onChange, error }: Props) {
  const text = typeof value === "string" ? value : "";
  const list = Array.isArray(value) ? value : [];

  let input: React.ReactNode;
  switch (question.type) {
    case "yes_no":
      input = (
        <View className="flex-row" style={{ gap: 8 }}>
          {["yes", "no"].map((v) => (
            <View key={v} className="flex-1">
              <Choice
                label={v === "yes" ? "Yes" : "No"}
                selected={text === v}
                onPress={() => onChange(v)}
              />
            </View>
          ))}
        </View>
      );
      break;
    case "single_choice":
      input = question.options.map((opt) => (
        <Choice key={opt} label={opt} selected={text === opt} onPress={() => onChange(opt)} />
      ));
      break;
    case "multi_choice":
      input = question.options.map((opt) => (
        <Choice
          key={opt}
          label={opt}
          multi
          selected={list.includes(opt)}
          onPress={() =>
            onChange(list.includes(opt) ? list.filter((o) => o !== opt) : [...list, opt])
          }
        />
      ));
      break;
    case "number":
      input = (
        <TextInput
          className="mt-2 rounded-md border border-border bg-gray-50 px-4 py-3 text-sm text-ink"
          keyboardType="numeric"
          placeholder="Enter a number"
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={(t) => onChange(t.replace(/[^0-9.\-]/g, ""))}
        />
      );
      break;
    case "short_text":
      input = (
        <TextInput
          className="mt-2 rounded-md border border-border bg-gray-50 px-4 py-3 text-sm text-ink"
          placeholder="Your answer"
          placeholderTextColor="#9CA3AF"
          maxLength={500}
          value={text}
          onChangeText={onChange}
        />
      );
      break;
    default:
      input = (
        <TextInput
          className="mt-2 min-h-[110px] rounded-md border border-border bg-gray-50 p-4 text-sm text-ink"
          multiline
          textAlignVertical="top"
          placeholder="Your answer"
          placeholderTextColor="#9CA3AF"
          maxLength={5000}
          value={text}
          onChangeText={onChange}
        />
      );
  }

  return (
    <View className="mt-5">
      <Text className="text-sm font-semibold text-ink">
        {question.label}
        {question.required ? <Text className="text-red-600"> *</Text> : null}
      </Text>
      {input}
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}

/** True when the answer counts as given (matches ScreeningService::cleanValue). */
export function isAnswered(value: ScreeningAnswer | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return !!value && value.trim() !== "";
}
