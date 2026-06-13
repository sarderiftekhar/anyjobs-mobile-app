import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCreateJob } from "../../../src/hooks/useEmployer";
import { Button, Badge, Select, ChipInput } from "../../../src/components/ui";
import { AIGenerateModal } from "../../../src/components/ai/AIGenerateModal";
import {
  INDUSTRY_OPTIONS, CURRENCIES, EXPERIENCE_LEVELS, JOB_TYPES,
  WORK_ARRANGEMENTS, SALARY_TYPES, EDUCATION_LEVELS, APPLICATION_METHODS,
} from "../../../src/constants/jobOptions";
import type { CreateJobPayload } from "../../../src/api/employer";

type Step =
  | "basic" | "context" | "company" | "description"
  | "skills" | "location" | "application" | "publish";

const STEPS: Step[] = [
  "basic", "context", "company", "description",
  "skills", "location", "application", "publish",
];
const STEP_TITLES: Record<Step, string> = {
  basic: "Basic Information",
  context: "Job Context",
  company: "Company Details",
  description: "Job Description",
  skills: "Skills & Qualifications",
  location: "Location",
  application: "Application Process",
  publish: "Publish Job",
};

// Small labeled text field used throughout the form.
function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline, autoCapitalize,
}: {
  label: string;
  value?: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "url" | "phone-pad";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-ink">{label}</Text>
      <TextInput
        className={`rounded-xl border border-border bg-surface px-4 text-base text-ink ${multiline ? "min-h-[120px] py-3" : "py-3.5 min-h-[52px]"}`}
        placeholder={placeholder}
        placeholderTextColor="#6B7F94"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

// Toggle row checkbox.
function CheckRow({
  label, hint, value, onToggle,
}: {
  label: string; hint?: string; value?: boolean; onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      className="mb-3 flex-row items-center justify-between rounded-xl border border-border p-4"
      onPress={onToggle}
    >
      <View className="flex-1 pr-3">
        <Text className="text-sm font-medium text-ink">{label}</Text>
        {hint && <Text className="mt-0.5 text-xs text-ink-muted">{hint}</Text>}
      </View>
      <Ionicons
        name={value ? "checkbox" : "square-outline"}
        size={24}
        color={value ? "#0064EC" : "#6B7F94"}
      />
    </TouchableOpacity>
  );
}

export default function CreateJobScreen() {
  const insets = useSafeAreaInsets();
  const createJob = useCreateJob();
  const [step, setStep] = useState<Step>("basic");
  const [aiOpen, setAiOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const currentIndex = STEPS.indexOf(step);
  const progress = Math.round(((currentIndex + 1) / STEPS.length) * 100);

  const [form, setForm] = useState<Partial<CreateJobPayload>>({
    title: "",
    category: "",
    description: "",
    experience_level: "",
    job_type: "",
    work_arrangement: "Remote",
    salary_currency: "GBP",
    salary_type: "yearly",
    salary_negotiable: false,
    requirements: "",
    benefits: "",
    skills_required: [],
    skills_preferred: [],
    certifications: [],
    education_level: "",
    location: "",
    application_method: "internal",
    auto_close_when_filled: false,
    is_featured: false,
    is_urgent: false,
    status: "active",
  });

  const updateForm = (updates: Partial<CreateJobPayload>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  // Per-step required-field validation. Returns an error string or null.
  const validateStep = (s: Step): string | null => {
    if (s === "basic") {
      if (!form.title?.trim()) return "Job title is required.";
      if (!form.category?.trim()) return "Please select an industry.";
    }
    if (s === "context") {
      if (!form.experience_level) return "Experience level is required.";
      if (!form.job_type) return "Please select a job type.";
      if (!form.work_arrangement) return "Work arrangement is required.";
    }
    if (s === "description") {
      if (!form.description || form.description.trim().length < 50)
        return "Description must be at least 50 characters.";
    }
    if (s === "skills") {
      if (!form.skills_required?.length) return "Add at least one required skill.";
    }
    if (s === "location") {
      const onsite = form.work_arrangement === "On Site" || form.work_arrangement === "Hybrid";
      if (onsite && !form.location?.trim()) return "Location is required for on-site/hybrid roles.";
    }
    if (s === "application") {
      if (form.application_method === "external" && !form.application_url?.trim())
        return "Application URL is required for external applications.";
      if (form.application_method === "email" && !form.application_email?.trim())
        return "Application email is required.";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      Alert.alert("Missing information", err);
      return;
    }
    setStep(STEPS[currentIndex + 1]);
  };

  const handlePublish = async (status: "active" | "draft") => {
    // location is required by the backend; fall back to the city/country text.
    const location =
      form.location?.trim() ||
      [form.city, form.state_province, form.country].filter(Boolean).join(", ");

    if (status === "active") {
      // Validate every step before publishing.
      for (const s of STEPS) {
        const err = validateStep(s);
        if (err) {
          Alert.alert("Missing information", err);
          return;
        }
      }
      if (!location) {
        Alert.alert("Missing information", "Please provide a location.");
        return;
      }
      if (!termsAgreed) {
        Alert.alert("Terms required", "Please agree to the Terms of Service to publish.");
        return;
      }
    }

    try {
      await createJob.mutateAsync({ ...form, location, status } as CreateJobPayload);
      Alert.alert(
        status === "active" ? "Job Published!" : "Draft Saved!",
        status === "active" ? "Your job posting is now live." : "Your draft has been saved.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Failed to create job. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-ink">Post a Job</Text>
        <TouchableOpacity onPress={() => handlePublish("draft")}>
          <Text className="text-sm font-medium text-primary">Save Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View className="flex-row px-4 pt-4">
        {STEPS.map((s, i) => (
          <View key={s} className="mr-1 flex-1">
            <View className={`h-1 rounded-full ${i <= currentIndex ? "bg-primary" : "bg-gray-200"}`} />
          </View>
        ))}
      </View>
      <Text className="px-4 pt-2 text-xs text-ink-muted">
        Step {currentIndex + 1} of {STEPS.length} · {progress}% — {STEP_TITLES[step]}
      </Text>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }} keyboardShouldPersistTaps="handled">
        {/* STEP 1: Basic Information */}
        {step === "basic" && (
          <>
            <Select
              label="Industry *"
              placeholder="Select an industry"
              icon="briefcase-outline"
              value={form.category || undefined}
              options={INDUSTRY_OPTIONS}
              searchable
              onChange={(v) => updateForm({ category: v })}
            />
            <Field
              label="Job Title *"
              placeholder="e.g. Senior React Developer"
              value={form.title}
              onChangeText={(t) => updateForm({ title: t })}
            />
          </>
        )}

        {/* STEP 2: Job Context */}
        {step === "context" && (
          <>
            <Select
              label="Experience Level *"
              value={form.experience_level || undefined}
              options={EXPERIENCE_LEVELS}
              onChange={(v) => updateForm({ experience_level: v })}
            />
            <Select
              label="Job Type *"
              placeholder="Select job type"
              value={form.job_type}
              options={JOB_TYPES}
              onChange={(v) => updateForm({ job_type: v })}
            />
            <Select
              label="Work Arrangement *"
              value={form.work_arrangement}
              options={WORK_ARRANGEMENTS}
              onChange={(v) => updateForm({ work_arrangement: v })}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="Min Salary"
                  placeholder="30000"
                  keyboardType="numeric"
                  value={form.salary_min?.toString() ?? ""}
                  onChangeText={(t) => updateForm({ salary_min: parseInt(t) || undefined })}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Max Salary"
                  placeholder="60000"
                  keyboardType="numeric"
                  value={form.salary_max?.toString() ?? ""}
                  onChangeText={(t) => updateForm({ salary_max: parseInt(t) || undefined })}
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Select
                  label="Currency"
                  value={form.salary_currency}
                  options={CURRENCIES}
                  searchable
                  onChange={(v) => updateForm({ salary_currency: v })}
                />
              </View>
              <View className="flex-1">
                <Select
                  label="Salary Type"
                  value={form.salary_type}
                  options={SALARY_TYPES}
                  onChange={(v) => updateForm({ salary_type: v })}
                />
              </View>
            </View>
            <CheckRow
              label="Salary is negotiable"
              value={form.salary_negotiable}
              onToggle={() => updateForm({ salary_negotiable: !form.salary_negotiable })}
            />
          </>
        )}

        {/* STEP 3: Company Details */}
        {step === "company" && (
          <>
            <Field
              label="Company Name"
              placeholder="Your company name"
              value={form.company_name}
              onChangeText={(t) => updateForm({ company_name: t })}
            />
            <Field
              label="Company Website"
              placeholder="https://company.com"
              keyboardType="url"
              autoCapitalize="none"
              value={form.company_website}
              onChangeText={(t) => updateForm({ company_website: t })}
            />
            <Field
              label="Company Email"
              placeholder="careers@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.company_email}
              onChangeText={(t) => updateForm({ company_email: t })}
            />
            <Field
              label="Company Phone"
              placeholder="+44 ..."
              keyboardType="phone-pad"
              value={form.company_phone}
              onChangeText={(t) => updateForm({ company_phone: t })}
            />
            <Field
              label="Company Description"
              placeholder="Tell candidates about your company..."
              multiline
              value={form.company_description}
              onChangeText={(t) => updateForm({ company_description: t })}
            />
            <Field
              label="Company Values"
              placeholder="What does your company stand for?"
              multiline
              value={form.company_values}
              onChangeText={(t) => updateForm({ company_values: t })}
            />
          </>
        )}

        {/* STEP 4: Job Description */}
        {step === "description" && (
          <>
            <Field
              label="Job Description * (min 50 characters)"
              placeholder="Describe the role, team, and responsibilities..."
              multiline
              value={form.description}
              onChangeText={(t) => updateForm({ description: t })}
            />
            <Text className="-mt-2 mb-3 text-xs text-ink-muted">
              {form.description?.trim().length ?? 0}/50 characters minimum
            </Text>
            <TouchableOpacity className="mb-4 flex-row items-center" onPress={() => setAiOpen(true)}>
              <Ionicons name="sparkles" size={16} color="#0064EC" />
              <Text className="ml-1.5 text-sm font-medium text-primary">Generate with AI</Text>
            </TouchableOpacity>
            <Field
              label="Requirements"
              placeholder="Key requirements for the role..."
              multiline
              value={form.requirements}
              onChangeText={(t) => updateForm({ requirements: t })}
            />
            <Field
              label="Benefits & Perks"
              placeholder="Health insurance, remote budget, ..."
              multiline
              value={form.benefits}
              onChangeText={(t) => updateForm({ benefits: t })}
            />

            <AIGenerateModal
              visible={aiOpen}
              onClose={() => setAiOpen(false)}
              seedTitle={form.title}
              seedLocation={form.location}
              seedWorkArrangement={form.work_arrangement}
              onAccept={(r) => {
                updateForm({
                  description: r.description ?? form.description,
                  requirements: r.requirements?.length
                    ? r.requirements.map((x) => `• ${x}`).join("\n")
                    : form.requirements,
                  benefits: r.benefits?.length
                    ? r.benefits.map((x) => `• ${x}`).join("\n")
                    : form.benefits,
                  skills_required: r.skills?.length ? r.skills : form.skills_required,
                });
                setAiOpen(false);
              }}
            />
          </>
        )}

        {/* STEP 5: Skills & Qualifications */}
        {step === "skills" && (
          <>
            <ChipInput
              label="Required Skills *"
              placeholder="Add a skill"
              value={form.skills_required ?? []}
              onChange={(v) => updateForm({ skills_required: v })}
            />
            <ChipInput
              label="Preferred Skills"
              placeholder="Add a skill"
              value={form.skills_preferred ?? []}
              onChange={(v) => updateForm({ skills_preferred: v })}
            />
            <ChipInput
              label="Certifications"
              placeholder="Add a certification"
              value={form.certifications ?? []}
              onChange={(v) => updateForm({ certifications: v })}
            />
            <Select
              label="Education Level"
              placeholder="Select education level"
              value={form.education_level || undefined}
              options={EDUCATION_LEVELS}
              onChange={(v) => updateForm({ education_level: v })}
            />
          </>
        )}

        {/* STEP 6: Location */}
        {step === "location" && (
          <>
            <Field
              label="Complete Address"
              placeholder="123 Main Street"
              value={form.address}
              onChangeText={(t) => updateForm({ address: t })}
            />
            <Field
              label={form.work_arrangement === "Remote" ? "Country" : "Country *"}
              placeholder="e.g. United Kingdom"
              value={form.country}
              onChangeText={(t) => updateForm({ country: t })}
            />
            <Field
              label="State / Province"
              placeholder="e.g. England"
              value={form.state_province}
              onChangeText={(t) => updateForm({ state_province: t })}
            />
            <Field
              label="City"
              placeholder="e.g. London"
              value={form.city}
              onChangeText={(t) => updateForm({ city: t })}
            />
            <Field
              label="Postal Code"
              placeholder="e.g. SW1A 1AA"
              autoCapitalize="words"
              value={form.postal_code}
              onChangeText={(t) => updateForm({ postal_code: t })}
            />
            <Field
              label="Location label (shown on listing)"
              placeholder="e.g. London, UK"
              value={form.location}
              onChangeText={(t) => updateForm({ location: t })}
            />
          </>
        )}

        {/* STEP 7: Application Process */}
        {step === "application" && (
          <>
            <Select
              label="Application Method *"
              value={form.application_method}
              options={APPLICATION_METHODS}
              onChange={(v) => updateForm({ application_method: v })}
            />
            {form.application_method === "external" && (
              <Field
                label="Application URL *"
                placeholder="https://company.com/apply"
                keyboardType="url"
                autoCapitalize="none"
                value={form.application_url}
                onChangeText={(t) => updateForm({ application_url: t })}
              />
            )}
            {form.application_method === "email" && (
              <Field
                label="Application Email *"
                placeholder="careers@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.application_email}
                onChangeText={(t) => updateForm({ application_email: t })}
              />
            )}
            <Field
              label="Application Deadline"
              placeholder="YYYY-MM-DD"
              value={form.application_deadline}
              onChangeText={(t) => updateForm({ application_deadline: t || undefined })}
            />
            <Field
              label="Maximum Applications"
              placeholder="Leave empty for unlimited"
              keyboardType="numeric"
              value={form.max_applications?.toString() ?? ""}
              onChangeText={(t) => updateForm({ max_applications: parseInt(t) || undefined })}
            />
            <CheckRow
              label="Auto-close when maximum reached"
              value={form.auto_close_when_filled}
              onToggle={() => updateForm({ auto_close_when_filled: !form.auto_close_when_filled })}
            />
            <Field
              label="Application Instructions"
              placeholder="Any specific instructions for applicants..."
              multiline
              value={form.application_instructions}
              onChangeText={(t) => updateForm({ application_instructions: t })}
            />
          </>
        )}

        {/* STEP 8: Publish */}
        {step === "publish" && (
          <>
            <View className="mb-4 rounded-xl border border-border p-4">
              <Text className="text-xl font-bold text-ink">{form.title || "Untitled"}</Text>
              <Text className="mt-1 text-sm text-ink-muted">
                {[form.category, form.work_arrangement].filter(Boolean).join(" · ")}
              </Text>
              <Text className="mt-0.5 text-sm text-ink-muted">
                {form.location || [form.city, form.country].filter(Boolean).join(", ")}
              </Text>
              {!!form.job_type && (
                <View className="mt-2 flex-row flex-wrap gap-1">
                  <Badge text={form.job_type} variant="primary" />
                </View>
              )}
              {form.salary_min && form.salary_max && (
                <Text className="mt-2 text-sm font-medium text-ink">
                  {form.salary_currency} {form.salary_min.toLocaleString()} - {form.salary_max.toLocaleString()} / {form.salary_type}
                </Text>
              )}
              {!!form.skills_required?.length && (
                <View className="mt-2 flex-row flex-wrap gap-1">
                  {form.skills_required.slice(0, 6).map((s) => <Badge key={s} text={s} variant="neutral" />)}
                </View>
              )}
            </View>

            <CheckRow
              label="Featured Job"
              hint="Higher visibility in search results"
              value={form.is_featured}
              onToggle={() => updateForm({ is_featured: !form.is_featured })}
            />
            <CheckRow
              label="Urgent Hiring"
              hint="Display an 'Urgent' badge on the listing"
              value={form.is_urgent}
              onToggle={() => updateForm({ is_urgent: !form.is_urgent })}
            />
            <CheckRow
              label="I agree to the Terms of Service"
              hint="Your job must comply with all applicable laws"
              value={termsAgreed}
              onToggle={() => setTermsAgreed(!termsAgreed)}
            />
          </>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View
        className="border-t border-border bg-white px-4 pt-4"
        style={{ paddingBottom: insets.bottom + 32 }}
      >
        {currentIndex > 0 ? (
          <View className="flex-row gap-3">
            <Button
              title="Back"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => setStep(STEPS[currentIndex - 1])}
            />
            {currentIndex < STEPS.length - 1 ? (
              <Button title="Next" style={{ flex: 1 }} onPress={goNext} />
            ) : (
              <Button title="Publish Job" style={{ flex: 1 }} loading={createJob.isPending} onPress={() => handlePublish("active")} />
            )}
          </View>
        ) : (
          <Button title="Next" size="lg" onPress={goNext} />
        )}
      </View>
    </View>
  );
}
