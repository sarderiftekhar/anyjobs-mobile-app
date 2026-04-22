import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCreateJob } from "../../../src/hooks/useEmployer";
import { Button, Badge } from "../../../src/components/ui";
import { AIGenerateModal } from "../../../src/components/ai/AIGenerateModal";
import type { CreateJobPayload } from "../../../src/api/employer";

type Step = "title" | "details" | "compensation" | "settings" | "review";
const STEPS: Step[] = ["title", "details", "compensation", "settings", "review"];
const STEP_TITLES: Record<Step, string> = {
  title: "Job Title & Location",
  details: "Job Details",
  compensation: "Compensation",
  settings: "Settings",
  review: "Review & Publish",
};

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "temporary"];
const WORK_ARRANGEMENTS = ["remote", "hybrid", "on-site"];

export default function CreateJobScreen() {
  const insets = useSafeAreaInsets();
  const createJob = useCreateJob();
  const [step, setStep] = useState<Step>("title");
  const [aiOpen, setAiOpen] = useState(false);
  const currentIndex = STEPS.indexOf(step);

  const [form, setForm] = useState<Partial<CreateJobPayload>>({
    title: "",
    description: "",
    location: "",
    job_type: [],
    work_arrangement: "remote",
    salary_currency: "GBP",
    salary_period: "yearly",
    skills: [],
    requirements: [],
    benefits: [],
    status: "active",
  });

  const updateForm = (updates: Partial<CreateJobPayload>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const toggleArrayItem = (key: keyof CreateJobPayload, value: string) => {
    const arr = (form[key] as string[]) ?? [];
    const updated = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    updateForm({ [key]: updated });
  };

  const handlePublish = async (status: "active" | "draft") => {
    try {
      await createJob.mutateAsync({ ...form, status } as CreateJobPayload);
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
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-text-primary">Post a Job</Text>
        <TouchableOpacity onPress={() => handlePublish("draft")}>
          <Text className="text-sm font-medium text-primary">Save Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View className="flex-row px-4 pt-4">
        {STEPS.map((s, i) => (
          <View key={s} className="mr-1.5 flex-1">
            <View className={`h-1 rounded-full ${i <= currentIndex ? "bg-primary" : "bg-gray-200"}`} />
          </View>
        ))}
      </View>
      <Text className="px-4 pt-2 text-xs text-text-secondary">
        Step {currentIndex + 1} of {STEPS.length}: {STEP_TITLES[step]}
      </Text>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        {step === "title" && (
          <>
            <Text className="mb-1.5 text-sm font-medium text-text-primary">Job Title *</Text>
            <TextInput
              className="mb-4 rounded-md border border-border px-3 py-3 text-base text-text-primary"
              placeholder="e.g. Senior React Developer"
              value={form.title}
              onChangeText={(t) => updateForm({ title: t })}
            />
            <Text className="mb-1.5 text-sm font-medium text-text-primary">Location *</Text>
            <TextInput
              className="mb-4 rounded-md border border-border px-3 py-3 text-base text-text-primary"
              placeholder="e.g. London, UK"
              value={form.location}
              onChangeText={(t) => updateForm({ location: t })}
            />
            <Text className="mb-2 text-sm font-medium text-text-primary">Work Arrangement</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {WORK_ARRANGEMENTS.map((wa) => (
                <TouchableOpacity
                  key={wa}
                  className={`rounded-full border px-4 py-2 ${form.work_arrangement === wa ? "border-primary bg-primary" : "border-border"}`}
                  onPress={() => updateForm({ work_arrangement: wa })}
                >
                  <Text className={`text-sm font-medium capitalize ${form.work_arrangement === wa ? "text-white" : "text-text-secondary"}`}>
                    {wa}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="mb-2 text-sm font-medium text-text-primary">Job Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {JOB_TYPES.map((jt) => (
                <TouchableOpacity
                  key={jt}
                  className={`rounded-full border px-4 py-2 ${(form.job_type ?? []).includes(jt) ? "border-primary bg-primary" : "border-border"}`}
                  onPress={() => toggleArrayItem("job_type", jt)}
                >
                  <Text className={`text-sm font-medium capitalize ${(form.job_type ?? []).includes(jt) ? "text-white" : "text-text-secondary"}`}>
                    {jt.replace("-", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === "details" && (
          <>
            <Text className="mb-1.5 text-sm font-medium text-text-primary">Job Description *</Text>
            <TextInput
              className="mb-4 min-h-[180px] rounded-md border border-border px-3 py-3 text-sm text-text-primary"
              placeholder="Describe the role, team, and what the candidate will do..."
              multiline
              textAlignVertical="top"
              value={form.description}
              onChangeText={(t) => updateForm({ description: t })}
            />
            <TouchableOpacity
              className="mb-4 flex-row items-center"
              onPress={() => setAiOpen(true)}
            >
              <Ionicons name="sparkles" size={16} color="#1E3A8A" />
              <Text className="ml-1.5 text-sm font-medium text-primary">Generate with AI</Text>
            </TouchableOpacity>

            <AIGenerateModal
              visible={aiOpen}
              onClose={() => setAiOpen(false)}
              seedTitle={form.title}
              seedLocation={form.location}
              seedWorkArrangement={form.work_arrangement}
              onAccept={(r) => {
                updateForm({
                  description: r.description ?? form.description,
                  requirements: r.requirements ?? form.requirements,
                  skills: r.skills ?? form.skills,
                });
                setAiOpen(false);
              }}
            />

            <Text className="mb-1.5 text-sm font-medium text-text-primary">Experience Level</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {["Entry Level", "Mid Level", "Senior", "Lead", "Executive"].map((level) => (
                <TouchableOpacity
                  key={level}
                  className={`rounded-full border px-3 py-1.5 ${form.experience_level === level ? "border-primary bg-primary" : "border-border"}`}
                  onPress={() => updateForm({ experience_level: form.experience_level === level ? undefined : level })}
                >
                  <Text className={`text-xs font-medium ${form.experience_level === level ? "text-white" : "text-text-secondary"}`}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === "compensation" && (
          <>
            <Text className="mb-2 text-sm font-medium text-text-primary">Salary Range</Text>
            <View className="mb-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-1 text-xs text-text-secondary">Min</Text>
                <TextInput
                  className="rounded-md border border-border px-3 py-3 text-base text-text-primary"
                  placeholder="30000"
                  keyboardType="numeric"
                  value={form.salary_min?.toString() ?? ""}
                  onChangeText={(t) => updateForm({ salary_min: parseInt(t) || undefined })}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs text-text-secondary">Max</Text>
                <TextInput
                  className="rounded-md border border-border px-3 py-3 text-base text-text-primary"
                  placeholder="60000"
                  keyboardType="numeric"
                  value={form.salary_max?.toString() ?? ""}
                  onChangeText={(t) => updateForm({ salary_max: parseInt(t) || undefined })}
                />
              </View>
            </View>

            <Text className="mb-1.5 text-sm font-medium text-text-primary">Benefits</Text>
            <TextInput
              className="mb-2 rounded-md border border-border px-3 py-3 text-sm text-text-primary"
              placeholder="Add a benefit and press enter"
              onSubmitEditing={(e) => {
                const val = e.nativeEvent.text.trim();
                if (val) {
                  updateForm({ benefits: [...(form.benefits ?? []), val] });
                  (e.target as any).clear?.();
                }
              }}
            />
            <View className="flex-row flex-wrap gap-1.5">
              {(form.benefits ?? []).map((b, i) => (
                <TouchableOpacity key={i} onPress={() => updateForm({ benefits: form.benefits?.filter((_, j) => j !== i) })}>
                  <Badge text={`${b} ✕`} variant="success" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === "settings" && (
          <>
            <Text className="mb-1.5 text-sm font-medium text-text-primary">Application Deadline</Text>
            <TextInput
              className="mb-4 rounded-md border border-border px-3 py-3 text-base text-text-primary"
              placeholder="YYYY-MM-DD (optional)"
              value={form.application_deadline ?? ""}
              onChangeText={(t) => updateForm({ application_deadline: t || undefined })}
            />

            <TouchableOpacity
              className="mb-3 flex-row items-center justify-between rounded-md border border-border p-4"
              onPress={() => updateForm({ is_featured: !form.is_featured })}
            >
              <View>
                <Text className="text-sm font-medium text-text-primary">Featured Job</Text>
                <Text className="text-xs text-text-secondary">Highlight at the top of search results</Text>
              </View>
              <Ionicons name={form.is_featured ? "checkbox" : "square-outline"} size={24} color="#1E3A8A" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between rounded-md border border-border p-4"
              onPress={() => updateForm({ is_urgent: !form.is_urgent })}
            >
              <View>
                <Text className="text-sm font-medium text-text-primary">Urgent Hiring</Text>
                <Text className="text-xs text-text-secondary">Mark as urgent to attract more applicants</Text>
              </View>
              <Ionicons name={form.is_urgent ? "checkbox" : "square-outline"} size={24} color="#1E3A8A" />
            </TouchableOpacity>
          </>
        )}

        {step === "review" && (
          <>
            <View className="rounded-md border border-border p-4">
              <Text className="text-xl font-bold text-text-primary">{form.title || "Untitled"}</Text>
              <Text className="mt-1 text-sm text-text-secondary">{form.location} · {form.work_arrangement}</Text>
              {form.job_type && form.job_type.length > 0 && (
                <View className="mt-2 flex-row flex-wrap gap-1">
                  {form.job_type.map((t) => <Badge key={t} text={t.replace("-", " ")} variant="primary" />)}
                </View>
              )}
              {form.salary_min && form.salary_max && (
                <Text className="mt-2 text-sm font-medium text-text-primary">
                  £{form.salary_min.toLocaleString()} - £{form.salary_max.toLocaleString()}/yr
                </Text>
              )}
              {form.experience_level && (
                <Text className="mt-1 text-sm text-text-secondary">{form.experience_level}</Text>
              )}
              {form.description && (
                <Text className="mt-3 text-sm text-text-secondary" numberOfLines={5}>{form.description}</Text>
              )}
              {form.is_featured && <Badge text="Featured" variant="warning" />}
              {form.is_urgent && <Badge text="Urgent" variant="danger" />}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View className="flex-row gap-3 border-t border-border bg-white px-4 py-3" style={{ paddingBottom: insets.bottom + 8 }}>
        {currentIndex > 0 && (
          <Button title="Back" variant="outline" className="flex-1" onPress={() => setStep(STEPS[currentIndex - 1])} />
        )}
        {currentIndex < STEPS.length - 1 ? (
          <Button title="Continue" className="flex-1" onPress={() => setStep(STEPS[currentIndex + 1])} />
        ) : (
          <Button title="Publish Job" className="flex-1" loading={createJob.isPending} onPress={() => handlePublish("active")} />
        )}
      </View>
    </View>
  );
}
