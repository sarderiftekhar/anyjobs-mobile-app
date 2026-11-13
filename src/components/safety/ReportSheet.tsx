import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../ui";

export interface ReportReasonOption<R extends string> {
  value: R;
  label: string;
}

interface ReportSheetProps<R extends string> {
  visible: boolean;
  title: string;
  subtitle?: string;
  reasons: ReportReasonOption<R>[];
  onClose: () => void;
  /** Throw to keep the sheet open and show the error. */
  onSubmit: (reason: R, details: string) => Promise<void>;
}

/** Bottom sheet: pick a reason, optionally add details, send. */
export function ReportSheet<R extends string>({
  visible,
  title,
  subtitle,
  reasons,
  onClose,
  onSubmit,
}: ReportSheetProps<R>) {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<R | null>(null);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setReason(null);
      setDetails("");
      setError(null);
    }
  }, [visible]);

  const submit = async () => {
    if (!reason) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(reason, details.trim());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Couldn't send the report. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="rounded-t-3xl bg-white px-5 pt-5" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="mb-3 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Ionicons name="flag-outline" size={18} color="#DC2626" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-ink">{title}</Text>
              {subtitle ? <Text className="text-xs text-ink-muted">{subtitle}</Text> : null}
            </View>
          </View>

          {reasons.map((r) => {
            const active = reason === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                activeOpacity={0.8}
                onPress={() => setReason(r.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                className={`mt-2 flex-row items-center rounded-xl border px-4 ${
                  active ? "border-primary bg-primary-light" : "border-border bg-white"
                }`}
                style={{ minHeight: 48 }}
              >
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={active ? "#0064EC" : "#9CA3AF"}
                />
                <Text className="ml-3 text-sm text-ink">{r.label}</Text>
              </TouchableOpacity>
            );
          })}

          <TextInput
            className="mt-3 min-h-[72px] rounded-xl border border-border bg-gray-50 px-4 py-3 text-sm text-ink"
            placeholder="Anything else we should know? (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            maxLength={1000}
            value={details}
            onChangeText={setDetails}
          />

          {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

          <View className="mt-4" style={{ gap: 10 }}>
            <Button title="Send report" variant="danger" disabled={!reason} loading={sending} onPress={submit} />
            <Button title="Cancel" variant="outline" disabled={sending} onPress={onClose} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
