import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InterviewForm } from "../_form";
import {
  useInterview,
  useRescheduleInterview,
} from "../../../../src/hooks/useInterviews";
import { LoadingSpinner } from "../../../../src/components/ui";

export default function RescheduleInterviewScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const interviewId = parseInt(id!, 10);

  const { data: interview, isLoading } = useInterview(interviewId);
  const reschedule = useRescheduleInterview();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2230" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-semibold text-ink">
          Reschedule
        </Text>
      </View>

      {isLoading || !interview ? (
        <LoadingSpinner fullScreen />
      ) : (
        <InterviewForm
          initial={{
            title: interview.title,
            type: interview.type,
            scheduled_at: interview.scheduled_at,
            duration: interview.duration_minutes,
            meeting_link: interview.meeting_link ?? undefined,
            location: interview.location ?? undefined,
            description: interview.description ?? undefined,
          }}
          showTitleField={false}
          submitLabel="Save new time"
          submitting={reschedule.isPending}
          onSubmit={(values) => {
            reschedule.mutate(
              {
                id: interviewId,
                payload: {
                  scheduled_at: values.scheduled_at,
                  notes: values.description,
                },
              },
              {
                onSuccess: () => {
                  Alert.alert("Rescheduled", "Interview rescheduled successfully.");
                  router.back();
                },
                onError: (e: any) =>
                  Alert.alert(
                    "Error",
                    e?.response?.data?.message ??
                      "Failed to reschedule. Please try again."
                  ),
              }
            );
          }}
        />
      )}
    </View>
  );
}
