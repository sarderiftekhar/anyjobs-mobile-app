import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useJobDetail } from "../../../src/hooks/useJobs";
import { useApplyToJob } from "../../../src/hooks/useApplications";
import { useAuthStore } from "../../../src/stores/authStore";
import { Button, Card, LoadingSpinner } from "../../../src/components/ui";
import apiClient from "../../../src/api/client";

type Step = "cv" | "cover-letter" | "review";

export default function ApplyScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const insets = useSafeAreaInsets();
  const parsedJobId = parseInt(jobId!, 10);
  const user = useAuthStore((s) => s.user);

  const { data: job, isLoading: jobLoading } = useJobDetail(parsedJobId);
  const applyMutation = useApplyToJob();

  const [step, setStep] = useState<Step>("cv");
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedCvId, setSelectedCvId] = useState<number | undefined>();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleGenerateAI = async () => {
    setAiGenerating(true);
    try {
      const response = await apiClient.post("/ai/generate-cover-letter", {
        job_id: parsedJobId,
      });
      const generated = response.data?.data?.cover_letter;
      if (generated) {
        setCoverLetter(generated);
      } else {
        Alert.alert("No Result", "AI couldn't generate a cover letter. Please write one manually.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "AI generation failed. Please try again or write manually.";
      Alert.alert("AI Unavailable", msg);
    } finally {
      setAiGenerating(false);
    }
  };

  const steps: Step[] = ["cv", "cover-letter", "review"];
  const currentIndex = steps.indexOf(step);

  const handleSubmit = async () => {
    setSubmitError(null);
    try {
      await applyMutation.mutateAsync({
        job_id: parsedJobId,
        cv_id: selectedCvId,
        cover_letter: coverLetter || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit application. Please try again.";
      setSubmitError(msg);
    }
  };

  if (jobLoading) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  // Already applied screen
  if (job?.has_applied && !submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF7ED", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Ionicons name="information-circle" size={48} color="#F59E0B" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#1F2937", textAlign: "center" }}>
          Already Applied
        </Text>
        <Text style={{ fontSize: 15, color: "#6B7280", textAlign: "center", marginTop: 8, lineHeight: 22 }}>
          You have already submitted an application for {job.title} at {job.company.name}.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#574BA6", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 28 }}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(candidate)/(tabs)");
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => router.replace("/(candidate)/(tabs)/applications")}
        >
          <Text style={{ color: "#574BA6", fontSize: 14, fontWeight: "600" }}>View My Applications</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#1F2937", textAlign: "center" }}>
          Application Submitted!
        </Text>
        <Text style={{ fontSize: 15, color: "#6B7280", textAlign: "center", marginTop: 8, lineHeight: 22 }}>
          Your application for {job?.title} at {job?.company.name} has been sent successfully.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#574BA6", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 28 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => router.replace("/(candidate)/(tabs)/applications")}
        >
          <Text style={{ color: "#574BA6", fontSize: 14, fontWeight: "600" }}>View My Applications</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(candidate)/(tabs)");
          }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#1F2937" }}>Apply</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View className="flex-row px-4 pt-4">
        {steps.map((s, i) => (
          <View key={s} className="mr-2 flex-1">
            <View
              className={`h-1 rounded-full ${
                i <= currentIndex ? "bg-primary" : "bg-gray-200"
              }`}
            />
          </View>
        ))}
      </View>

      {/* Job info header */}
      {job && (
        <View className="border-b border-border px-4 py-3">
          <Text className="text-sm font-semibold text-text-primary" numberOfLines={1}>
            {job.title}
          </Text>
          <Text className="text-xs text-text-secondary">{job.company.name}</Text>
        </View>
      )}

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Step: Select CV */}
        {step === "cv" && (
          <View className="pt-6">
            <Text className="text-lg font-semibold text-text-primary">
              Select your CV
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Choose which resume to send with your application.
            </Text>

            {/* CV list - placeholder for now */}
            <Card className="mt-4 border border-primary bg-primary-light">
              <View className="flex-row items-center">
                <Ionicons name="document-text" size={24} color="#574BA6" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    {user?.name}_CV.pdf
                  </Text>
                  <Text className="text-xs text-text-secondary">Primary CV</Text>
                </View>
                <Ionicons name="checkmark-circle" size={22} color="#574BA6" />
              </View>
            </Card>

            <TouchableOpacity className="mt-3 flex-row items-center justify-center py-3">
              <Ionicons name="cloud-upload-outline" size={18} color="#574BA6" />
              <Text className="ml-2 text-sm font-medium text-primary">
                Upload a different CV
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step: Cover Letter */}
        {step === "cover-letter" && (
          <View className="pt-6">
            <Text className="text-lg font-semibold text-text-primary">
              Cover Letter
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Optional — add a personalized message to stand out.
            </Text>

            <TextInput
              className="mt-4 min-h-[200px] rounded-md border border-border bg-gray-50 p-4 text-sm text-text-primary"
              multiline
              textAlignVertical="top"
              placeholder="Write your cover letter here... Explain why you're a great fit for this role."
              placeholderTextColor="#9CA3AF"
              value={coverLetter}
              onChangeText={setCoverLetter}
            />

            <TouchableOpacity
              className="mt-3 flex-row items-center rounded-xl bg-primary-light px-4 py-3"
              onPress={handleGenerateAI}
              disabled={aiGenerating}
              activeOpacity={0.7}
              style={{ opacity: aiGenerating ? 0.6 : 1 }}
            >
              {aiGenerating ? (
                <ActivityIndicator size="small" color="#574BA6" />
              ) : (
                <Ionicons name="sparkles" size={16} color="#574BA6" />
              )}
              <Text className="ml-2 text-sm font-semibold text-primary">
                {aiGenerating ? "Generating..." : "Generate with AI"}
              </Text>
            </TouchableOpacity>

            <Text className="mt-2 text-right text-xs text-text-secondary">
              {coverLetter.length}/2000 characters
            </Text>
          </View>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <View className="pt-6">
            <Text className="text-lg font-semibold text-text-primary">
              Review Application
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Make sure everything looks good before submitting.
            </Text>

            <Card className="mt-4">
              <Text className="text-xs font-semibold uppercase text-text-secondary">
                Applying to
              </Text>
              <Text className="mt-1 text-base font-semibold text-text-primary">
                {job?.title}
              </Text>
              <Text className="text-sm text-text-secondary">{job?.company.name}</Text>
            </Card>

            <Card className="mt-3">
              <Text className="text-xs font-semibold uppercase text-text-secondary">
                Resume
              </Text>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="document-text" size={18} color="#574BA6" />
                <Text className="ml-2 text-sm text-text-primary">
                  {user?.name}_CV.pdf
                </Text>
              </View>
            </Card>

            {coverLetter.length > 0 && (
              <Card className="mt-3">
                <Text className="text-xs font-semibold uppercase text-text-secondary">
                  Cover Letter
                </Text>
                <Text className="mt-1 text-sm text-text-secondary" numberOfLines={4}>
                  {coverLetter}
                </Text>
              </Card>
            )}
          </View>
        )}
      </ScrollView>

      {/* Error message */}
      {submitError && (
        <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: "#FEF2F2", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="alert-circle" size={20} color="#DC2626" />
          <Text style={{ marginLeft: 8, flex: 1, fontSize: 14, color: "#DC2626", fontWeight: "500" }}>
            {submitError}
          </Text>
          <TouchableOpacity onPress={() => setSubmitError(null)}>
            <Ionicons name="close" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom navigation */}
      <View
        className="flex-row gap-3 border-t border-border bg-white px-4 py-3"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        {currentIndex > 0 && (
          <Button
            title="Back"
            variant="outline"
            className="flex-1"
            onPress={() => setStep(steps[currentIndex - 1])}
          />
        )}
        {currentIndex < steps.length - 1 ? (
          <Button
            title="Continue"
            className="flex-1"
            onPress={() => setStep(steps[currentIndex + 1])}
          />
        ) : (
          <Button
            title="Submit Application"
            className="flex-1"
            loading={applyMutation.isPending}
            onPress={handleSubmit}
          />
        )}
      </View>
    </View>
  );
}
