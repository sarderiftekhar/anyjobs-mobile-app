import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../../src/api/auth";
import { Button, Input } from "../../src/components/ui";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-background"
        >
          <Ionicons name="arrow-back" size={20} color="#1A2230" />
        </TouchableOpacity>

        {sent ? (
          <View className="items-center py-12">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <Ionicons name="mail-outline" size={36} color="#22C55E" />
            </View>
            <Text className="text-center text-2xl font-bold text-ink">
              Check Your Email
            </Text>
            <Text className="mt-2 text-center text-base text-ink-soft">
              We've sent a password reset link to your email address.
            </Text>
            <Button
              title="Back to Login"
              className="mt-8"
              onPress={() => router.replace("/(auth)/login")}
            />
          </View>
        ) : (
          <>
            <Text className="text-3xl font-bold text-ink">
              Forgot Password?
            </Text>
            <Text className="mt-2 text-base text-ink-soft">
              Enter your email and we'll send you a link to reset your password.
            </Text>

            {error && (
              <View className="mt-4 rounded-xl bg-danger/10 p-3.5">
                <Text className="text-sm text-danger">{error}</Text>
              </View>
            )}

            <View className="mt-8">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email address"
                    icon="mail-outline"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <Button
                title="Send Reset Link"
                size="lg"
                loading={isLoading}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
