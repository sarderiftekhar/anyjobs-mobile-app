import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../src/stores/authStore";
import { Button, Input } from "../../src/components/ui";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    try {
      await login(data);
      // Navigation happens automatically via root layout auth check
    } catch (err: any) {
      // Error is already set in the store
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
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-background"
        >
          <Ionicons name="arrow-back" size={20} color="#1A2230" />
        </TouchableOpacity>

        {/* Header */}
        <Text className="text-3xl font-bold text-ink">
          Welcome Back
        </Text>
        <Text className="mt-1 text-base text-ink-soft">
          Sign in to continue
        </Text>

        {/* Error message */}
        {error && (
          <View className="mt-4 rounded-xl bg-danger/10 p-3.5">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        )}

        {/* Form */}
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                isPassword
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <TouchableOpacity
            className="mb-6 self-end"
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text className="text-sm font-semibold text-primary">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            size="lg"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        {/* Divider */}
        <View className="my-6 flex-row items-center">
          <View className="flex-1 border-b border-border" />
          <Text className="mx-4 text-sm text-ink-muted">
            or continue with
          </Text>
          <View className="flex-1 border-b border-border" />
        </View>

        {/* Google */}
        <Button
          title="Sign in with Google"
          variant="outline"
          size="lg"
          icon={<Ionicons name="logo-google" size={20} color="#0064EC" />}
          onPress={() => Alert.alert("Coming Soon", "Google sign-in will be available soon.")}
        />

        {/* Register link */}
        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-sm text-ink-soft">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text className="text-sm font-bold text-primary">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
