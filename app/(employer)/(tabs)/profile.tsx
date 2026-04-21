import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../src/stores/authStore";
import { useCompanyProfile, useUpdateCompanyProfile } from "../../../src/hooks/useEmployer";
import { Avatar, Card, Badge, Button, LoadingSpinner } from "../../../src/components/ui";

export default function EmployerProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { data: company, isLoading } = useCompanyProfile();
  const updateCompany = useUpdateCompanyProfile();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View className="flex-row items-center justify-end px-4 pt-4">
        <TouchableOpacity onPress={() => router.push("/(employer)/settings")}>
          <Ionicons name="settings-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Company header */}
      <View className="items-center px-4 pb-6">
        <Avatar name={company?.name ?? user?.name} size="xl" uri={company?.logo_url} />
        <Text className="mt-3 text-xl font-bold text-text-primary">
          {company?.name ?? user?.name}
        </Text>
        <Text className="text-sm text-text-secondary">
          {company?.industry ?? "Complete your company profile"}
        </Text>
        {company?.location && (
          <View className="mt-1 flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-sm text-text-secondary">{company.location}</Text>
          </View>
        )}
      </View>

      {/* Company info */}
      <Card className="mx-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-text-primary">Company Info</Text>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color="#1E3A8A" />
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <View className="mt-3 gap-2">
            {company?.description ? (
              <Text className="text-sm text-text-secondary">{company.description}</Text>
            ) : (
              <Text className="text-sm italic text-text-secondary">Add a company description</Text>
            )}
            <View className="mt-2 flex-row flex-wrap gap-3">
              {company?.size && (
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={14} color="#6B7280" />
                  <Text className="ml-1 text-xs text-text-secondary">{company.size}</Text>
                </View>
              )}
              {company?.founded_year && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text className="ml-1 text-xs text-text-secondary">Founded {company.founded_year}</Text>
                </View>
              )}
              {company?.website && (
                <View className="flex-row items-center">
                  <Ionicons name="globe-outline" size={14} color="#6B7280" />
                  <Text className="ml-1 text-xs text-primary">{company.website}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Card>

      {/* Benefits */}
      <Card className="mx-4 mt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-text-primary">Benefits</Text>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={22} color="#1E3A8A" />
          </TouchableOpacity>
        </View>
        {company?.benefits && company.benefits.length > 0 ? (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {company.benefits.map((benefit) => (
              <Badge key={benefit} text={benefit} variant="success" />
            ))}
          </View>
        ) : (
          <Text className="mt-2 text-sm text-text-secondary">
            Add company benefits to attract candidates.
          </Text>
        )}
      </Card>

      {/* Values */}
      <Card className="mx-4 mt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-text-primary">Company Values</Text>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={22} color="#1E3A8A" />
          </TouchableOpacity>
        </View>
        {company?.values && company.values.length > 0 ? (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {company.values.map((value) => (
              <Badge key={value} text={value} variant="primary" />
            ))}
          </View>
        ) : (
          <Text className="mt-2 text-sm text-text-secondary">
            Share what your company stands for.
          </Text>
        )}
      </Card>

      {/* Sign out */}
      <View className="mx-4 mt-8">
        <Button
          title="Sign Out"
          variant="outline"
          onPress={logout}
          icon={<Ionicons name="log-out-outline" size={18} color="#1E3A8A" />}
        />
      </View>
    </ScrollView>
  );
}
