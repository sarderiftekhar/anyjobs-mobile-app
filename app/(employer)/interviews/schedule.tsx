import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InterviewForm } from "./_form";
import { useScheduleInterview } from "../../../src/hooks/useInterviews";

export default function ScheduleInterviewScreen() {
  const insets = useSafeAreaInsets();
  const { applicationId } = useLocalSearchParams<{ applicationId?: string }>();
  const applicationIdNum = applicationId ? parseInt(applicationId, 10) : undefined;

  const schedule = useScheduleInterview();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">
          Schedule Interview
        </Text>
      </View>

      {!applicationIdNum ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text className="mt-3 text-center text-sm text-ink-muted">
            Open this screen from an applicant to schedule an interview.
          </Text>
        </View>
      ) : (
        <InterviewForm
          submitLabel="Schedule Interview"
          submitting={schedule.isPending}
          onSubmit={(values) => {
            schedule.mutate(
              { ...values, job_application_id: applicationIdNum },
              {
                onSuccess: () => {
                  Alert.alert("Scheduled", "Interview scheduled successfully.");
                  router.replace("/(employer)/interviews");
                },
                onError: (e: any) =>
                  Alert.alert(
                    "Error",
                    e?.response?.data?.message ??
                      "Failed to schedule interview. Please try again."
                  ),
              }
            );
          }}
        />
      )}
    </View>
  );
}
