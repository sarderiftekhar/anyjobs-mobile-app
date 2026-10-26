import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input } from "../ui";
import { useAuthStore } from "../../stores/authStore";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  /** What gets deleted, shown under the title (differs per role). */
  description: string;
}

/**
 * Confirms account deletion (App Store Guideline 5.1.1(v)). The backend
 * requires the password for accounts that have one, so a leaked token alone
 * can't delete an account. Google-only accounts have no password to enter.
 */
export function DeleteAccountModal({
  visible,
  onClose,
  description,
}: DeleteAccountModalProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Older API versions don't send has_password: ask for it unless we know the
  // account is Google-only, and let Google users leave it blank.
  const askPassword = user?.has_password !== false;
  const passwordOptional = user?.has_password === undefined && !!user?.has_google;

  useEffect(() => {
    if (!visible) {
      setPassword("");
      setError(null);
    }
  }, [visible]);

  const handleDelete = async () => {
    if (askPassword && !passwordOptional && !password) {
      setError("Enter your password to delete your account.");
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount(askPassword && password ? password : undefined);
      // Auth state is cleared; the root redirect sends the user to welcome.
    } catch (err: any) {
      setError(err?.message ?? "We couldn't delete your account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View
          className="rounded-t-3xl bg-white px-6 pt-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <Ionicons name="trash-outline" size={26} color="#DC2626" />
          </View>
          <Text className="text-xl font-bold text-ink">Delete your account?</Text>
          <Text className="mt-2 text-sm leading-5 text-ink-muted">{description}</Text>

          {askPassword ? (
            <View className="mt-5">
              <Input
                label={passwordOptional ? "Password (leave blank if you only use Google)" : "Password"}
                placeholder="Enter your password"
                isPassword
                autoCapitalize="none"
                autoComplete="password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) setError(null);
                }}
                error={error ?? undefined}
              />
            </View>
          ) : error ? (
            <Text className="mt-4 text-sm text-red-600">{error}</Text>
          ) : null}

          <View className="mt-6" style={{ gap: 10 }}>
            <Button
              title="Delete Account"
              variant="danger"
              loading={deleting}
              onPress={handleDelete}
            />
            <Button title="Cancel" variant="outline" disabled={deleting} onPress={onClose} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
