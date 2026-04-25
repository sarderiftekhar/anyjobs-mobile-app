import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Input, Button, LoadingSpinner } from "../../../src/components/ui";
import { useCompany, useUpdateCompany } from "../../../src/hooks/useCompany";
import type { UpdateCompanyPayload } from "../../../src/types/company";

export default function CompanyEditScreen() {
  const insets = useSafeAreaInsets();
  const { data: company, isLoading } = useCompany();
  const update = useUpdateCompany();

  const [form, setForm] = useState<UpdateCompanyPayload>({});

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        tagline: company.tagline,
        description: company.description,
        size: company.size,
        industry: company.industry,
        website: company.website,
        founded_year: company.founded_year,
      });
    }
  }, [company]);

  const set = <K extends keyof UpdateCompanyPayload>(
    k: K,
    v: UpdateCompanyPayload[K]
  ) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      await update.mutateAsync(form);
      Alert.alert("Saved", "Company profile updated.");
      router.back();
    } catch {
      Alert.alert("Error", "Could not save company profile.");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 32,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">
          Edit Company
        </Text>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <View className="px-4">
          <Input
            label="Company name"
            value={form.name ?? ""}
            onChangeText={(t) => set("name", t)}
            placeholder="Acme Inc."
          />
          <Input
            label="Tagline"
            value={form.tagline ?? ""}
            onChangeText={(t) => set("tagline", t)}
            placeholder="Short one-liner about your company"
          />
          <Input
            label="Description"
            value={form.description ?? ""}
            onChangeText={(t) => set("description", t)}
            placeholder="Tell candidates what you do"
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
          <Input
            label="Industry"
            value={form.industry ?? ""}
            onChangeText={(t) => set("industry", t)}
            placeholder="e.g. Software, Retail"
          />
          <Input
            label="Company size"
            value={form.size ?? ""}
            onChangeText={(t) => set("size", t)}
            placeholder="e.g. 11-50"
          />
          <Input
            label="Website"
            value={form.website ?? ""}
            onChangeText={(t) => set("website", t)}
            placeholder="https://"
            autoCapitalize="none"
            keyboardType="url"
          />
          <Input
            label="Founded year"
            value={form.founded_year ? String(form.founded_year) : ""}
            onChangeText={(t) =>
              set("founded_year", t ? Number(t.replace(/\D/g, "")) : undefined)
            }
            placeholder="2019"
            keyboardType="number-pad"
          />

          <Button
            title="Save changes"
            onPress={submit}
            loading={update.isPending}
            className="mt-4"
          />
        </View>
      )}
    </ScrollView>
  );
}
