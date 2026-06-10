import { useMemo, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input } from "../../src/components/ui";
import { ChipSelect, TagInput } from "../../src/components/form";
import { useAuthStore } from "../../src/stores/authStore";
import { useCompleteOnboarding } from "../../src/hooks/useOnboarding";

const JOB_TYPES = ["full_time", "part_time", "contract", "freelance", "internship"];
const WORK_ARRANGEMENTS = ["on_site", "remote", "hybrid"];
const EMPLOYMENT_STATUS = ["employed", "unemployed", "student", "freelancing", "self_employed", "career_changer"];
const labelize = (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const STEPS = ["Your role", "About you", "Preferences"];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const complete = useCompleteOnboarding();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, any>>(() => ({
    professional_title: user?.profile?.professional_title ?? "",
    industry: user?.profile?.industry ?? "",
    years_experience: "",
    employment_status: "",
    professional_summary: "",
    skills: [] as string[],
    preferred_job_types: [] as string[],
    preferred_work_arrangements: [] as string[],
    country: user?.profile?.country ?? "",
    city: user?.profile?.city ?? "",
    expected_salary_min: "",
    expected_salary_max: "",
    willing_to_relocate: false,
    open_to_work: true,
  }));
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const canContinue = useMemo(() => {
    if (step === 0) return !!form.professional_title.trim();
    if (step === 1) return form.skills.length > 0;
    return true;
  }, [step, form]);

  const submit = async () => {
    try {
      await complete.mutateAsync({
        professional_title: form.professional_title,
        industry: form.industry || undefined,
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
        employment_status: form.employment_status || undefined,
        professional_summary: form.professional_summary || undefined,
        skills: form.skills,
        preferred_job_types: form.preferred_job_types,
        preferred_work_arrangements: form.preferred_work_arrangements,
        country: form.country || undefined,
        city: form.city || undefined,
        expected_salary_min: form.expected_salary_min ? Number(form.expected_salary_min) : undefined,
        expected_salary_max: form.expected_salary_max ? Number(form.expected_salary_max) : undefined,
        willing_to_relocate: !!form.willing_to_relocate,
        open_to_work: !!form.open_to_work,
      });
      router.replace("/(candidate)/(tabs)");
    } catch (e: any) {
      Alert.alert("Couldn't finish", e?.response?.data?.message ?? "Please try again.");
    }
  };

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : submit());

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-5">
        {/* progress */}
        <View className="flex-row">
          {STEPS.map((_, i) => (
            <View key={i} className={`mr-2 h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </View>
        <Text className="mt-4 text-2xl font-bold text-ink">{STEPS[step]}</Text>
        <Text className="mt-1 text-sm text-ink-muted">Step {step + 1} of {STEPS.length} · Help us match you to the right jobs</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Input label="Professional title *" value={form.professional_title} onChangeText={(v) => set("professional_title", v)} placeholder="e.g. Frontend Engineer" />
            <Input label="Industry" value={form.industry} onChangeText={(v) => set("industry", v)} placeholder="e.g. Technology" />
            <Input label="Years of experience" value={form.years_experience} onChangeText={(v) => set("years_experience", v)} keyboardType="number-pad" />
            <Text className="mb-2 text-sm font-medium text-ink">Current status</Text>
            <ChipSelect options={EMPLOYMENT_STATUS.map((v) => ({ label: labelize(v), value: v }))} value={form.employment_status ? [form.employment_status] : []} onChange={(n) => set("employment_status", n[0] ?? "")} multiple={false} />
          </>
        )}

        {step === 1 && (
          <>
            <Input label="About you" value={form.professional_summary} onChangeText={(v) => set("professional_summary", v)} multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: "top" }} placeholder="A short summary of your background..." />
            <Text className="mb-2 mt-2 text-sm font-medium text-ink">Your skills *</Text>
            <TagInput value={form.skills} onChange={(v) => set("skills", v)} placeholder="Add a skill" />
          </>
        )}

        {step === 2 && (
          <>
            <Text className="mb-2 text-sm font-medium text-ink">Job types</Text>
            <ChipSelect options={JOB_TYPES.map((v) => ({ label: labelize(v), value: v }))} value={form.preferred_job_types} onChange={(v) => set("preferred_job_types", v)} />
            <Text className="mb-2 mt-4 text-sm font-medium text-ink">Work arrangement</Text>
            <ChipSelect options={WORK_ARRANGEMENTS.map((v) => ({ label: labelize(v), value: v }))} value={form.preferred_work_arrangements} onChange={(v) => set("preferred_work_arrangements", v)} />
            <View className="mt-4 flex-row">
              <View className="mr-2 flex-1"><Input label="Country" value={form.country} onChangeText={(v) => set("country", v)} /></View>
              <View className="ml-2 flex-1"><Input label="City" value={form.city} onChangeText={(v) => set("city", v)} /></View>
            </View>
            <View className="flex-row">
              <View className="mr-2 flex-1"><Input label="Min salary" value={form.expected_salary_min} onChangeText={(v) => set("expected_salary_min", v)} keyboardType="number-pad" /></View>
              <View className="ml-2 flex-1"><Input label="Max salary" value={form.expected_salary_max} onChangeText={(v) => set("expected_salary_max", v)} keyboardType="number-pad" /></View>
            </View>
          </>
        )}
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 flex-row border-t border-border bg-surface px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {step > 0 && (
          <TouchableOpacity className="mr-3 items-center justify-center rounded-full border border-border px-5" onPress={() => setStep(step - 1)}>
            <Text className="font-semibold text-ink-soft">Back</Text>
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Button
            title={step < STEPS.length - 1 ? "Continue" : "Finish"}
            disabled={!canContinue}
            loading={complete.isPending}
            onPress={next}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
