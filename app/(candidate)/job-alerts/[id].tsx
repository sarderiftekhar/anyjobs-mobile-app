import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input } from "../../../src/components/ui";
import { ScreenHeader, ChipSelect, ToggleRow } from "../../../src/components/form";
import { useJobAlerts, useCreateJobAlert, useUpdateJobAlert } from "../../../src/hooks/useJobAlerts";
import type { AlertFrequency } from "../../../src/types/profileExtras";

const JOB_TYPES = ["full_time", "part_time", "contract", "freelance", "internship"];
const WORK_ARRANGEMENTS = ["on_site", "remote", "hybrid"];
const FREQUENCIES: AlertFrequency[] = ["instant", "daily", "weekly"];
const labelize = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function JobAlertEditor() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";

  const { data: alerts } = useJobAlerts();
  const existing = isNew ? undefined : alerts?.find((a) => String(a.id) === id);

  const create = useCreateJobAlert();
  const update = useUpdateJobAlert();

  const [form, setForm] = useState(() => ({
    name: existing?.name ?? "",
    keywords: existing?.keywords ?? "",
    location: existing?.location ?? "",
    job_types: existing?.job_types ?? [],
    work_arrangements: existing?.work_arrangements ?? [],
    salary_min: existing?.salary_min != null ? String(existing.salary_min) : "",
    salary_max: existing?.salary_max != null ? String(existing.salary_max) : "",
    frequency: (existing?.frequency ?? "daily") as AlertFrequency,
    is_active: existing?.is_active ?? true,
  }));
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Name required", "Give your alert a name.");
      return;
    }
    const payload = {
      name: form.name,
      keywords: form.keywords || undefined,
      location: form.location || undefined,
      job_types: form.job_types,
      work_arrangements: form.work_arrangements,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      frequency: form.frequency,
      is_active: form.is_active,
    };
    try {
      if (isNew) {
        await create.mutateAsync(payload);
      } else if (existing) {
        await update.mutateAsync({ id: existing.id, payload });
      }
      router.back();
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.response?.data?.message ?? "Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title={isNew ? "New Alert" : "Edit Alert"} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        <Input label="Alert name" value={form.name} onChangeText={(v) => set("name", v)} placeholder="e.g. Remote React jobs" />
        <Input label="Keywords" value={form.keywords} onChangeText={(v) => set("keywords", v)} placeholder="react, typescript" icon="search-outline" />
        <Input label="Location" value={form.location} onChangeText={(v) => set("location", v)} icon="location-outline" />

        <Text className="mb-2 text-sm font-medium text-ink">Job types</Text>
        <ChipSelect options={JOB_TYPES.map((v) => ({ label: labelize(v), value: v }))} value={form.job_types} onChange={(v) => set("job_types", v)} />

        <Text className="mb-2 mt-4 text-sm font-medium text-ink">Work arrangements</Text>
        <ChipSelect options={WORK_ARRANGEMENTS.map((v) => ({ label: labelize(v), value: v }))} value={form.work_arrangements} onChange={(v) => set("work_arrangements", v)} />

        <View className="mt-4 flex-row">
          <View className="mr-2 flex-1">
            <Input label="Min salary" value={form.salary_min} onChangeText={(v) => set("salary_min", v)} keyboardType="number-pad" />
          </View>
          <View className="ml-2 flex-1">
            <Input label="Max salary" value={form.salary_max} onChangeText={(v) => set("salary_max", v)} keyboardType="number-pad" />
          </View>
        </View>

        <Text className="mb-2 mt-2 text-sm font-medium text-ink">Frequency</Text>
        <ChipSelect options={FREQUENCIES.map((v) => ({ label: labelize(v), value: v }))} value={[form.frequency]} onChange={(next) => set("frequency", (next[0] ?? "daily") as AlertFrequency)} multiple={false} />

        <View className="mt-2">
          <ToggleRow label="Active" description="Receive notifications for this alert" value={form.is_active} onValueChange={(v) => set("is_active", v)} />
        </View>
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button title={isNew ? "Create alert" : "Save changes"} loading={create.isPending || update.isPending} onPress={onSave} />
      </View>
    </KeyboardAvoidingView>
  );
}
