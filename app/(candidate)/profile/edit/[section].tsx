import { useMemo, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input } from "../../../../src/components/ui";
import { ScreenHeader, ToggleRow, ChipSelect, TagInput } from "../../../../src/components/form";
import { useAuthStore } from "../../../../src/stores/authStore";
import {
  useUpdateBasicInfo,
  useUpdateProfessional,
  useUpdateContactInfo,
  useUpdateLocation,
  useUpdatePreferences,
  useUpdatePrivacy,
} from "../../../../src/hooks/useProfile";

const JOB_TYPES = ["full_time", "part_time", "contract", "freelance", "internship", "temporary"];
const WORK_ARRANGEMENTS = ["on_site", "remote", "hybrid"];
const EMPLOYMENT_STATUS = [
  "employed",
  "unemployed",
  "student",
  "freelancing",
  "self_employed",
  "career_changer",
];

const TITLES: Record<string, string> = {
  "basic-info": "Basic Info",
  professional: "Professional Details",
  contact: "Contact Info",
  location: "Location",
  preferences: "Job Preferences",
  privacy: "Privacy",
};

const labelize = (v: string) =>
  v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function ProfileSectionEditor() {
  const insets = useSafeAreaInsets();
  const { section } = useLocalSearchParams<{ section: string }>();
  const profile = useAuthStore((s) => s.user?.profile) ?? {};

  const basic = useUpdateBasicInfo();
  const professional = useUpdateProfessional();
  const contact = useUpdateContactInfo();
  const location = useUpdateLocation();
  const preferences = useUpdatePreferences();
  const privacy = useUpdatePrivacy();

  // Local form state seeded from the current profile.
  const [form, setForm] = useState<Record<string, any>>(() => ({ ...profile }));
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const saving =
    basic.isPending ||
    professional.isPending ||
    contact.isPending ||
    location.isPending ||
    preferences.isPending ||
    privacy.isPending;

  const title = useMemo(() => TITLES[section ?? ""] ?? "Edit Profile", [section]);

  const onSave = async () => {
    try {
      switch (section) {
        case "basic-info":
          await basic.mutateAsync({
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            website: form.website,
            gender: form.gender,
            date_of_birth: form.date_of_birth,
          });
          break;
        case "professional":
          await professional.mutateAsync({
            professional_title: form.professional_title,
            professional_summary: form.professional_summary,
            years_experience: form.years_experience ? Number(form.years_experience) : undefined,
            current_company: form.current_company,
            current_position: form.current_position,
            industry: form.industry,
            employment_status: form.employment_status,
            current_salary: form.current_salary ? Number(form.current_salary) : undefined,
            salary_currency: form.salary_currency,
          });
          break;
        case "contact":
          await contact.mutateAsync({
            phone: form.phone,
            mobile: form.mobile,
            website: form.website,
          });
          break;
        case "location":
          await location.mutateAsync({
            country: form.country,
            state_province: form.state_province,
            city: form.city,
            postal_code: form.postal_code,
            address: form.address,
            willing_to_relocate: !!form.willing_to_relocate,
          });
          break;
        case "preferences":
          await preferences.mutateAsync({
            preferred_job_types: form.preferred_job_types ?? [],
            preferred_work_arrangements: form.preferred_work_arrangements ?? [],
            preferred_locations: form.preferred_locations ?? [],
            expected_salary_min: form.expected_salary_min ? Number(form.expected_salary_min) : null,
            expected_salary_max: form.expected_salary_max ? Number(form.expected_salary_max) : null,
            expected_salary_currency: form.expected_salary_currency,
            open_to_work: !!form.open_to_work,
            available_from: form.available_from || null,
          });
          break;
        case "privacy":
          await privacy.mutateAsync({
            profile_public: !!form.profile_public,
            show_contact_info: !!form.show_contact_info,
            show_current_employer: !!form.show_current_employer,
            show_salary_info: !!form.show_salary_info,
            allow_recruiter_contact: !!form.allow_recruiter_contact,
          });
          break;
      }
      router.back();
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.response?.data?.message ?? "Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <View style={{ paddingTop: insets.top }} className="bg-background">
        <ScreenHeader title={title} />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {section === "basic-info" && (
          <>
            <Input label="First name" value={form.first_name ?? ""} onChangeText={(v) => set("first_name", v)} autoCapitalize="words" />
            <Input label="Last name" value={form.last_name ?? ""} onChangeText={(v) => set("last_name", v)} autoCapitalize="words" />
            <Input label="Phone" value={form.phone ?? ""} onChangeText={(v) => set("phone", v)} keyboardType="phone-pad" icon="call-outline" />
            <Input label="Website" value={form.website ?? ""} onChangeText={(v) => set("website", v)} keyboardType="url" icon="globe-outline" />
            <Input label="Date of birth (YYYY-MM-DD)" value={form.date_of_birth ?? ""} onChangeText={(v) => set("date_of_birth", v)} placeholder="1995-06-21" />
          </>
        )}

        {section === "professional" && (
          <>
            <Input label="Professional title" value={form.professional_title ?? ""} onChangeText={(v) => set("professional_title", v)} placeholder="e.g. Senior Designer" />
            <Input label="Professional summary" value={form.professional_summary ?? ""} onChangeText={(v) => set("professional_summary", v)} multiline numberOfLines={5} style={{ minHeight: 110, textAlignVertical: "top" }} />
            <Input label="Years of experience" value={form.years_experience != null ? String(form.years_experience) : ""} onChangeText={(v) => set("years_experience", v)} keyboardType="number-pad" />
            <Input label="Current company" value={form.current_company ?? ""} onChangeText={(v) => set("current_company", v)} />
            <Input label="Current position" value={form.current_position ?? ""} onChangeText={(v) => set("current_position", v)} />
            <Input label="Industry" value={form.industry ?? ""} onChangeText={(v) => set("industry", v)} />
            <Text className="mb-2 text-sm font-medium text-ink">Employment status</Text>
            <ChipSelect
              options={EMPLOYMENT_STATUS.map((v) => ({ label: labelize(v), value: v }))}
              value={form.employment_status ? [form.employment_status] : []}
              onChange={(next) => set("employment_status", next[0] ?? null)}
              multiple={false}
            />
          </>
        )}

        {section === "contact" && (
          <>
            <Input label="Phone" value={form.phone ?? ""} onChangeText={(v) => set("phone", v)} keyboardType="phone-pad" icon="call-outline" />
            <Input label="Mobile" value={form.mobile ?? ""} onChangeText={(v) => set("mobile", v)} keyboardType="phone-pad" icon="phone-portrait-outline" />
            <Input label="Website" value={form.website ?? ""} onChangeText={(v) => set("website", v)} keyboardType="url" icon="globe-outline" />
          </>
        )}

        {section === "location" && (
          <>
            <Input label="Country" value={form.country ?? ""} onChangeText={(v) => set("country", v)} />
            <Input label="State / Province" value={form.state_province ?? ""} onChangeText={(v) => set("state_province", v)} />
            <Input label="City" value={form.city ?? ""} onChangeText={(v) => set("city", v)} />
            <Input label="Postal code" value={form.postal_code ?? ""} onChangeText={(v) => set("postal_code", v)} />
            <Input label="Address" value={form.address ?? ""} onChangeText={(v) => set("address", v)} />
            <ToggleRow label="Willing to relocate" value={!!form.willing_to_relocate} onValueChange={(v) => set("willing_to_relocate", v)} />
          </>
        )}

        {section === "preferences" && (
          <>
            <Text className="mb-2 text-sm font-medium text-ink">Job types</Text>
            <ChipSelect options={JOB_TYPES.map((v) => ({ label: labelize(v), value: v }))} value={form.preferred_job_types ?? []} onChange={(v) => set("preferred_job_types", v)} />
            <Text className="mb-2 mt-4 text-sm font-medium text-ink">Work arrangements</Text>
            <ChipSelect options={WORK_ARRANGEMENTS.map((v) => ({ label: labelize(v), value: v }))} value={form.preferred_work_arrangements ?? []} onChange={(v) => set("preferred_work_arrangements", v)} />
            <Text className="mb-2 mt-4 text-sm font-medium text-ink">Preferred locations</Text>
            <TagInput value={form.preferred_locations ?? []} onChange={(v) => set("preferred_locations", v)} placeholder="Add a city or country" />
            <View className="mt-4 flex-row">
              <View className="mr-2 flex-1">
                <Input label="Min salary" value={form.expected_salary_min != null ? String(form.expected_salary_min) : ""} onChangeText={(v) => set("expected_salary_min", v)} keyboardType="number-pad" />
              </View>
              <View className="ml-2 flex-1">
                <Input label="Max salary" value={form.expected_salary_max != null ? String(form.expected_salary_max) : ""} onChangeText={(v) => set("expected_salary_max", v)} keyboardType="number-pad" />
              </View>
            </View>
            <Input label="Currency" value={form.expected_salary_currency ?? ""} onChangeText={(v) => set("expected_salary_currency", v)} placeholder="USD" />
            <Input label="Available from (YYYY-MM-DD)" value={form.available_from ?? ""} onChangeText={(v) => set("available_from", v)} placeholder="2026-07-01" />
            <ToggleRow label="Open to work" description="Show recruiters you're available" value={!!form.open_to_work} onValueChange={(v) => set("open_to_work", v)} />
          </>
        )}

        {section === "privacy" && (
          <>
            <ToggleRow label="Public profile" description="Let employers discover your profile" value={!!form.profile_public} onValueChange={(v) => set("profile_public", v)} />
            <ToggleRow label="Show contact info" value={!!form.show_contact_info} onValueChange={(v) => set("show_contact_info", v)} />
            <ToggleRow label="Show current employer" value={!!form.show_current_employer} onValueChange={(v) => set("show_current_employer", v)} />
            <ToggleRow label="Show salary info" value={!!form.show_salary_info} onValueChange={(v) => set("show_salary_info", v)} />
            <ToggleRow label="Allow recruiter contact" value={!!form.allow_recruiter_contact} onValueChange={(v) => set("allow_recruiter_contact", v)} />
          </>
        )}
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-border bg-surface px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button title="Save changes" loading={saving} onPress={onSave} />
      </View>
    </KeyboardAvoidingView>
  );
}
