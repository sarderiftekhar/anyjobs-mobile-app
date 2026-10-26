import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input } from "../ui";
import { useAuthStore } from "../../stores/authStore";
import { isGoogleSignInAvailable, signInWithGoogle } from "../../lib/googleSignIn";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  /** What gets deleted, shown under the title (differs per role). */
  description: string;
}

/**
 * Confirms account deletion (App Store Guideline 5.1.1(v)). The backend wants
 * proof it's the owner, so a leaked token alone can't delete an account: the
 * password, or for an account linked to Google a fresh Google sign-in. Google
 * sign-ups only have a random password they never saw, so Google is the
 * default for them.
 */
export function DeleteAccountModal({
  visible,
  onClose,
  description,
}: DeleteAccountModalProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const canUseGoogle = !!user?.has_google && isGoogleSignInAvailable;
  // Older API versions don't send has_password; assume there is one.
  const hasPassword = user?.has_password !== false;

  const [mode, setMode] = useState<"google" | "password">(canUseGoogle ? "google" : "password");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPassword("");
      setError(null);
      setMode(canUseGoogle ? "google" : "password");
    }
  }, [visible, canUseGoogle]);

  const run = async (proof: { password?: string; google_id_token?: string }) => {
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount(proof);
      // Auth state is cleared; the root redirect sends the user to welcome.
    } catch (err: any) {
      setError(err?.message ?? "We couldn't delete your account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmWithGoogle = async () => {
    setError(null);
    try {
      const idToken = await signInWithGoogle();
      if (idToken) await run({ google_id_token: idToken });
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed. Please try again.");
    }
  };

  const confirmWithPassword = () => {
    if (hasPassword && !password) {
      setError("Enter your password to delete your account.");
      return;
    }
    run(hasPassword ? { password } : {});
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

          {mode === "google" ? (
            <Text className="mt-4 text-sm leading-5 text-ink">
              To confirm it's you, sign in with the Google account linked to ContinentJobs.
            </Text>
          ) : hasPassword ? (
            <View className="mt-5">
              <Input
                label="Password"
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
              {user?.has_google && !canUseGoogle ? (
                <Text className="-mt-2 text-xs leading-4 text-ink-muted">
                  Signed up with Google? Use "Forgot password" on the sign-in screen to set a
                  password first.
                </Text>
              ) : null}
            </View>
          ) : null}

          {error && !(mode === "password" && hasPassword) ? (
            <Text className="mt-4 text-sm text-red-600">{error}</Text>
          ) : null}

          <View className="mt-6" style={{ gap: 10 }}>
            {mode === "google" ? (
              <Button
                title="Confirm with Google & delete"
                variant="danger"
                loading={deleting}
                icon={<Ionicons name="logo-google" size={18} color="#fff" />}
                onPress={confirmWithGoogle}
              />
            ) : (
              <Button
                title="Delete Account"
                variant="danger"
                loading={deleting}
                onPress={confirmWithPassword}
              />
            )}
            <Button title="Cancel" variant="outline" disabled={deleting} onPress={onClose} />
          </View>

          {canUseGoogle && hasPassword ? (
            <TouchableOpacity
              className="mt-3 items-center justify-center"
              style={{ minHeight: 44 }}
              disabled={deleting}
              onPress={() => {
                setError(null);
                setMode(mode === "google" ? "password" : "google");
              }}
            >
              <Text className="text-sm font-semibold text-primary">
                {mode === "google" ? "Use my password instead" : "Confirm with Google instead"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
