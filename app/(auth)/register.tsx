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

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
    user_type: z.enum(["candidate", "employer"]),
    terms: z.literal(true, { message: "You must accept the terms" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirmation: "",
      user_type: "candidate",
      terms: false as unknown as true,
    },
  });

  const userType = watch("user_type");

  const onSubmit = async (data: RegisterForm) => {
    clearError();
    try {
      await register({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        user_type: data.user_type,
      });
    } catch {
      // Error shown from store
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
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>

        {/* Header */}
        <Text className="text-3xl font-bold text-text-primary">
          Create Account
        </Text>
        <Text className="mt-1 text-base text-text-secondary">
          Join AnyJobs today
        </Text>

        {/* Error message */}
        {error && (
          <View className="mt-4 rounded-md bg-red-50 p-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        )}

        {/* User type toggle */}
        <View className="mt-6 flex-row rounded-md bg-gray-100 p-1">
          <TouchableOpacity
            className={`flex-1 items-center rounded-md py-2.5 ${
              userType === "candidate" ? "bg-primary" : ""
            }`}
            onPress={() => setValue("user_type", "candidate")}
          >
            <Text
              className={`font-semibold ${
                userType === "candidate" ? "text-white" : "text-text-secondary"
              }`}
            >
              Candidate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center rounded-md py-2.5 ${
              userType === "employer" ? "bg-primary" : ""
            }`}
            onPress={() => setValue("user_type", "employer")}
          >
            <Text
              className={`font-semibold ${
                userType === "employer" ? "text-white" : "text-text-secondary"
              }`}
            >
              Employer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="mt-6">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="First Name"
                    placeholder="First"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.first_name?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Last Name"
                    placeholder="Last"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.last_name?.message}
                  />
                )}
              />
            </View>
          </View>

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
                placeholder="Min 8 characters"
                isPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirmation"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                icon="lock-closed-outline"
                placeholder="Re-enter password"
                isPassword
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password_confirmation?.message}
              />
            )}
          />

          {/* Terms checkbox */}
          <Controller
            control={control}
            name="terms"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                className="mb-6 flex-row items-start"
                onPress={() => onChange(!value)}
              >
                <Ionicons
                  name={value ? "checkbox" : "square-outline"}
                  size={22}
                  color={value ? "#574BA6" : "#9CA3AF"}
                />
                <Text className="ml-2 flex-1 text-sm text-text-secondary">
                  I agree to the{" "}
                  <Text className="text-primary">Terms of Service</Text> &{" "}
                  <Text className="text-primary">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.terms && (
            <Text className="-mt-4 mb-4 text-xs text-danger">
              {errors.terms.message}
            </Text>
          )}

          <Button
            title="Create Account"
            size="lg"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        {/* Divider */}
        <View className="my-6 flex-row items-center">
          <View className="flex-1 border-b border-border" />
          <Text className="mx-4 text-sm text-text-secondary">or</Text>
          <View className="flex-1 border-b border-border" />
        </View>

        {/* Google */}
        <Button
          title="Sign up with Google"
          variant="outline"
          size="lg"
          icon={<Ionicons name="logo-google" size={20} color="#574BA6" />}
          onPress={() => Alert.alert("Coming Soon", "Google sign-up will be available soon.")}
        />

        {/* Login link */}
        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-sm text-text-secondary">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-sm font-bold text-primary">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
