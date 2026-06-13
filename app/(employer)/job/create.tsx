import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCreateJob, useCompanyProfile } from "../../../src/hooks/useEmployer";
import { Button, Badge, Select, ChipInput } from "../../../src/components/ui";
import { AIGenerateModal } from "../../../src/components/ai/AIGenerateModal";
import {
  INDUSTRY_OPTIONS, CURRENCIES, EXPERIENCE_LEVELS, JOB_TYPES,
  WORK_ARRANGEMENTS, SALARY_TYPES, EDUCATION_LEVELS, APPLICATION_METHODS,
  currencyForCountry,
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

// Validation constants/helpers mirroring the web StoreJobRequest rules.
const MAX_SALARY = 9999999.99;
const DESC_MIN = 50;
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isUrl = (v: string) => /^https?:\/\/.+\..+/i.test(v.trim());
const isPhone = (v: string) => /^[\d\s\-()\.\+]+$/.test(v.trim());
const toNum = (v: unknown) =>
  v === undefined || v === null || `${v}` === "" ? NaN : Number(v);

/** Salary errors — recomputed live so min > max is caught immediately. */
function salaryErrors(form: Partial<CreateJobPayload>): { salary_min?: string; salary_max?: string } {
  const e: { salary_min?: string; salary_max?: string } = {};
  const hasMin = form.salary_min !== undefined && `${form.salary_min}` !== "";
  const hasMax = form.salary_max !== undefined && `${form.salary_max}` !== "";
  const min = toNum(form.salary_min);
  const max = toNum(form.salary_max);
  if (hasMin) {
    if (isNaN(min) || min < 0) e.salary_min = "Enter a valid minimum salary.";
    else if (min > MAX_SALARY) e.salary_min = "Salary cannot exceed 9,999,999.99.";
  }
  if (hasMax) {
    if (isNaN(max) || max < 0) e.salary_max = "Enter a valid maximum salary.";
    else if (max > MAX_SALARY) e.salary_max = "Salary cannot exceed 9,999,999.99.";
    else if (hasMin && !isNaN(min) && max < min)
      e.salary_max = "Maximum salary must be ≥ minimum salary.";
  }
  return e;
}

// Small labeled text field used throughout the form.
function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline, autoCapitalize, error,
}: {
  label: string;
  value?: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "url" | "phone-pad";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-ink">{label}</Text>
      <TextInput
        className={`rounded-xl border bg-surface px-4 text-base text-ink ${error ? "border-danger" : "border-border"} ${multiline ? "min-h-[120px] py-3" : "py-3.5 min-h-[52px]"}`}
        placeholder={placeholder}
        placeholderTextColor="#6B7F94"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text className="mt-1.5 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}

// Toggle row checkbox.
function CheckRow({
  label, hint, value, onToggle, error,
}: {
  label: string; hint?: string; value?: boolean; onToggle: () => void; error?: string;
}) {
  return (
    <View className="mb-3">
      <TouchableOpacity
        className={`flex-row items-center justify-between rounded-xl border p-4 ${error ? "border-danger" : "border-border"}`}
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
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}

export default function CreateJobScreen() {
  const insets = useSafeAreaInsets();
  const createJob = useCreateJob();
  const { data: company } = useCompanyProfile();
  const [step, setStep] = useState<Step>("basic");
  const [aiOpen, setAiOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  // Update the form and clear any inline error on the touched field(s).
  const updateForm = (updates: Partial<CreateJobPayload>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(updates)) delete next[k];
      return next;
    });
  };

  // Auto-fill company + location details from the employer's company profile,
  // once, and only into fields the user hasn't already filled.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!company || prefilled.current) return;
    prefilled.current = true;
    setForm((prev) => {
      const next = { ...prev };
      if (company.name && !next.company_name) next.company_name = company.name;
      if (company.website && !next.company_website) next.company_website = company.website;
      if (company.email && !next.company_email) next.company_email = company.email;
      if (company.phone && !next.company_phone) next.company_phone = company.phone;
      if (company.description && !next.company_description) next.company_description = company.description;
      if (company.values?.length && !next.company_values)
        next.company_values = company.values.map((v) => `• ${v}`).join("\n");
      if (company.benefits?.length && !next.benefits)
        next.benefits = company.benefits.map((v) => `• ${v}`).join("\n");
      if (company.industry && !next.category && INDUSTRY_OPTIONS.some((o) => o.value === company.industry))
        next.category = company.industry;
      const addr = company.address;
      if (addr) {
        if (addr.street && !next.address) next.address = addr.street;
        if (addr.country && !next.country) next.country = addr.country;
        if (addr.state && !next.state_province) next.state_province = addr.state;
        if (addr.city && !next.city) next.city = addr.city;
        if (addr.postal_code && !next.postal_code) next.postal_code = addr.postal_code;
      }
      if (company.location && !next.location) next.location = company.location;
      // Default the currency from the company's country (web behaviour),
      // overriding the placeholder default. Employer can still change it.
      const derivedCurrency = currencyForCountry(addr?.country);
      if (derivedCurrency) next.salary_currency = derivedCurrency;
      return next;
    });
  }, [company]);

  // Compute all validation errors for a step's fields (required + format),
  // mirroring the web StoreJobRequest rules.
  const validateStep = (s: Step): Record<string, string> => {
    const e: Record<string, string> = {};
    const f = form;

    if (s === "basic") {
      if (!f.title?.trim()) e.title = "Job title is required.";
      else if (f.title.length > 255) e.title = "Job title cannot exceed 255 characters.";
      if (!f.category?.trim()) e.category = "Please select an industry.";
    }

    if (s === "context") {
      if (!f.experience_level) e.experience_level = "Experience level is required.";
      if (!f.job_type) e.job_type = "Please select a job type.";
      if (!f.work_arrangement) e.work_arrangement = "Work arrangement is required.";
      if (f.salary_min === undefined || `${f.salary_min}` === "")
        e.salary_min = "Minimum salary is required.";
      if (!f.salary_currency) e.salary_currency = "Currency is required.";
      if (!f.salary_type) e.salary_type = "Salary type is required.";
      Object.assign(e, salaryErrors(f));
    }

    if (s === "company") {
      if (!f.company_name?.trim()) e.company_name = "Company name is required.";
      else if (f.company_name.length > 255) e.company_name = "Company name cannot exceed 255 characters.";
      if (f.company_website && (!isUrl(f.company_website) || f.company_website.length > 255))
        e.company_website = "Enter a valid URL (https://...).";
      if (f.company_email && !isEmail(f.company_email))
        e.company_email = "Enter a valid email address.";
      if (f.company_phone && (!isPhone(f.company_phone) || f.company_phone.length > 20))
        e.company_phone = "Phone may only contain digits, spaces, - ( ) . +";
      if (f.company_values && f.company_values.length > 2000)
        e.company_values = "Company values cannot exceed 2000 characters.";
    }

    if (s === "description") {
      const len = f.description?.trim().length ?? 0;
      if (len < DESC_MIN) e.description = `Description must be at least ${DESC_MIN} characters.`;
      else if (len > 5000) e.description = "Description cannot exceed 5000 characters.";
      if (f.requirements && f.requirements.length > 2000)
        e.requirements = "Requirements cannot exceed 2000 characters.";
    }

    if (s === "skills") {
      if (!f.skills_required?.length) e.skills_required = "Add at least one required skill.";
      else if (f.skills_required.some((sk) => sk.length > 100))
        e.skills_required = "Each skill must be 100 characters or fewer.";
      if (f.skills_preferred?.some((sk) => sk.length > 100))
        e.skills_preferred = "Each skill must be 100 characters or fewer.";
      if (f.certifications?.some((c) => c.length > 100))
        e.certifications = "Each certification must be 100 characters or fewer.";
      if (f.education_level && /[0-9]/.test(f.education_level))
        e.education_level = "Education level may not contain numbers.";
    }

    if (s === "location") {
      const onsite = f.work_arrangement === "On Site" || f.work_arrangement === "Hybrid";
      if (onsite && !f.country?.trim())
        e.country = "Country is required for on-site/hybrid roles.";
      if (f.postal_code && f.postal_code.length > 20)
        e.postal_code = "Postal code cannot exceed 20 characters.";
      if (f.address && f.address.length > 500)
        e.address = "Address cannot exceed 500 characters.";
    }

    if (s === "application") {
      if (!f.application_method) e.application_method = "Application method is required.";
      if (f.application_method === "external") {
        if (!f.application_url?.trim()) e.application_url = "Application URL is required.";
        else if (!isUrl(f.application_url)) e.application_url = "Enter a valid URL (https://...).";
      }
      if (f.application_method === "email") {
        if (!f.application_email?.trim()) e.application_email = "Application email is required.";
        else if (!isEmail(f.application_email)) e.application_email = "Enter a valid email address.";
      }
      if (!f.application_deadline?.trim()) {
        e.application_deadline = "Application deadline is required.";
      } else {
        const d = new Date(f.application_deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(d.getTime())) e.application_deadline = "Enter a valid date (YYYY-MM-DD).";
        else if (d <= today) e.application_deadline = "Deadline must be in the future.";
      }
      if (f.max_applications !== undefined && `${f.max_applications}` !== "") {
        const m = toNum(f.max_applications);
        if (isNaN(m) || m < 1 || m > 10000)
          e.max_applications = "Must be between 1 and 10,000.";
      }
    }

    return e;
  };

  const goNext = () => {
    const e = validateStep(step);
    setErrors(e);
    const keys = Object.keys(e);
    if (keys.length) {
      Alert.alert("Please fix the following", e[keys[0]]);
      return;
    }
    setStep(STEPS[currentIndex + 1]);
  };

  const handlePublish = async (status: "active" | "draft") => {
    const location =
      form.location?.trim() ||
      [form.city, form.state_province, form.country].filter(Boolean).join(", ");

    if (status === "active") {
      // Validate every step; jump to the first one with an error.
      for (const s of STEPS) {
        const e = validateStep(s);
        if (Object.keys(e).length) {
          setErrors(e);
          setStep(s);
          Alert.alert("Please fix the following", e[Object.keys(e)[0]]);
          return;
        }
      }
      if (!location) {
        setStep("location");
        Alert.alert("Please fix the following", "Please provide a location.");
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

  // Live salary errors so min > max shows immediately on the Context step.
  const liveSalary = salaryErrors(form);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(employer)/(tabs)/jobs")
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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
              error={errors.category}
              onChange={(v) => updateForm({ category: v })}
            />
            <Field
              label="Job Title *"
              placeholder="e.g. Senior React Developer"
              value={form.title}
              error={errors.title}
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
              error={errors.experience_level}
              onChange={(v) => updateForm({ experience_level: v })}
            />
            <Select
              label="Job Type *"
              placeholder="Select job type"
              value={form.job_type}
              options={JOB_TYPES}
              error={errors.job_type}
              onChange={(v) => updateForm({ job_type: v })}
            />
            <Select
              label="Work Arrangement *"
              value={form.work_arrangement}
              options={WORK_ARRANGEMENTS}
              error={errors.work_arrangement}
              onChange={(v) => updateForm({ work_arrangement: v })}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="Min Salary *"
                  placeholder="30000"
                  keyboardType="numeric"
                  value={form.salary_min?.toString() ?? ""}
                  error={errors.salary_min ?? liveSalary.salary_min}
                  onChangeText={(t) => updateForm({ salary_min: t === "" ? undefined : (parseInt(t) || 0) })}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Max Salary"
                  placeholder="60000"
                  keyboardType="numeric"
                  value={form.salary_max?.toString() ?? ""}
                  error={errors.salary_max ?? liveSalary.salary_max}
                  onChangeText={(t) => updateForm({ salary_max: t === "" ? undefined : (parseInt(t) || 0) })}
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
                  error={errors.salary_currency}
                  onChange={(v) => updateForm({ salary_currency: v })}
                />
              </View>
              <View className="flex-1">
                <Select
                  label="Salary Type"
                  value={form.salary_type}
                  options={SALARY_TYPES}
                  error={errors.salary_type}
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
            {company && (
              <View className="mb-4 flex-row items-center rounded-xl bg-primary-light px-3.5 py-3">
                <Ionicons name="information-circle" size={18} color="#0064EC" />
                <Text className="ml-2 flex-1 text-xs text-primary">
                  Auto-filled from your company profile. Edit any field for this posting.
                </Text>
              </View>
            )}
            <Field
              label="Company Name *"
              placeholder="Your company name"
              value={form.company_name}
              error={errors.company_name}
              onChangeText={(t) => updateForm({ company_name: t })}
            />
            <Field
              label="Company Website"
              placeholder="https://company.com"
              keyboardType="url"
              autoCapitalize="none"
              value={form.company_website}
              error={errors.company_website}
              onChangeText={(t) => updateForm({ company_website: t })}
            />
            <Field
              label="Company Email"
              placeholder="careers@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.company_email}
              error={errors.company_email}
              onChangeText={(t) => updateForm({ company_email: t })}
            />
            <Field
              label="Company Phone"
              placeholder="+44 ..."
              keyboardType="phone-pad"
              value={form.company_phone}
              error={errors.company_phone}
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
              error={errors.company_values}
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
              error={errors.description}
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
              error={errors.requirements}
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
              error={errors.skills_required}
              onChange={(v) => updateForm({ skills_required: v })}
            />
            <ChipInput
              label="Preferred Skills"
              placeholder="Add a skill"
              value={form.skills_preferred ?? []}
              error={errors.skills_preferred}
              onChange={(v) => updateForm({ skills_preferred: v })}
            />
            <ChipInput
              label="Certifications"
              placeholder="Add a certification"
              value={form.certifications ?? []}
              error={errors.certifications}
              onChange={(v) => updateForm({ certifications: v })}
            />
            <Select
              label="Education Level"
              placeholder="Select education level"
              value={form.education_level || undefined}
              options={EDUCATION_LEVELS}
              error={errors.education_level}
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
              error={errors.address}
              onChangeText={(t) => updateForm({ address: t })}
            />
            <Field
              label={form.work_arrangement === "Remote" ? "Country" : "Country *"}
              placeholder="e.g. United Kingdom"
              value={form.country}
              error={errors.country}
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
              error={errors.postal_code}
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
              error={errors.application_method}
              onChange={(v) => updateForm({ application_method: v })}
            />
            {form.application_method === "external" && (
              <Field
                label="Application URL *"
                placeholder="https://company.com/apply"
                keyboardType="url"
                autoCapitalize="none"
                value={form.application_url}
                error={errors.application_url}
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
                error={errors.application_email}
                onChangeText={(t) => updateForm({ application_email: t })}
              />
            )}
            <Field
              label="Application Deadline *"
              placeholder="YYYY-MM-DD"
              value={form.application_deadline}
              error={errors.application_deadline}
              onChangeText={(t) => updateForm({ application_deadline: t || undefined })}
            />
            <Field
              label="Maximum Applications"
              placeholder="Leave empty for unlimited"
              keyboardType="numeric"
              value={form.max_applications?.toString() ?? ""}
              error={errors.max_applications}
              onChangeText={(t) => updateForm({ max_applications: t === "" ? undefined : (parseInt(t) || 0) })}
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
              label="I agree to the Terms of Service *"
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
