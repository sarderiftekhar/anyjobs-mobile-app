import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../src/stores/authStore";
import { Button, Input } from "../../src/components/ui";
import { PressableScale } from "../../src/components/animation/PressableScale";
import { enterFade, enterUp } from "../../src/components/animation/entrance";
import {
  signInWithGoogle,
  isGoogleSignInAvailable,
} from "../../src/lib/googleSignIn";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [enterHeader, enterForm, enterAlt, enterFooter] = useMemo(
    () => [enterUp(0), enterUp(70), enterUp(140), enterUp(200)],
    []
  );

  // Clear any stale error (e.g. a failed register) when this screen mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

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

  const handleGoogleSignIn = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      if (idToken) {
        // Navigation happens automatically via root layout auth check
        await googleLogin(idToken);
      }
    } catch (err: any) {
      // API failures surface via the store's error banner; native sign-in
      // failures (Play Services, misconfig) need their own alert.
      if (!useAuthStore.getState().error) {
        Alert.alert(
          "Google sign-in failed",
          err?.message ?? "Please try again.",
        );
      }
    } finally {
      setGoogleLoading(false);
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
        <PressableScale
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(auth)/welcome")
          }
          className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-background"
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color="#1A2230" />
        </PressableScale>

        {/* Header */}
        <Animated.View entering={enterHeader}>
          <Text className="text-3xl font-bold text-ink">
            Welcome Back
          </Text>
          <Text className="mt-1 text-base text-ink-soft">
            Sign in to continue
          </Text>
        </Animated.View>

        {/* Error message */}
        {error && (
          <Animated.View entering={enterFade(0, 200)}>
            <View className="mt-4 rounded-xl bg-danger/10 p-3.5">
              <Text className="text-sm text-danger">{error}</Text>
            </View>
          </Animated.View>
        )}

        {/* Form */}
        <Animated.View entering={enterForm}>
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

          <PressableScale
            className="mb-6 self-end"
            onPress={() => router.push("/(auth)/forgot-password")}
            activeOpacity={0.6}
            accessibilityRole="link"
          >
            <Text className="text-sm font-semibold text-primary">
              Forgot Password?
            </Text>
          </PressableScale>

          <Button
            title="Sign In"
            size="lg"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
        </Animated.View>

        {/* Google — hidden when the native module isn't in this build */}
        {isGoogleSignInAvailable && (
          <Animated.View entering={enterAlt}>
            <View className="my-6 flex-row items-center">
              <View className="flex-1 border-b border-border" />
              <Text className="mx-4 text-sm text-ink-muted">
                or continue with
              </Text>
              <View className="flex-1 border-b border-border" />
            </View>

            <Button
              title="Sign in with Google"
              variant="outline"
              size="lg"
              loading={googleLoading}
              icon={<Ionicons name="logo-google" size={20} color="#0064EC" />}
              onPress={handleGoogleSignIn}
            />
          </Animated.View>
        )}

        {/* Register link */}
        <Animated.View entering={enterFooter}>
        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-sm text-ink-soft">
            Don't have an account?{" "}
          </Text>
          <PressableScale
            onPress={() => router.replace("/(auth)/register")}
            activeOpacity={0.6}
            accessibilityRole="link"
          >
            <Text className="text-sm font-bold text-primary">Sign Up</Text>
          </PressableScale>
        </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
