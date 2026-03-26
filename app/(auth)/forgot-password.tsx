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
      className="flex-1 bg-white"
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
          className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>

        {sent ? (
          <View className="items-center py-12">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Ionicons name="mail-outline" size={32} color="#22C55E" />
            </View>
            <Text className="text-center text-2xl font-bold text-text-primary">
              Check Your Email
            </Text>
            <Text className="mt-2 text-center text-base text-text-secondary">
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
            <Text className="text-3xl font-bold text-text-primary">
              Forgot Password?
            </Text>
            <Text className="mt-2 text-base text-text-secondary">
              Enter your email and we'll send you a link to reset your password.
            </Text>

            {error && (
              <View className="mt-4 rounded-md bg-red-50 p-3">
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
